package web

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/a-h/templ"
	"github.com/gorilla/mux"
	"github.com/suppers-ai/dufflebagbase/services"
	"github.com/suppers-ai/dufflebagbase/utils"
	"github.com/suppers-ai/dufflebagbase/views/pages"
	"github.com/suppers-ai/logger"
)

// convertToColumnInfo converts column names to ColumnInfo
func convertToColumnInfo(columns []string) []pages.ColumnInfo {
	result := make([]pages.ColumnInfo, len(columns))
	for i, col := range columns {
		result[i] = pages.ColumnInfo{
			Name:      col,
			Type:      "text", // Default type, you'd normally get this from database
			Nullable:  true,
			IsPrimary: col == "id",
		}
	}
	return result
}

// DatabasePage renders the database management page
func DatabasePage(svc *services.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get authboss session store
		store := svc.Auth().SessionStore()
		session, _ := store.Get(r, "dufflebag-session")
		userEmail, _ := session.Values["user_email"].(string)
		
		ctx := context.Background()
		
		// Get selected table from query params
		selectedSchema := r.URL.Query().Get("schema")
		if selectedSchema == "" {
			selectedSchema = "public"
		}
		selectedTable := r.URL.Query().Get("table")
		
		// Validate schema and table names to prevent SQL injection
		if selectedSchema != "" {
			if err := utils.ValidateSchemaName(selectedSchema); err != nil {
				svc.Logger().Error(ctx, "Invalid schema name", 
					logger.String("schema", selectedSchema),
					logger.Err(err))
				http.Error(w, "Invalid schema name", http.StatusBadRequest)
				return
			}
		}
		if selectedTable != "" {
			if err := utils.ValidateTableName(selectedTable); err != nil {
				svc.Logger().Error(ctx, "Invalid table name", 
					logger.String("table", selectedTable),
					logger.Err(err))
				http.Error(w, "Invalid table name", http.StatusBadRequest)
				return
			}
		}
		
		// Get pagination params
		page := 1
		if p := r.URL.Query().Get("page"); p != "" {
			if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
				page = parsed
			}
		}
		
		pageSize := 50 // Changed to 50 rows per page
		offset := (page - 1) * pageSize
		
		// Get all collections
		collections, err := svc.Collections().ListCollectionInfo(ctx)
		if err != nil {
			svc.Logger().Error(ctx, "Failed to list collections", logger.Err(err))
			collections = []services.CollectionInfo{}
		}
		
		var tableData []map[string]interface{}
		var tableColumns []string
		totalRecords := 0
		
		// If a table is selected, get its data using SQL query
		if selectedTable != "" {
			// Get total count with safe table reference
			safeTable, err := utils.SafeSchemaTable(selectedSchema, selectedTable)
			if err != nil {
				svc.Logger().Error(ctx, "Failed to construct safe table reference", logger.Err(err))
				http.Error(w, "Invalid table reference", http.StatusBadRequest)
				return
			}
			// Count query doesn't need parameters since it has no user input values
			countQuery := fmt.Sprintf("SELECT COUNT(*) FROM %s", safeTable)
			err = svc.Database().QueryRow(ctx, countQuery).Scan(&totalRecords)
			if err != nil {
				svc.Logger().Error(ctx, "Failed to get row count", 
					logger.String("table", selectedTable),
					logger.Err(err))
			}
			
			// Execute SELECT query with pagination using safe table reference
			// Use parameterized query for LIMIT and OFFSET
			query := fmt.Sprintf("SELECT * FROM %s ORDER BY 1 LIMIT $1 OFFSET $2", safeTable)
			
			rows, err := svc.Database().Query(ctx, query, pageSize, offset)
			if err != nil {
				svc.Logger().Error(ctx, "Failed to query table", 
					logger.String("table", selectedTable),
					logger.Err(err))
			} else {
				defer rows.Close()
				
				// Get column names
				columns, err := rows.Columns()
				if err != nil {
					svc.Logger().Error(ctx, "Failed to get columns", logger.Err(err))
				} else {
					tableColumns = columns
					
					// Prepare value holders
					values := make([]interface{}, len(columns))
					valuePtrs := make([]interface{}, len(columns))
					for i := range values {
						valuePtrs[i] = &values[i]
					}
					
					// Fetch rows
					for rows.Next() {
						if err := rows.Scan(valuePtrs...); err != nil {
							continue
						}
						
						row := make(map[string]interface{})
						for i, col := range columns {
							val := values[i]
							// Handle byte arrays
							if b, ok := val.([]byte); ok {
								row[col] = string(b)
							} else {
								row[col] = val
							}
						}
						tableData = append(tableData, row)
					}
				}
			}
		}
		
		// Create schemas data structure
		schemas := []pages.SchemaInfo{
			{
				Name: "public",
				Tables: func() []string {
					tables := []string{}
					for _, col := range collections {
						tables = append(tables, col.Name)
					}
					return tables
				}(),
			},
			{
				Name: "auth",
				Tables: []string{"users", "sessions"},
			},
			{
				Name: "storage",
				Tables: []string{"objects", "buckets"},
			},
		}
		
		// Create table detail if a table is selected
		var tableDetail *pages.TableDetail
		if selectedTable != "" {
			tableDetail = &pages.TableDetail{
				Schema:   selectedSchema,
				Name:     selectedTable,
				Columns:  convertToColumnInfo(tableColumns),
				Rows:     tableData,
				Total:    totalRecords,
				Page:     page,
				PageSize: pageSize,
			}
		}
		
		data := pages.DatabasePageData{
			UserEmail:     userEmail,
			Schemas:       schemas,
			SelectedTable: tableDetail,
		}
		
		// Check if this is an HTMX request
		var component templ.Component
		if utils.IsHTMXRequest(r) {
			component = pages.DatabasePartial(data)
		} else {
			component = pages.DatabasePage(data)
		}
		Render(w, r, component)
	}
}

// InsertRowHandler handles inserting new rows into a table
func InsertRowHandler(svc *services.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := context.Background()
		
		var req struct {
			Table string                 `json:"table"`
			Data  map[string]interface{} `json:"data"`
		}
		
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		
		if req.Table == "" {
			http.Error(w, "Table name is required", http.StatusBadRequest)
			return
		}
		
		// Validate table name and extract schema if present
		var schema, table string
		if strings.Contains(req.Table, ".") {
			parts := strings.SplitN(req.Table, ".", 2)
			schema = parts[0]
			table = parts[1]
		} else {
			schema = "public"
			table = req.Table
		}
		
		safeTable, err := utils.SafeSchemaTable(schema, table)
		if err != nil {
			svc.Logger().Error(ctx, "Invalid table reference", logger.Err(err))
			http.Error(w, "Invalid table name", http.StatusBadRequest)
			return
		}
		
		// Build INSERT query with validated columns
		columns := []string{}
		values := []interface{}{}
		placeholders := []string{}
		i := 1
		
		for col, val := range req.Data {
			// Validate column name
			if err := utils.ValidateSQLIdentifier(col); err != nil {
				svc.Logger().Error(ctx, "Invalid column name", 
					logger.String("column", col),
					logger.Err(err))
				http.Error(w, fmt.Sprintf("Invalid column name: %s", col), http.StatusBadRequest)
				return
			}
			columns = append(columns, col)
			values = append(values, val)
			placeholders = append(placeholders, fmt.Sprintf("$%d", i))
			i++
		}
		
		// Quote columns safely
		quotedColumns, err := utils.QuoteColumns(columns)
		if err != nil {
			svc.Logger().Error(ctx, "Failed to quote columns", logger.Err(err))
			http.Error(w, "Invalid column names", http.StatusBadRequest)
			return
		}
		
		query := fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s) RETURNING id",
			safeTable,
			strings.Join(quotedColumns, ", "),
			strings.Join(placeholders, ", "))
		
		var id int64
		rows, err := svc.Database().Query(ctx, query, values...)
		if err != nil {
			svc.Logger().Error(ctx, "Failed to insert row", logger.Err(err))
			http.Error(w, "Failed to insert row", http.StatusInternalServerError)
			return
		}
		defer rows.Close()
		
		if rows.Next() {
			rows.Scan(&id)
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Row inserted successfully",
			"id":      id,
		})
	}
}

// UpdateCellHandler handles updating individual cells in a table
func UpdateCellHandler(svc *services.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := context.Background()
		
		var req struct {
			Table  string      `json:"table"`
			ID     interface{} `json:"id"`
			Column string      `json:"column"`
			Value  interface{} `json:"value"`
		}
		
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		
		if req.Table == "" || req.ID == nil || req.Column == "" {
			http.Error(w, "Table, ID, and column are required", http.StatusBadRequest)
			return
		}
		
		// Validate table and column names
		var schema, table string
		if strings.Contains(req.Table, ".") {
			parts := strings.SplitN(req.Table, ".", 2)
			schema = parts[0]
			table = parts[1]
		} else {
			schema = "public"
			table = req.Table
		}
		
		safeTable, err := utils.SafeSchemaTable(schema, table)
		if err != nil {
			svc.Logger().Error(ctx, "Invalid table reference", logger.Err(err))
			http.Error(w, "Invalid table name", http.StatusBadRequest)
			return
		}
		
		quotedColumn, err := utils.QuoteIdentifier(req.Column)
		if err != nil {
			svc.Logger().Error(ctx, "Invalid column name", logger.Err(err))
			http.Error(w, "Invalid column name", http.StatusBadRequest)
			return
		}
		
		query := fmt.Sprintf("UPDATE %s SET %s = $1 WHERE id = $2",
			safeTable, quotedColumn)
		
		_, err = svc.Database().Exec(ctx, query, req.Value, req.ID)
		if err != nil {
			svc.Logger().Error(ctx, "Failed to update cell", logger.Err(err))
			http.Error(w, "Failed to update cell", http.StatusInternalServerError)
			return
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Cell updated successfully"})
	}
}

// DeleteRowHandler handles deleting rows from a table
func DeleteRowHandler(svc *services.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := context.Background()
		
		vars := mux.Vars(r)
		id := vars["id"]
		
		table := r.URL.Query().Get("table")
		if table == "" {
			http.Error(w, "Table name is required", http.StatusBadRequest)
			return
		}
		
		// Validate table name
		var schema, tableName string
		if strings.Contains(table, ".") {
			parts := strings.SplitN(table, ".", 2)
			schema = parts[0]
			tableName = parts[1]
		} else {
			schema = "public"
			tableName = table
		}
		
		safeTable, err := utils.SafeSchemaTable(schema, tableName)
		if err != nil {
			svc.Logger().Error(ctx, "Invalid table reference", logger.Err(err))
			http.Error(w, "Invalid table name", http.StatusBadRequest)
			return
		}
		
		query := fmt.Sprintf("DELETE FROM %s WHERE id = $1", safeTable)
		
		_, err = svc.Database().Exec(ctx, query, id)
		if err != nil {
			svc.Logger().Error(ctx, "Failed to delete row", logger.Err(err))
			http.Error(w, "Failed to delete row", http.StatusInternalServerError)
			return
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Row deleted successfully"})
	}
}

// DuplicateRowHandler handles duplicating rows in a table
func DuplicateRowHandler(svc *services.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := context.Background()
		
		var req struct {
			Table string      `json:"table"`
			ID    interface{} `json:"id"`
		}
		
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		
		if req.Table == "" || req.ID == nil {
			http.Error(w, "Table and ID are required", http.StatusBadRequest)
			return
		}
		
		// Validate table name
		var schema, table string
		if strings.Contains(req.Table, ".") {
			parts := strings.SplitN(req.Table, ".", 2)
			schema = parts[0]
			table = parts[1]
		} else {
			schema = "public"
			table = req.Table
		}
		
		safeTable, err := utils.SafeSchemaTable(schema, table)
		if err != nil {
			svc.Logger().Error(ctx, "Invalid table reference", logger.Err(err))
			http.Error(w, "Invalid table name", http.StatusBadRequest)
			return
		}
		
		// Get the row to duplicate
		selectQuery := fmt.Sprintf("SELECT * FROM %s WHERE id = $1", safeTable)
		rows, err := svc.Database().Query(ctx, selectQuery, req.ID)
		if err != nil {
			svc.Logger().Error(ctx, "Failed to select row", logger.Err(err))
			http.Error(w, "Failed to duplicate row", http.StatusInternalServerError)
			return
		}
		defer rows.Close()
		
		if !rows.Next() {
			http.Error(w, "Row not found", http.StatusNotFound)
			return
		}
		
		// For simplicity, we'll duplicate all columns except id
		// In a real implementation, you'd need to know the table schema
		http.Error(w, "Row duplication not implemented", http.StatusNotImplemented)
		return
	}
}

// CreateTableHandler handles creating new tables
func CreateTableHandler(svc *services.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := context.Background()
		
		var req struct {
			Schema  string `json:"schema"`
			Table   string `json:"table"`
			Columns []struct {
				Name     string `json:"name"`
				Type     string `json:"type"`
				Primary  bool   `json:"primary"`
				Nullable bool   `json:"nullable"`
				Unique   bool   `json:"unique"`
				Default  string `json:"default"`
			} `json:"columns"`
		}
		
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		
		if req.Table == "" || len(req.Columns) == 0 {
			http.Error(w, "Table name and columns are required", http.StatusBadRequest)
			return
		}
		
		// Validate schema and table names
		if req.Schema == "" {
			req.Schema = "public"
		}
		safeTable, err := utils.SafeSchemaTable(req.Schema, req.Table)
		if err != nil {
			svc.Logger().Error(ctx, "Invalid table reference", logger.Err(err))
			http.Error(w, "Invalid schema or table name", http.StatusBadRequest)
			return
		}
		
		// Build CREATE TABLE query
		var columnDefs []string
		var primaryKeys []string
		
		for _, col := range req.Columns {
			// Validate column name
			if err := utils.ValidateSQLIdentifier(col.Name); err != nil {
				svc.Logger().Error(ctx, "Invalid column name", 
					logger.String("column", col.Name),
					logger.Err(err))
				http.Error(w, fmt.Sprintf("Invalid column name: %s", col.Name), http.StatusBadRequest)
				return
			}
			
			quotedCol, _ := utils.QuoteIdentifier(col.Name)
			def := fmt.Sprintf("%s %s", quotedCol, col.Type)
			
			if col.Primary {
				if col.Type == "SERIAL" {
					def = fmt.Sprintf("%s SERIAL", quotedCol)
				}
				primaryKeys = append(primaryKeys, quotedCol)
			}
			
			if col.Default != "" {
				def += fmt.Sprintf(" DEFAULT %s", col.Default)
			}
			
			if !col.Nullable && !col.Primary {
				def += " NOT NULL"
			}
			
			if col.Unique && !col.Primary {
				def += " UNIQUE"
			}
			
			columnDefs = append(columnDefs, def)
		}
		
		// Add primary key constraint
		if len(primaryKeys) > 0 {
			columnDefs = append(columnDefs, fmt.Sprintf("PRIMARY KEY (%s)", strings.Join(primaryKeys, ", ")))
		}
		
		// Construct the full query with safe table reference
		query := fmt.Sprintf("CREATE TABLE %s (\n  %s\n)",
			safeTable, strings.Join(columnDefs, ",\n  "))
		
		// Execute the query
		db := svc.Database().GetDB()
		_, err = db.ExecContext(ctx, query)
		if err != nil {
			svc.Logger().Error(ctx, "Failed to create table", 
				logger.String("query", query),
				logger.Err(err))
			http.Error(w, fmt.Sprintf("Failed to create table: %v", err), http.StatusInternalServerError)
			return
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message": fmt.Sprintf("Table %s.%s created successfully", req.Schema, req.Table),
		})
	}
}

// ExecuteQueryHandler handles executing custom SQL queries (read-only)
func ExecuteQueryHandler(svc *services.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := context.Background()
		
		var req struct {
			Query string `json:"query"`
		}
		
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}
		
		if req.Query == "" {
			http.Error(w, "Query is required", http.StatusBadRequest)
			return
		}
		
		// Only allow SELECT queries for security
		query := strings.TrimSpace(strings.ToUpper(req.Query))
		if !strings.HasPrefix(query, "SELECT") && !strings.HasPrefix(query, "WITH") {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]string{
				"error": "Only SELECT queries are allowed",
			})
			return
		}
		
		// Execute the query using the standard SQL interface
		db := svc.Database().GetDB()
		rows, err := db.QueryContext(ctx, req.Query)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]string{
				"error": err.Error(),
			})
			return
		}
		defer rows.Close()
		
		// Get column names
		columns, err := rows.Columns()
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]string{
				"error": err.Error(),
			})
			return
		}
		
		// Prepare value holders
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))
		for i := range values {
			valuePtrs[i] = &values[i]
		}
		
		// Collect results
		results := []map[string]interface{}{}
		for rows.Next() {
			if err := rows.Scan(valuePtrs...); err != nil {
				continue
			}
			
			row := make(map[string]interface{})
			for i, col := range columns {
				val := values[i]
				// Handle byte arrays (common in PostgreSQL)
				if b, ok := val.([]byte); ok {
					row[col] = string(b)
				} else {
					row[col] = val
				}
			}
			results = append(results, row)
		}
		
		// Return results
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(results)
	}
}
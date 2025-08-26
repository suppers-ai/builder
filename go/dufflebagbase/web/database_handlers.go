package web

import (
	"context"
	"net/http"
	"strconv"

	"github.com/suppers-ai/dufflebagbase/services"
	"github.com/suppers-ai/dufflebagbase/views/pages"
	"github.com/suppers-ai/logger"
)

// DatabasePage renders the database management page
func DatabasePage(svc *services.Service) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get authboss session store
		store := svc.Auth().SessionStore()
		session, _ := store.Get(r, "dufflebag-session")
		userEmail, _ := session.Values["user_email"].(string)
		
		ctx := context.Background()
		
		// Get selected table from query params
		selectedTable := r.URL.Query().Get("table")
		
		// Get pagination params
		page := 1
		if p := r.URL.Query().Get("page"); p != "" {
			if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
				page = parsed
			}
		}
		
		pageSize := 20
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
		
		// If a table is selected, get its data
		if selectedTable != "" {
			// Get table data
			data, total, err := svc.Collections().GetCollectionData(ctx, selectedTable, offset, pageSize)
			if err != nil {
				svc.Logger().Error(ctx, "Failed to get collection data", 
					logger.String("collection", selectedTable),
					logger.Err(err))
			} else {
				tableData = data
				totalRecords = total
				
				// Extract column names from first record
				if len(data) > 0 {
					for key := range data[0] {
						if key != "id" && key != "created_at" && key != "updated_at" {
							tableColumns = append(tableColumns, key)
						}
					}
				}
			}
		}
		
		data := pages.DatabasePageData{
			UserEmail:     userEmail,
			Collections:   collections,
			SelectedTable: selectedTable,
			TableData:     tableData,
			TableColumns:  tableColumns,
			TotalRecords:  totalRecords,
			CurrentPage:   page,
			PageSize:      pageSize,
		}
		
		component := pages.DatabasePage(data)
		Render(w, r, component)
	}
}
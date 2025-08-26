package web

import (
	"context"
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"os"
	"strings"
	"time"

	"formulapricing/auth"
	"formulapricing/database"
	"formulapricing/models"
)

//go:embed templates/*.html static/*
var templateFS embed.FS

// Store each page template separately to avoid conflicts
var (
	loginTemplate        *template.Template
	dashboardTemplate    *template.Template
	variablesTemplate    *template.Template
	calculationsTemplate *template.Template
	conditionsTemplate   *template.Template
	pricingTemplate      *template.Template
	calculateTemplate    *template.Template
	usersTemplate        *template.Template
	purchasesTemplate    *template.Template
)

func init() {
	var err error
	
	// Parse login template with base
	loginTemplate, err = template.ParseFS(templateFS, "templates/base.html", "templates/login.html")
	if err != nil {
		panic(fmt.Sprintf("Failed to parse login template: %v", err))
	}
	
	// Parse dashboard template with base
	dashboardTemplate, err = template.ParseFS(templateFS, "templates/base.html", "templates/dashboard.html")
	if err != nil {
		panic(fmt.Sprintf("Failed to parse dashboard template: %v", err))
	}
	
	// Parse variables template with base
	variablesTemplate, err = template.ParseFS(templateFS, "templates/base.html", "templates/variables.html")
	if err != nil {
		panic(fmt.Sprintf("Failed to parse variables template: %v", err))
	}
	
	// Parse calculations template with base
	calculationsTemplate, err = template.ParseFS(templateFS, "templates/base.html", "templates/calculations.html")
	if err != nil {
		panic(fmt.Sprintf("Failed to parse calculations template: %v", err))
	}
	
	// Parse conditions template with base
	conditionsTemplate, err = template.ParseFS(templateFS, "templates/base.html", "templates/conditions.html")
	if err != nil {
		panic(fmt.Sprintf("Failed to parse conditions template: %v", err))
	}
	
	// Parse pricing template with base
	pricingTemplate, err = template.ParseFS(templateFS, "templates/base.html", "templates/pricing.html")
	if err != nil {
		panic(fmt.Sprintf("Failed to parse pricing template: %v", err))
	}
	
	// Parse calculate template with base
	calculateTemplate, err = template.ParseFS(templateFS, "templates/base.html", "templates/calculate.html")
	if err != nil {
		panic(fmt.Sprintf("Failed to parse calculate template: %v", err))
	}
	
	// Parse users template with base
	usersTemplate, err = template.ParseFS(templateFS, "templates/base.html", "templates/users.html")
	if err != nil {
		panic(fmt.Sprintf("Failed to parse users template: %v", err))
	}
	
	// Parse purchases template with base
	purchasesTemplate, err = template.ParseFS(templateFS, "templates/base.html", "templates/purchases.html")
	if err != nil {
		panic(fmt.Sprintf("Failed to parse purchases template: %v", err))
	}
}

type PageData struct {
	Title       string
	Tab         string
	UserEmail   string
	UserRole    string
	Error       string
	Collections []CollectionInfo
	Logs        []models.Log
	LogStats    map[string]interface{}
	DatabaseURL string
	Port        string
}

type CollectionInfo struct {
	Name  string
	Type  string
	Count int
}

func LoginPage(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		// If already authenticated, redirect to dashboard
		if auth.IsAuthenticated(r) {
			http.Redirect(w, r, "/dashboard", http.StatusSeeOther)
			return
		}
		
		// Prevent caching of login page
		w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")
		
		data := PageData{Title: "Login"}
		err := loginTemplate.ExecuteTemplate(w, "base.html", data)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	if r.Method == "POST" {
		email := r.FormValue("email")
		password := r.FormValue("password")
		
		// Clear any invalid existing session first
		auth.ClearSession(w, r)

		user, err := models.GetUserByEmail(email)
		if err != nil {
			data := PageData{Title: "Login", Error: "Database error"}
			loginTemplate.ExecuteTemplate(w, "base.html", data)
			return
		}

		if user == nil {
			data := PageData{Title: "Login", Error: "Invalid credentials"}
			loginTemplate.ExecuteTemplate(w, "base.html", data)
			return
		}

		if !user.CheckPassword(password) {
			data := PageData{Title: "Login", Error: "Invalid credentials"}
			loginTemplate.ExecuteTemplate(w, "base.html", data)
			return
		}

		// Set session - this must happen before any response is written
		err = auth.SetUserSession(w, r, user.ID, user.Email, user.Role)
		if err != nil {
			data := PageData{Title: "Login", Error: "Failed to create session"}
			loginTemplate.ExecuteTemplate(w, "base.html", data)
			return
		}

		// Log the login (do this async so it doesn't interfere with redirect)
		go func() {
			loginLog := &models.Log{
				Level:  "INFO",
				Method: "POST",
				Path:   "/login",
				UserID: &user.ID,
			}
			models.CreateLog(loginLog)
		}()

		// Redirect to dashboard
		http.Redirect(w, r, "/dashboard", http.StatusSeeOther)
		return
	}
}

func Logout(w http.ResponseWriter, r *http.Request) {
	auth.ClearSession(w, r)
	http.Redirect(w, r, "/login", http.StatusSeeOther)
}

func Dashboard(w http.ResponseWriter, r *http.Request) {
	// Prevent caching of dashboard
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
	
	session, _ := auth.GetSession(r)
	email, _ := session.Values["email"].(string)
	role, _ := session.Values["role"].(string)

	// Get collection counts
	collections := getCollectionInfo()

	data := PageData{
		Title:       "Dashboard",
		Tab:         "dashboard",
		UserEmail:   email,
		UserRole:    role,
		Collections: collections,
	}

	// Use the properly parsed dashboard template
	err := dashboardTemplate.ExecuteTemplate(w, "base.html", data)
	if err != nil {
		http.Error(w, fmt.Sprintf("Template error: %v", err), http.StatusInternalServerError)
	}
}

func DashboardLogs(w http.ResponseWriter, r *http.Request) {
	session, _ := auth.GetSession(r)
	email, _ := session.Values["email"].(string)
	role, _ := session.Values["role"].(string)

	// Get recent logs
	logs, err := models.GetRecentLogs(100)
	if err != nil {
		logs = []models.Log{}
	}

	// Get log stats
	stats, err := models.GetLogStats()
	if err != nil {
		stats = make(map[string]interface{})
	}

	// Add today's count
	var todayCount int
	today := time.Now().Format("2006-01-02")
	ctx := context.Background()
	row := database.DB.QueryRow(ctx, `
		SELECT COUNT(*) FROM formulapricing.logs 
		WHERE DATE(created_at) = $1
	`, today)
	err = row.Scan(&todayCount)
	if err == nil {
		stats["today"] = todayCount
	}

	data := PageData{
		Title:    "Logs",
		Tab:      "logs",
		UserEmail: email,
		UserRole: role,
		Logs:     logs,
		LogStats: stats,
	}

	err = dashboardTemplate.ExecuteTemplate(w, "base.html", data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func DashboardSettings(w http.ResponseWriter, r *http.Request) {
	session, _ := auth.GetSession(r)
	email, _ := session.Values["email"].(string)
	role, _ := session.Values["role"].(string)

	data := PageData{
		Title:       "Settings",
		Tab:         "settings",
		UserEmail:   email,
		UserRole:    role,
		DatabaseURL: os.Getenv("DATABASE_URL"),
		Port:        os.Getenv("PORT"),
	}

	if data.Port == "" {
		data.Port = "8080"
	}

	err := dashboardTemplate.ExecuteTemplate(w, "base.html", data)
	if err != nil {
		fmt.Printf("Dashboard template error: %v\n", err)
		http.Error(w, fmt.Sprintf("Template error: %v", err), http.StatusInternalServerError)
	} else {
		fmt.Printf("Dashboard template rendered successfully\n")
	}
}

// ServeStatic serves embedded static files (JS, CSS, SVG, etc.)
func ServeStatic(w http.ResponseWriter, r *http.Request) {
	// Get the file path from URL
	filePath := "static" + r.URL.Path[len("/static"):]
	
	// Read the file from embedded FS
	data, err := templateFS.ReadFile(filePath)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	
	// Set content type based on file extension
	if strings.HasSuffix(filePath, ".js") {
		w.Header().Set("Content-Type", "application/javascript")
	} else if strings.HasSuffix(filePath, ".css") {
		w.Header().Set("Content-Type", "text/css")
	} else if strings.HasSuffix(filePath, ".svg") {
		w.Header().Set("Content-Type", "image/svg+xml")
	} else if strings.HasSuffix(filePath, ".png") {
		w.Header().Set("Content-Type", "image/png")
	} else if strings.HasSuffix(filePath, ".jpg") || strings.HasSuffix(filePath, ".jpeg") {
		w.Header().Set("Content-Type", "image/jpeg")
	}
	
	// Cache static assets
	w.Header().Set("Cache-Control", "public, max-age=3600")
	
	w.Write(data)
}

func getCollectionInfo() []CollectionInfo {
	collections := []CollectionInfo{}
	
	// Get counts from database
	var variableCount, calculationCount, conditionCount, pricingCount int
	
	ctx := context.Background()
	database.DB.QueryRow(ctx, "SELECT COUNT(*) FROM formulapricing.variables").Scan(&variableCount)
	database.DB.QueryRow(ctx, "SELECT COUNT(*) FROM formulapricing.calculations").Scan(&calculationCount)
	database.DB.QueryRow(ctx, "SELECT COUNT(*) FROM formulapricing.conditions").Scan(&conditionCount)
	database.DB.QueryRow(ctx, "SELECT COUNT(*) FROM formulapricing.pricing").Scan(&pricingCount)
	
	collections = append(collections, 
		CollectionInfo{Name: "variables", Type: "Base Collection", Count: variableCount},
		CollectionInfo{Name: "calculations", Type: "Base Collection", Count: calculationCount},
		CollectionInfo{Name: "conditions", Type: "Base Collection", Count: conditionCount},
		CollectionInfo{Name: "pricing", Type: "Base Collection", Count: pricingCount},
	)
	
	return collections
}

// Variables Management
func VariablesPage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
	
	session, _ := auth.GetSession(r)
	email, _ := session.Values["email"].(string)
	role, _ := session.Values["role"].(string)
	
	// Get all variables from database
	variables, _ := models.GetAllVariables()
	
	data := struct {
		PageData
		Variables []models.Variable
	}{
		PageData: PageData{
			Title:     "Variables",
			Tab:       "variables",
			UserEmail: email,
			UserRole:  role,
		},
		Variables: variables,
	}
	
	if err := variablesTemplate.ExecuteTemplate(w, "base.html", data); err != nil {
		http.Error(w, fmt.Sprintf("Template error: %v", err), http.StatusInternalServerError)
	}
}

// Calculations Management
func CalculationsPage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
	
	session, _ := auth.GetSession(r)
	email, _ := session.Values["email"].(string)
	role, _ := session.Values["role"].(string)
	
	// Get all calculations from database
	calculations, _ := models.GetAllCalculations()
	
	data := struct {
		PageData
		Calculations []models.Calculation
	}{
		PageData: PageData{
			Title:     "Calculations",
			Tab:       "calculations",
			UserEmail: email,
			UserRole:  role,
		},
		Calculations: calculations,
	}
	
	if err := calculationsTemplate.ExecuteTemplate(w, "base.html", data); err != nil {
		http.Error(w, fmt.Sprintf("Template error: %v", err), http.StatusInternalServerError)
	}
}

// Conditions Management
func ConditionsPage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
	
	session, _ := auth.GetSession(r)
	email, _ := session.Values["email"].(string)
	role, _ := session.Values["role"].(string)
	
	// Get all conditions from database
	conditions, _ := models.GetAllConditions()
	
	data := struct {
		PageData
		Conditions []models.Condition
	}{
		PageData: PageData{
			Title:     "Conditions",
			Tab:       "conditions",
			UserEmail: email,
			UserRole:  role,
		},
		Conditions: conditions,
	}
	
	if err := conditionsTemplate.ExecuteTemplate(w, "base.html", data); err != nil {
		http.Error(w, fmt.Sprintf("Template error: %v", err), http.StatusInternalServerError)
	}
}

// Pricing Management
func PricingPage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
	
	session, _ := auth.GetSession(r)
	email, _ := session.Values["email"].(string)
	role, _ := session.Values["role"].(string)
	
	// Get all pricing rules from database
	pricings, _ := models.GetAllPricings()
	
	data := struct {
		PageData
		Pricings []models.Pricing
	}{
		PageData: PageData{
			Title:     "Pricing",
			Tab:       "pricing",
			UserEmail: email,
			UserRole:  role,
		},
		Pricings: pricings,
	}
	
	if err := pricingTemplate.ExecuteTemplate(w, "base.html", data); err != nil {
		http.Error(w, fmt.Sprintf("Template error: %v", err), http.StatusInternalServerError)
	}
}

// Calculate Page - for testing calculations
func CalculatePage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
	
	session, _ := auth.GetSession(r)
	email, _ := session.Values["email"].(string)
	role, _ := session.Values["role"].(string)
	
	data := PageData{
		Title:     "Calculate",
		Tab:       "calculate",
		UserEmail: email,
		UserRole:  role,
	}
	
	if err := calculateTemplate.ExecuteTemplate(w, "base.html", data); err != nil {
		http.Error(w, fmt.Sprintf("Template error: %v", err), http.StatusInternalServerError)
	}
}

// Users Management
func UsersPage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
	
	session, _ := auth.GetSession(r)
	email, _ := session.Values["email"].(string)
	role, _ := session.Values["role"].(string)
	
	// Get all users from database
	users, _ := models.GetAllUsers()
	
	data := struct {
		PageData
		Users []models.User
	}{
		PageData: PageData{
			Title:     "Users",
			Tab:       "users",
			UserEmail: email,
			UserRole:  role,
		},
		Users: users,
	}
	
	if err := usersTemplate.ExecuteTemplate(w, "base.html", data); err != nil {
		http.Error(w, fmt.Sprintf("Template error: %v", err), http.StatusInternalServerError)
	}
}

// Purchases Management
func PurchasesPage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
	
	session, _ := auth.GetSession(r)
	email, _ := session.Values["email"].(string)
	role, _ := session.Values["role"].(string)
	
	// For all purchases, we need to get them differently
	query := `
		SELECT p.id, p.user_id, p.payment_session_id, p.provider_id, p.provider_payment_id,
		       p.pricing_name, p.calculation_data, p.amount, p.currency, p.status,
		       p.payment_method, p.receipt_url, p.metadata, p.created_at, p.updated_at
		FROM formulapricing.purchases p
		ORDER BY p.created_at DESC
	`
	
	ctx := context.Background()
	rows, err := database.DB.Query(ctx, query)
	var allPurchases []models.Purchase
	if err == nil {
		defer rows.Close()
		
		for rows.Next() {
			var p models.Purchase
			var calcData, paymentMethod, metadata []byte
			
			err := rows.Scan(
				&p.ID, &p.UserID, &p.PaymentSessionID, &p.ProviderID, &p.ProviderPaymentID,
				&p.PricingName, &calcData, &p.Amount, &p.Currency, &p.Status,
				&paymentMethod, &p.ReceiptURL, &metadata, &p.CreatedAt, &p.UpdatedAt,
			)
			if err == nil {
				json.Unmarshal(calcData, &p.CalculationData)
				json.Unmarshal(paymentMethod, &p.PaymentMethod)
				json.Unmarshal(metadata, &p.Metadata)
				
				// Also fetch user info
				if user, _ := models.GetUserByID(p.UserID); user != nil {
					p.User = user
				}
				
				allPurchases = append(allPurchases, p)
			}
		}
	}
	
	data := struct {
		PageData
		Purchases []models.Purchase
	}{
		PageData: PageData{
			Title:     "Purchases",
			Tab:       "purchases",
			UserEmail: email,
			UserRole:  role,
		},
		Purchases: allPurchases,
	}
	
	if err := purchasesTemplate.ExecuteTemplate(w, "base.html", data); err != nil {
		http.Error(w, fmt.Sprintf("Template error: %v", err), http.StatusInternalServerError)
	}
}
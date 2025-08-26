package templates

import (
	"context"
	"fmt"
	"io"
)

// This is a basic template system for the dynamic products application
// In a real implementation, you would use proper templating like templ, html/template, or similar

// LoginPageData represents data for the login page
type LoginPageData struct {
	Title       string
	RedirectURL string
	Error       string
}

// RegisterPageData represents data for the register page
type RegisterPageData struct {
	Title string
	Error string
}

// DashboardData represents data for the dashboard
type DashboardData struct {
	Title string
	User  interface{} // User object
	Stats interface{} // Statistics data
}

// AdminPageData represents data for admin pages
type AdminPageData struct {
	Title string
	User  interface{}
	Data  interface{} // Page-specific data
}

// Component interface for rendering templates
type Component interface {
	Render(ctx context.Context, w io.Writer) error
}

// Basic template implementations

type loginPageTemplate struct {
	data LoginPageData
}

func LoginPage(data LoginPageData) Component {
	return &loginPageTemplate{data: data}
}

func (t *loginPageTemplate) Render(ctx context.Context, w io.Writer) error {
	html := fmt.Sprintf(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>%s</title>
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body class="login-page">
    <div class="login-container">
        <div class="login-card">
            <h1>Dynamic Products</h1>
            <h2>Login</h2>
            %s
            <form method="POST" action="/login" class="login-form">
                <input type="hidden" name="redirect" value="%s">
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit" class="btn btn-primary">Login</button>
            </form>
        </div>
    </div>
</body>
</html>`, 
		t.data.Title,
		renderError(t.data.Error),
		t.data.RedirectURL)

	_, err := w.Write([]byte(html))
	return err
}

type registerPageTemplate struct {
	data RegisterPageData
}

func RegisterPage(data RegisterPageData) Component {
	return &registerPageTemplate{data: data}
}

func (t *registerPageTemplate) Render(ctx context.Context, w io.Writer) error {
	html := fmt.Sprintf(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>%s</title>
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body class="register-page">
    <div class="register-container">
        <div class="register-card">
            <h1>Dynamic Products</h1>
            <h2>Register New User</h2>
            %s
            <form method="POST" action="/register" class="register-form">
                <div class="form-group">
                    <label for="name">Full Name:</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <div class="form-group">
                    <label for="role">Role:</label>
                    <select id="role" name="role" required>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Create User</button>
                <a href="/admin/users" class="btn btn-secondary">Cancel</a>
            </form>
        </div>
    </div>
</body>
</html>`, 
		t.data.Title,
		renderError(t.data.Error))

	_, err := w.Write([]byte(html))
	return err
}

type dashboardTemplate struct {
	data DashboardData
}

func Dashboard(data DashboardData) Component {
	return &dashboardTemplate{data: data}
}

func (t *dashboardTemplate) Render(ctx context.Context, w io.Writer) error {
	html := fmt.Sprintf(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>%s</title>
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body class="dashboard-page">
    <header class="header">
        <div class="header-content">
            <h1>Dynamic Products</h1>
            <nav class="nav">
                <a href="/dashboard">Dashboard</a>
                <a href="/seller/entities">Entities</a>
                <a href="/seller/products">Products</a>
                <a href="/admin">Admin</a>
                <a href="/logout">Logout</a>
            </nav>
        </div>
    </header>
    
    <main class="main-content">
        <div class="dashboard-container">
            <h2>Dashboard</h2>
            <div class="dashboard-stats">
                <div class="stat-card">
                    <h3>Total Products</h3>
                    <p class="stat-number">0</p>
                </div>
                <div class="stat-card">
                    <h3>Total Entities</h3>
                    <p class="stat-number">0</p>
                </div>
                <div class="stat-card">
                    <h3>Total Sales</h3>
                    <p class="stat-number">0</p>
                </div>
                <div class="stat-card">
                    <h3>Revenue</h3>
                    <p class="stat-number">$0.00</p>
                </div>
            </div>
            
            <div class="dashboard-actions">
                <a href="/seller/entities/new" class="btn btn-primary">Create Entity</a>
                <a href="/seller/products/new" class="btn btn-primary">Create Product</a>
            </div>
        </div>
    </main>
</body>
</html>`, t.data.Title)

	_, err := w.Write([]byte(html))
	return err
}

type adminPageTemplate struct {
	data AdminPageData
}

func AdminPage(data AdminPageData) Component {
	return &adminPageTemplate{data: data}
}

func (t *adminPageTemplate) Render(ctx context.Context, w io.Writer) error {
	html := fmt.Sprintf(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>%s</title>
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body class="admin-page">
    <header class="header">
        <div class="header-content">
            <h1>Dynamic Products - Admin</h1>
            <nav class="nav">
                <a href="/dashboard">Dashboard</a>
                <a href="/admin/entity-types">Entity Types</a>
                <a href="/admin/product-types">Product Types</a>
                <a href="/admin/users">Users</a>
                <a href="/logout">Logout</a>
            </nav>
        </div>
    </header>
    
    <main class="main-content">
        <div class="admin-container">
            <h2>Admin Panel</h2>
            <div class="admin-grid">
                <div class="admin-card">
                    <h3>Entity Types</h3>
                    <p>Manage entity types and their configurations</p>
                    <a href="/admin/entity-types" class="btn btn-primary">Manage</a>
                </div>
                <div class="admin-card">
                    <h3>Product Types</h3>
                    <p>Manage product types and their configurations</p>
                    <a href="/admin/product-types" class="btn btn-primary">Manage</a>
                </div>
                <div class="admin-card">
                    <h3>Users</h3>
                    <p>Manage system users and permissions</p>
                    <a href="/admin/users" class="btn btn-primary">Manage</a>
                </div>
                <div class="admin-card">
                    <h3>Purchases</h3>
                    <p>View all system purchases and sales</p>
                    <a href="/admin/purchases" class="btn btn-primary">View</a>
                </div>
            </div>
        </div>
    </main>
</body>
</html>`, t.data.Title)

	_, err := w.Write([]byte(html))
	return err
}

// Helper function to render error messages
func renderError(error string) string {
	if error == "" {
		return ""
	}
	return fmt.Sprintf(`<div class="error-message">%s</div>`, error)
}

// Helper function to render success messages
func renderSuccess(message string) string {
	if message == "" {
		return ""
	}
	return fmt.Sprintf(`<div class="success-message">%s</div>`, message)
}
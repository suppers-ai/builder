package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	return router
}

func TestCalculateHandler(t *testing.T) {
	router := setupTestRouter()
	handler := &CalculateHandler{} // In real test, inject mock calculator
	router.POST("/api/calculate", handler.Handle)

	tests := []struct {
		name         string
		request      CalculateRequest
		expectedCode int
		checkBody    func(t *testing.T, body []byte)
	}{
		{
			name: "simple calculation",
			request: CalculateRequest{
				Formula: "base_price * quantity",
				Variables: map[string]interface{}{
					"base_price": 50.0,
					"quantity":   3.0,
				},
			},
			expectedCode: http.StatusOK,
			checkBody: func(t *testing.T, body []byte) {
				var resp CalculateResponse
				err := json.Unmarshal(body, &resp)
				require.NoError(t, err)
				assert.Equal(t, 150.0, resp.Result)
				assert.NotEmpty(t, resp.Formula)
			},
		},
		{
			name: "calculation with conditions",
			request: CalculateRequest{
				Formula: "base_price * CASE WHEN quantity >= 10 THEN 0.9 ELSE 1 END",
				Variables: map[string]interface{}{
					"base_price": 100.0,
					"quantity":   15.0,
				},
			},
			expectedCode: http.StatusOK,
			checkBody: func(t *testing.T, body []byte) {
				var resp CalculateResponse
				err := json.Unmarshal(body, &resp)
				require.NoError(t, err)
				assert.Equal(t, 90.0, resp.Result)
			},
		},
		{
			name: "missing formula",
			request: CalculateRequest{
				Variables: map[string]interface{}{
					"base_price": 100.0,
				},
			},
			expectedCode: http.StatusBadRequest,
		},
		{
			name: "invalid formula",
			request: CalculateRequest{
				Formula: "invalid ++ formula",
				Variables: map[string]interface{}{
					"base_price": 100.0,
				},
			},
			expectedCode: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.request)
			req := httptest.NewRequest("POST", "/api/calculate", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)
			
			assert.Equal(t, tt.expectedCode, w.Code)
			if tt.checkBody != nil {
				tt.checkBody(t, w.Body.Bytes())
			}
		})
	}
}

func TestPricingHandler(t *testing.T) {
	router := setupTestRouter()
	handler := &PricingHandler{} // In real test, inject mock DB
	router.POST("/api/pricing/calculate", handler.Calculate)
	router.GET("/api/pricing/rules", handler.ListRules)

	tests := []struct {
		name         string
		method       string
		path         string
		request      interface{}
		expectedCode int
		checkBody    func(t *testing.T, body []byte)
	}{
		{
			name:   "calculate with rules",
			method: "POST",
			path:   "/api/pricing/calculate",
			request: PricingCalculateRequest{
				Variables: map[string]interface{}{
					"base_price":    100.0,
					"quantity":      50.0,
					"customer_type": "vip",
				},
				RuleIDs: []int{1, 2, 3},
			},
			expectedCode: http.StatusOK,
			checkBody: func(t *testing.T, body []byte) {
				var resp PricingCalculateResponse
				err := json.Unmarshal(body, &resp)
				require.NoError(t, err)
				assert.NotZero(t, resp.FinalPrice)
				assert.NotEmpty(t, resp.AppliedRule)
			},
		},
		{
			name:   "calculate with category filter",
			method: "POST",
			path:   "/api/pricing/calculate",
			request: PricingCalculateRequest{
				Variables: map[string]interface{}{
					"base_price": 100.0,
					"quantity":   10.0,
				},
				Category: "ecommerce",
			},
			expectedCode: http.StatusOK,
		},
		{
			name:         "list all rules",
			method:       "GET",
			path:         "/api/pricing/rules",
			expectedCode: http.StatusOK,
			checkBody: func(t *testing.T, body []byte) {
				var rules []PricingRule
				err := json.Unmarshal(body, &rules)
				require.NoError(t, err)
				assert.NotEmpty(t, rules)
			},
		},
		{
			name:         "list rules by category",
			method:       "GET",
			path:         "/api/pricing/rules?category=subscription",
			expectedCode: http.StatusOK,
		},
		{
			name:         "list active rules only",
			method:       "GET",
			path:         "/api/pricing/rules?active=true",
			expectedCode: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var req *http.Request
			
			if tt.method == "POST" {
				body, _ := json.Marshal(tt.request)
				req = httptest.NewRequest(tt.method, tt.path, bytes.NewBuffer(body))
				req.Header.Set("Content-Type", "application/json")
			} else {
				req = httptest.NewRequest(tt.method, tt.path, nil)
			}
			
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)
			
			assert.Equal(t, tt.expectedCode, w.Code)
			if tt.checkBody != nil {
				tt.checkBody(t, w.Body.Bytes())
			}
		})
	}
}

func TestVariablesHandler(t *testing.T) {
	router := setupTestRouter()
	handler := &VariablesHandler{} // In real test, inject mock DB
	router.GET("/api/variables", handler.List)
	router.POST("/api/variables", handler.Create)
	router.PUT("/api/variables/:id", handler.Update)
	router.DELETE("/api/variables/:id", handler.Delete)

	tests := []struct {
		name         string
		method       string
		path         string
		request      interface{}
		expectedCode int
	}{
		{
			name:         "list all variables",
			method:       "GET",
			path:         "/api/variables",
			expectedCode: http.StatusOK,
		},
		{
			name:         "list variables by category",
			method:       "GET",
			path:         "/api/variables?category=product",
			expectedCode: http.StatusOK,
		},
		{
			name:   "create variable",
			method: "POST",
			path:   "/api/variables",
			request: Variable{
				Name:         "test_variable",
				Type:         "number",
				DefaultValue: "0",
				Description:  "Test variable",
				Category:     "test",
			},
			expectedCode: http.StatusCreated,
		},
		{
			name:   "update variable",
			method: "PUT",
			path:   "/api/variables/1",
			request: Variable{
				Name:         "updated_variable",
				Type:         "number",
				DefaultValue: "100",
			},
			expectedCode: http.StatusOK,
		},
		{
			name:         "delete variable",
			method:       "DELETE",
			path:         "/api/variables/1",
			expectedCode: http.StatusNoContent,
		},
		{
			name:   "create invalid variable",
			method: "POST",
			path:   "/api/variables",
			request: Variable{
				// Missing required fields
				Type: "invalid_type",
			},
			expectedCode: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var req *http.Request
			
			if tt.request != nil {
				body, _ := json.Marshal(tt.request)
				req = httptest.NewRequest(tt.method, tt.path, bytes.NewBuffer(body))
				req.Header.Set("Content-Type", "application/json")
			} else {
				req = httptest.NewRequest(tt.method, tt.path, nil)
			}
			
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)
			
			assert.Equal(t, tt.expectedCode, w.Code)
		})
	}
}

func TestConditionsHandler(t *testing.T) {
	router := setupTestRouter()
	handler := &ConditionsHandler{} // In real test, inject mock DB
	router.GET("/api/conditions", handler.List)
	router.POST("/api/conditions", handler.Create)
	router.POST("/api/conditions/evaluate", handler.Evaluate)

	tests := []struct {
		name         string
		method       string
		path         string
		request      interface{}
		expectedCode int
		checkBody    func(t *testing.T, body []byte)
	}{
		{
			name:         "list all conditions",
			method:       "GET",
			path:         "/api/conditions",
			expectedCode: http.StatusOK,
		},
		{
			name:   "create condition",
			method: "POST",
			path:   "/api/conditions",
			request: Condition{
				Name:        "test_condition",
				Field:       "quantity",
				Operator:    ">=",
				Value:       "10",
				Description: "Test condition",
				Category:    "test",
			},
			expectedCode: http.StatusCreated,
		},
		{
			name:   "evaluate conditions",
			method: "POST",
			path:   "/api/conditions/evaluate",
			request: EvaluateConditionsRequest{
				ConditionIDs: []int{1, 2, 3},
				Variables: map[string]interface{}{
					"quantity":      15,
					"customer_type": "vip",
					"base_price":    100,
				},
			},
			expectedCode: http.StatusOK,
			checkBody: func(t *testing.T, body []byte) {
				var resp EvaluateConditionsResponse
				err := json.Unmarshal(body, &resp)
				require.NoError(t, err)
				assert.NotNil(t, resp.Result)
				assert.NotEmpty(t, resp.EvaluatedConditions)
			},
		},
		{
			name:   "evaluate with named conditions",
			method: "POST",
			path:   "/api/conditions/evaluate",
			request: EvaluateConditionsRequest{
				ConditionNames: []string{"is_vip_customer", "is_bulk_order"},
				Variables: map[string]interface{}{
					"customer_type": "vip",
					"quantity":      50,
				},
			},
			expectedCode: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var req *http.Request
			
			if tt.request != nil {
				body, _ := json.Marshal(tt.request)
				req = httptest.NewRequest(tt.method, tt.path, bytes.NewBuffer(body))
				req.Header.Set("Content-Type", "application/json")
			} else {
				req = httptest.NewRequest(tt.method, tt.path, nil)
			}
			
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)
			
			assert.Equal(t, tt.expectedCode, w.Code)
			if tt.checkBody != nil {
				tt.checkBody(t, w.Body.Bytes())
			}
		})
	}
}

func TestCalculationsHandler(t *testing.T) {
	router := setupTestRouter()
	handler := &CalculationsHandler{} // In real test, inject mock DB
	router.GET("/api/calculations", handler.List)
	router.POST("/api/calculations", handler.Create)
	router.GET("/api/calculations/:id", handler.Get)
	router.PUT("/api/calculations/:id", handler.Update)
	router.DELETE("/api/calculations/:id", handler.Delete)

	tests := []struct {
		name         string
		method       string
		path         string
		request      interface{}
		expectedCode int
	}{
		{
			name:         "list all calculations",
			method:       "GET",
			path:         "/api/calculations",
			expectedCode: http.StatusOK,
		},
		{
			name:         "get specific calculation",
			method:       "GET",
			path:         "/api/calculations/1",
			expectedCode: http.StatusOK,
		},
		{
			name:   "create calculation",
			method: "POST",
			path:   "/api/calculations",
			request: Calculation{
				Name:        "test_calc",
				Formula:     "base_price * quantity",
				Description: "Test calculation",
				Category:    "test",
			},
			expectedCode: http.StatusCreated,
		},
		{
			name:   "update calculation",
			method: "PUT",
			path:   "/api/calculations/1",
			request: Calculation{
				Name:    "updated_calc",
				Formula: "base_price * quantity * discount",
			},
			expectedCode: http.StatusOK,
		},
		{
			name:         "delete calculation",
			method:       "DELETE",
			path:         "/api/calculations/1",
			expectedCode: http.StatusNoContent,
		},
		{
			name:   "create calculation with invalid formula",
			method: "POST",
			path:   "/api/calculations",
			request: Calculation{
				Name:    "invalid",
				Formula: "++ invalid",
			},
			expectedCode: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var req *http.Request
			
			if tt.request != nil {
				body, _ := json.Marshal(tt.request)
				req = httptest.NewRequest(tt.method, tt.path, bytes.NewBuffer(body))
				req.Header.Set("Content-Type", "application/json")
			} else {
				req = httptest.NewRequest(tt.method, tt.path, nil)
			}
			
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)
			
			assert.Equal(t, tt.expectedCode, w.Code)
		})
	}
}

// Test request/response types
type CalculateRequest struct {
	Formula   string                 `json:"formula"`
	Variables map[string]interface{} `json:"variables"`
}

type CalculateResponse struct {
	Result    float64                `json:"result"`
	Formula   string                 `json:"formula"`
	Variables map[string]interface{} `json:"variables"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
}

type PricingCalculateRequest struct {
	Variables map[string]interface{} `json:"variables"`
	RuleIDs   []int                  `json:"rule_ids,omitempty"`
	Category  string                 `json:"category,omitempty"`
}

type PricingCalculateResponse struct {
	FinalPrice      float64                `json:"final_price"`
	AppliedRule     string                 `json:"applied_rule"`
	AppliedRuleID   int                    `json:"applied_rule_id"`
	AllEvaluations  []RuleEvaluation       `json:"all_evaluations,omitempty"`
	Variables       map[string]interface{} `json:"variables"`
	ExecutionTimeMs float64                `json:"execution_time_ms"`
}

type RuleEvaluation struct {
	RuleID         int     `json:"rule_id"`
	RuleName       string  `json:"rule_name"`
	ConditionsMet  bool    `json:"conditions_met"`
	CalculatedPrice float64 `json:"calculated_price,omitempty"`
	Error          string  `json:"error,omitempty"`
}

type EvaluateConditionsRequest struct {
	ConditionIDs   []int                  `json:"condition_ids,omitempty"`
	ConditionNames []string               `json:"condition_names,omitempty"`
	Variables      map[string]interface{} `json:"variables"`
}

type EvaluateConditionsResponse struct {
	Result              bool                         `json:"result"`
	EvaluatedConditions []ConditionEvaluationResult `json:"evaluated_conditions"`
}

type ConditionEvaluationResult struct {
	ID     int    `json:"id"`
	Name   string `json:"name"`
	Result bool   `json:"result"`
	Field  string `json:"field"`
	Value  string `json:"value"`
}

// Simplified model types for testing
type Variable struct {
	ID           int    `json:"id,omitempty"`
	Name         string `json:"name"`
	Type         string `json:"type"`
	DefaultValue string `json:"default_value"`
	Description  string `json:"description,omitempty"`
	Category     string `json:"category,omitempty"`
	IsSystem     bool   `json:"is_system,omitempty"`
}

type Condition struct {
	ID          int    `json:"id,omitempty"`
	Name        string `json:"name"`
	Field       string `json:"field"`
	Operator    string `json:"operator"`
	Value       string `json:"value"`
	Description string `json:"description,omitempty"`
	Category    string `json:"category,omitempty"`
}

type Calculation struct {
	ID          int    `json:"id,omitempty"`
	Name        string `json:"name"`
	Formula     string `json:"formula"`
	Description string `json:"description,omitempty"`
	Category    string `json:"category,omitempty"`
}

type PricingRule struct {
	ID          int      `json:"id,omitempty"`
	Name        string   `json:"name"`
	Formula     string   `json:"formula"`
	Conditions  []string `json:"conditions,omitempty"`
	Priority    int      `json:"priority"`
	Description string   `json:"description,omitempty"`
	Category    string   `json:"category,omitempty"`
	IsActive    bool     `json:"is_active"`
}
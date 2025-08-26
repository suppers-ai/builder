package web

import (
    "net/http"
    "formulapricing/auth"
    "formulapricing/engine"
    "formulapricing/models"
    "formulapricing/views/pages"
    "strconv"
)

func CalculatePage(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
    
    session, _ := auth.GetSession(r)
    email, _ := session.Values["email"].(string)
    role, _ := session.Values["role"].(string)
    
    var result *pages.CalculationResult
    
    if r.Method == "POST" {
        // Get form values
        area, _ := strconv.ParseFloat(r.FormValue("area"), 64)
        floors, _ := strconv.ParseFloat(r.FormValue("floors"), 64)
        
        // Perform calculation
        calculator := engine.NewCalculator()
        calculator.SetVariable("area", area)
        calculator.SetVariable("floors", floors)
        
        // Simple calculation for demo
        calculationResult, err := calculator.Calculate("base_price")
        
        if err == nil {
            result = &pages.CalculationResult{
                BasePrice:  calculationResult,
                Conditions: []pages.ConditionResult{},
                FinalPrice: calculationResult,
            }
        }
    }
    
    component := pages.CalculatePage(pages.CalculatePageData{
        UserEmail: email,
        UserRole:  role,
        Result:    result,
    })
    
    Render(w, r, component)
}
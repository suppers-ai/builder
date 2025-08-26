package handlers

import (
	"encoding/json"
	"net/http"

	"formulapricing/models"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

func GetPricings(w http.ResponseWriter, r *http.Request) {
	pricings, err := models.GetAllPricings()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch pricings")
		return
	}

	respondWithJSON(w, http.StatusOK, pricings)
}

func GetPricing(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	
	// Check if we're getting by ID or by name
	idOrName := vars["id"]
	
	// Try to parse as UUID first
	var pricing *models.Pricing
	var err error
	
	if id, err := uuid.Parse(idOrName); err == nil {
		// It's a UUID
		pricing, err = models.GetPricingByID(id)
	} else {
		// Try as name
		pricing, err = models.GetPricingByName(idOrName)
	}
	
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch pricing")
		return
	}
	if pricing == nil {
		respondWithError(w, http.StatusNotFound, "Pricing not found")
		return
	}

	respondWithJSON(w, http.StatusOK, pricing)
}

// GetPricingWithVariables returns a pricing strategy with its required variables
func GetPricingWithVariables(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	name := vars["name"]
	
	pricing, err := models.GetPricingByName(name)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch pricing")
		return
	}
	if pricing == nil {
		respondWithError(w, http.StatusNotFound, "Pricing not found")
		return
	}
	
	// Get all required variables for this pricing
	requiredVars, err := models.GetRequiredVariablesForPricing(pricing)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch required variables")
		return
	}
	
	response := map[string]interface{}{
		"pricing":           pricing,
		"required_variables": requiredVars,
	}
	
	respondWithJSON(w, http.StatusOK, response)
}

func CreatePricing(w http.ResponseWriter, r *http.Request) {
	var pricing models.Pricing
	if err := json.NewDecoder(r.Body).Decode(&pricing); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if pricing.Name == "" || len(pricing.Pricing) == 0 {
		respondWithError(w, http.StatusBadRequest, "Missing required fields: name, pricing")
		return
	}

	if err := models.CreatePricing(&pricing); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to create pricing")
		return
	}

	respondWithJSON(w, http.StatusCreated, pricing)
}

func UpdatePricing(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid pricing ID")
		return
	}

	var pricing models.Pricing
	if err := json.NewDecoder(r.Body).Decode(&pricing); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if pricing.Name == "" || len(pricing.Pricing) == 0 {
		respondWithError(w, http.StatusBadRequest, "Missing required fields: name, pricing")
		return
	}

	if err := models.UpdatePricing(id, &pricing); err != nil {
		if err == models.ErrNotFound {
			respondWithError(w, http.StatusNotFound, "Pricing not found")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Failed to update pricing")
		return
	}

	respondWithJSON(w, http.StatusOK, pricing)
}

func DeletePricing(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid pricing ID")
		return
	}

	if err := models.DeletePricing(id); err != nil {
		if err == models.ErrNotFound {
			respondWithError(w, http.StatusNotFound, "Pricing not found")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Failed to delete pricing")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Pricing deleted successfully"})
}
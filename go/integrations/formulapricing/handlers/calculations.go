package handlers

import (
	"encoding/json"
	"net/http"

	"formulapricing/models"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

func GetCalculations(w http.ResponseWriter, r *http.Request) {
	calculations, err := models.GetAllCalculations()
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch calculations")
		return
	}

	respondWithJSON(w, http.StatusOK, calculations)
}

func GetCalculation(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid calculation ID")
		return
	}

	calculation, err := models.GetCalculationByID(id)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch calculation")
		return
	}
	if calculation == nil {
		respondWithError(w, http.StatusNotFound, "Calculation not found")
		return
	}

	respondWithJSON(w, http.StatusOK, calculation)
}

func CreateCalculation(w http.ResponseWriter, r *http.Request) {
	var calculation models.Calculation
	if err := json.NewDecoder(r.Body).Decode(&calculation); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if calculation.CalculationName == "" || calculation.DisplayName == "" || len(calculation.Calculation) == 0 {
		respondWithError(w, http.StatusBadRequest, "Missing required fields: calculation_name, display_name, calculation")
		return
	}

	if err := models.CreateCalculation(&calculation); err != nil {
		if err == models.ErrDuplicateKey {
			respondWithError(w, http.StatusConflict, "Calculation with this name already exists")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Failed to create calculation")
		return
	}

	respondWithJSON(w, http.StatusCreated, calculation)
}

func UpdateCalculation(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid calculation ID")
		return
	}

	var calculation models.Calculation
	if err := json.NewDecoder(r.Body).Decode(&calculation); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if calculation.CalculationName == "" || calculation.DisplayName == "" || len(calculation.Calculation) == 0 {
		respondWithError(w, http.StatusBadRequest, "Missing required fields: calculation_name, display_name, calculation")
		return
	}

	if err := models.UpdateCalculation(id, &calculation); err != nil {
		if err == models.ErrNotFound {
			respondWithError(w, http.StatusNotFound, "Calculation not found")
			return
		}
		if err == models.ErrDuplicateKey {
			respondWithError(w, http.StatusConflict, "Calculation with this name already exists")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Failed to update calculation")
		return
	}

	respondWithJSON(w, http.StatusOK, calculation)
}

func DeleteCalculation(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid calculation ID")
		return
	}

	if err := models.DeleteCalculation(id); err != nil {
		if err == models.ErrNotFound {
			respondWithError(w, http.StatusNotFound, "Calculation not found")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Failed to delete calculation")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Calculation deleted successfully"})
}
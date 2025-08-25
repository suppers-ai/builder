package handlers

import (
	"encoding/json"
	"net/http"

	"formula-pricing/database"
	"formula-pricing/models"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

func GetConditions(w http.ResponseWriter, r *http.Request) {
	conditions, err := models.GetAllConditions(database.DB)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch conditions")
		return
	}

	respondWithJSON(w, http.StatusOK, conditions)
}

func GetCondition(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid condition ID")
		return
	}

	condition, err := models.GetConditionByID(database.DB, id)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch condition")
		return
	}
	if condition == nil {
		respondWithError(w, http.StatusNotFound, "Condition not found")
		return
	}

	respondWithJSON(w, http.StatusOK, condition)
}

func CreateCondition(w http.ResponseWriter, r *http.Request) {
	var condition models.Condition
	if err := json.NewDecoder(r.Body).Decode(&condition); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if condition.ConditionName == "" || condition.DisplayName == "" || len(condition.Condition) == 0 {
		respondWithError(w, http.StatusBadRequest, "Missing required fields: condition_name, display_name, condition")
		return
	}

	if err := models.CreateCondition(database.DB, &condition); err != nil {
		if err == models.ErrDuplicateKey {
			respondWithError(w, http.StatusConflict, "Condition with this name already exists")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Failed to create condition")
		return
	}

	respondWithJSON(w, http.StatusCreated, condition)
}

func UpdateCondition(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid condition ID")
		return
	}

	var condition models.Condition
	if err := json.NewDecoder(r.Body).Decode(&condition); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if condition.ConditionName == "" || condition.DisplayName == "" || len(condition.Condition) == 0 {
		respondWithError(w, http.StatusBadRequest, "Missing required fields: condition_name, display_name, condition")
		return
	}

	if err := models.UpdateCondition(database.DB, id, &condition); err != nil {
		if err == models.ErrNotFound {
			respondWithError(w, http.StatusNotFound, "Condition not found")
			return
		}
		if err == models.ErrDuplicateKey {
			respondWithError(w, http.StatusConflict, "Condition with this name already exists")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Failed to update condition")
		return
	}

	respondWithJSON(w, http.StatusOK, condition)
}

func DeleteCondition(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid condition ID")
		return
	}

	if err := models.DeleteCondition(database.DB, id); err != nil {
		if err == models.ErrNotFound {
			respondWithError(w, http.StatusNotFound, "Condition not found")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "Failed to delete condition")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Condition deleted successfully"})
}
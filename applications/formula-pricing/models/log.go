package models

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type Log struct {
	ID         uuid.UUID  `json:"id"`
	Level      string     `json:"level"`
	Method     string     `json:"method"`
	Path       string     `json:"path"`
	StatusCode *int       `json:"status_code,omitempty"`
	ExecTimeMs *int       `json:"exec_time_ms,omitempty"`
	UserIP     *string    `json:"user_ip,omitempty"`
	UserID     *uuid.UUID `json:"user_id,omitempty"`
	Error      *string    `json:"error,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
}

func CreateLog(db *sql.DB, log *Log) error {
	query := `
		INSERT INTO formulapricing.logs (level, method, path, status_code, exec_time_ms, user_ip, user_id, error)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at
	`
	
	err := db.QueryRow(query, log.Level, log.Method, log.Path, log.StatusCode, 
		log.ExecTimeMs, log.UserIP, log.UserID, log.Error).
		Scan(&log.ID, &log.CreatedAt)
	return err
}

func GetRecentLogs(db *sql.DB, limit int) ([]Log, error) {
	query := `
		SELECT id, level, method, path, status_code, exec_time_ms, user_ip, user_id, error, created_at
		FROM formulapricing.logs
		ORDER BY created_at DESC
		LIMIT $1
	`
	
	rows, err := db.Query(query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []Log
	for rows.Next() {
		var l Log
		err := rows.Scan(&l.ID, &l.Level, &l.Method, &l.Path, &l.StatusCode, 
			&l.ExecTimeMs, &l.UserIP, &l.UserID, &l.Error, &l.CreatedAt)
		if err != nil {
			return nil, err
		}
		logs = append(logs, l)
	}

	return logs, nil
}

func GetLogStats(db *sql.DB) (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Get total log count
	var totalCount int
	err := db.QueryRow("SELECT COUNT(*) FROM formulapricing.logs").Scan(&totalCount)
	if err != nil {
		return nil, err
	}
	stats["total"] = totalCount

	// Get counts by level
	levelQuery := `
		SELECT level, COUNT(*) 
		FROM formulapricing.logs 
		GROUP BY level
	`
	rows, err := db.Query(levelQuery)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	levelCounts := make(map[string]int)
	for rows.Next() {
		var level string
		var count int
		if err := rows.Scan(&level, &count); err != nil {
			return nil, err
		}
		levelCounts[level] = count
	}
	stats["by_level"] = levelCounts

	// Get error count
	var errorCount int
	err = db.QueryRow("SELECT COUNT(*) FROM formulapricing.logs WHERE error IS NOT NULL").Scan(&errorCount)
	if err != nil {
		return nil, err
	}
	stats["errors"] = errorCount

	return stats, nil
}
package models

import (
	"time"
)

// User represents a registered user
type User struct {
	ID           int       `db:"id"           json:"id"`
	Email        string    `db:"email"        json:"email"`
	PasswordHash string    `db:"password"     json:"-"`
	Name         string    `db:"name"         json:"name"`
	CreatedAt    time.Time `db:"created_at"   json:"created_at"`
}

// Material represents a facade material
type Material struct {
	ID         int     `db:"id"          json:"id"`
	Name       string  `db:"name"        json:"name"`
	Type       string  `db:"type"        json:"type"`
	TextureURL string  `db:"texture_url" json:"texture_url"`
	PricePerM2 float64 `db:"price_per_m2" json:"price_per_m2"`
	Color      string  `db:"color"       json:"color"`
	InStock    bool    `db:"in_stock"    json:"in_stock"`
}

// Facade represents a facade product
type Facade struct {
	ID         int     `db:"id"          json:"id"`
	Name       string  `db:"name"        json:"name"`
	MaterialID int     `db:"material_id" json:"material_id"`
	ImageURL   string  `db:"image_url"   json:"image_url"`
	Category   string  `db:"category"    json:"category"` // kitchen, wardrobe, panel
	Material   *Material `db:"-"         json:"material,omitempty"`
}

// Project represents a saved user project
type Project struct {
	ID         int            `db:"id"          json:"id"`
	UserID     int            `db:"user_id"     json:"user_id"`
	Name       string         `db:"name"        json:"name"`
	ConfigJSON string         `db:"config_json" json:"config_json"`
	CreatedAt  time.Time      `db:"created_at"  json:"created_at"`
	UpdatedAt  time.Time      `db:"updated_at"  json:"updated_at"`
}

// Order represents a quote request
type Order struct {
	ID           int       `db:"id"            json:"id"`
	ProjectID    *int      `db:"project_id"    json:"project_id,omitempty"`
	CustomerName string    `db:"customer_name" json:"customer_name"`
	Phone        string    `db:"phone"         json:"phone"`
	Email        string    `db:"email"         json:"email"`
	Message      string    `db:"message"       json:"message"`
	Status       string    `db:"status"        json:"status"` // new, processing, done
	CreatedAt    time.Time `db:"created_at"    json:"created_at"`
}

// Calculator input/output
type CalculatorRequest struct {
	MaterialID int     `json:"material_id" binding:"required"`
	Width      float64 `json:"width"       binding:"required,gt=0"`
	Height     float64 `json:"height"      binding:"required,gt=0"`
	Doors      int     `json:"doors"`
	Drawers    int     `json:"drawers"`
}

type CalculatorResponse struct {
	Area         float64 `json:"area"`
	MaterialName string  `json:"material_name"`
	PricePerM2   float64 `json:"price_per_m2"`
	BasePrice    float64 `json:"base_price"`
	DoorsPrice   float64 `json:"doors_price"`
	DrawersPrice float64 `json:"drawers_price"`
	TotalPrice   float64 `json:"total_price"`
}

// Auth
type LoginRequest struct {
	Email    string `json:"email"    binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type RegisterRequest struct {
	Email    string `json:"email"    binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name"     binding:"required"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

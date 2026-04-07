package repository

import (
	"facade-platform/internal/models"
	"github.com/jmoiron/sqlx"
)

type Repository struct {
	db *sqlx.DB
}

func New(db *sqlx.DB) *Repository {
	return &Repository{db: db}
}

// ── MATERIALS ─────────────────────────────────────────────────────────────────

func (r *Repository) GetMaterials() ([]models.Material, error) {
	var m []models.Material
	err := r.db.Select(&m, `SELECT * FROM materials WHERE in_stock = true ORDER BY type, name`)
	return m, err
}

func (r *Repository) GetMaterialByID(id int) (*models.Material, error) {
	var m models.Material
	err := r.db.Get(&m, `SELECT * FROM materials WHERE id = $1`, id)
	return &m, err
}

// ── FACADES ───────────────────────────────────────────────────────────────────

func (r *Repository) GetFacades(category string) ([]models.Facade, error) {
	var f []models.Facade
	query := `
		SELECT f.*, m.name as "material.name", m.price_per_m2 as "material.price_per_m2",
		       m.texture_url as "material.texture_url", m.color as "material.color"
		FROM facades f
		JOIN materials m ON f.material_id = m.id`
	args := []interface{}{}
	if category != "" {
		query += ` WHERE f.category = $1`
		args = append(args, category)
	}
	query += ` ORDER BY f.id`
	err := r.db.Select(&f, query, args...)
	return f, err
}

// ── USERS ─────────────────────────────────────────────────────────────────────

func (r *Repository) CreateUser(email, passwordHash, name string) (*models.User, error) {
	var u models.User
	err := r.db.QueryRowx(
		`INSERT INTO users (email, password, name) VALUES ($1,$2,$3) RETURNING *`,
		email, passwordHash, name,
	).StructScan(&u)
	return &u, err
}

func (r *Repository) GetUserByEmail(email string) (*models.User, error) {
	var u models.User
	err := r.db.Get(&u, `SELECT * FROM users WHERE email = $1`, email)
	return &u, err
}

func (r *Repository) GetUserByID(id int) (*models.User, error) {
	var u models.User
	err := r.db.Get(&u, `SELECT * FROM users WHERE id = $1`, id)
	return &u, err
}

// ── PROJECTS ──────────────────────────────────────────────────────────────────

func (r *Repository) GetUserProjects(userID int) ([]models.Project, error) {
	var p []models.Project
	err := r.db.Select(&p, `SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC`, userID)
	return p, err
}

func (r *Repository) GetProjectByID(id, userID int) (*models.Project, error) {
	var p models.Project
	err := r.db.Get(&p, `SELECT * FROM projects WHERE id = $1 AND user_id = $2`, id, userID)
	return &p, err
}

func (r *Repository) CreateProject(userID int, name, configJSON string) (*models.Project, error) {
	var p models.Project
	err := r.db.QueryRowx(
		`INSERT INTO projects (user_id, name, config_json) VALUES ($1,$2,$3) RETURNING *`,
		userID, name, configJSON,
	).StructScan(&p)
	return &p, err
}

func (r *Repository) UpdateProject(id, userID int, name, configJSON string) (*models.Project, error) {
	var p models.Project
	err := r.db.QueryRowx(
		`UPDATE projects SET name=$3, config_json=$4, updated_at=NOW()
		 WHERE id=$1 AND user_id=$2 RETURNING *`,
		id, userID, name, configJSON,
	).StructScan(&p)
	return &p, err
}

func (r *Repository) DeleteProject(id, userID int) error {
	_, err := r.db.Exec(`DELETE FROM projects WHERE id=$1 AND user_id=$2`, id, userID)
	return err
}

// ── ORDERS ────────────────────────────────────────────────────────────────────

func (r *Repository) CreateOrder(o *models.Order) (*models.Order, error) {
	var out models.Order
	err := r.db.QueryRowx(
		`INSERT INTO orders (project_id, customer_name, phone, email, message)
		 VALUES ($1,$2,$3,$4,$5) RETURNING *`,
		o.ProjectID, o.CustomerName, o.Phone, o.Email, o.Message,
	).StructScan(&out)
	return &out, err
}

func (r *Repository) GetOrders() ([]models.Order, error) {
	var orders []models.Order
	err := r.db.Select(&orders, `SELECT * FROM orders ORDER BY created_at DESC`)
	return orders, err
}

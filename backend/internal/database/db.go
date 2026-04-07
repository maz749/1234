package database

import (
	"fmt"
	"log"
	"os"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func Connect() (*sqlx.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
			getEnv("DB_HOST", "localhost"),
			getEnv("DB_PORT", "5432"),
			getEnv("DB_USER", "facade_user"),
			getEnv("DB_PASSWORD", "secret"),
			getEnv("DB_NAME", "facade"),
		)
	}

	db, err := sqlx.Connect("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("connect to db: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(10)

	log.Println("✅ Database connected")
	return db, nil
}

func Migrate(db *sqlx.DB) error {
	schema := `
	CREATE TABLE IF NOT EXISTS users (
		id         SERIAL PRIMARY KEY,
		email      VARCHAR(255) UNIQUE NOT NULL,
		password   VARCHAR(255) NOT NULL,
		name       VARCHAR(255) NOT NULL,
		created_at TIMESTAMPTZ DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS materials (
		id          SERIAL PRIMARY KEY,
		name        VARCHAR(255) NOT NULL,
		type        VARCHAR(100) NOT NULL,
		texture_url TEXT,
		price_per_m2 DECIMAL(10,2) NOT NULL,
		color       VARCHAR(100),
		in_stock    BOOLEAN DEFAULT true
	);

	CREATE TABLE IF NOT EXISTS facades (
		id          SERIAL PRIMARY KEY,
		name        VARCHAR(255) NOT NULL,
		material_id INT REFERENCES materials(id),
		image_url   TEXT,
		category    VARCHAR(100) NOT NULL DEFAULT 'kitchen'
	);

	CREATE TABLE IF NOT EXISTS projects (
		id          SERIAL PRIMARY KEY,
		user_id     INT REFERENCES users(id) ON DELETE CASCADE,
		name        VARCHAR(255) NOT NULL DEFAULT 'Мой проект',
		config_json TEXT NOT NULL DEFAULT '{}',
		created_at  TIMESTAMPTZ DEFAULT NOW(),
		updated_at  TIMESTAMPTZ DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS orders (
		id            SERIAL PRIMARY KEY,
		project_id    INT REFERENCES projects(id) ON DELETE SET NULL,
		customer_name VARCHAR(255) NOT NULL,
		phone         VARCHAR(50) NOT NULL,
		email         VARCHAR(255) NOT NULL,
		message       TEXT,
		status        VARCHAR(50) DEFAULT 'new',
		created_at    TIMESTAMPTZ DEFAULT NOW()
	);
	`

	_, err := db.Exec(schema)
	if err != nil {
		return fmt.Errorf("migrate: %w", err)
	}

	seedMaterials(db)
	log.Println("✅ Database migrated")
	return nil
}

func seedMaterials(db *sqlx.DB) {
	var count int
	db.Get(&count, "SELECT COUNT(*) FROM materials")
	if count > 0 {
		return
	}

	materials := []struct {
		name, mtype, texture, color string
		price                       float64
	}{
		{"Дуб натуральный", "wood", "/textures/oak.jpg", "#8B6914", 320},
		{"Орех американский", "wood", "/textures/walnut.jpg", "#4A3728", 480},
		{"МДФ белый матовый", "mdf", "/textures/white-mdf.jpg", "#F5F5F0", 180},
		{"Лак графит", "lacquer", "/textures/graphite.jpg", "#3A3A3A", 240},
		{"Шпон терракота", "veneer", "/textures/terracotta.jpg", "#9B4E35", 290},
		{"Камень натуральный", "stone", "/textures/stone.jpg", "#6B6560", 560},
		{"Ясень беленый", "wood", "/textures/ash.jpg", "#D4C9B8", 350},
		{"Эмаль антрацит", "lacquer", "/textures/anthracite.jpg", "#2F2F2F", 260},
	}

	for _, m := range materials {
		db.Exec(`INSERT INTO materials (name, type, texture_url, color, price_per_m2) VALUES ($1,$2,$3,$4,$5)`,
			m.name, m.mtype, m.texture, m.color, m.price)
	}
	log.Println("✅ Materials seeded")
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

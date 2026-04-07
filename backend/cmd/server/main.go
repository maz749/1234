package main

import (
	"facade-platform/internal/api"
	"facade-platform/internal/database"
	"facade-platform/internal/repository"
	"facade-platform/internal/services"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file, using environment variables")
	}

	// Connect to DB
	db, err := database.Connect()
	if err != nil {
		log.Fatalf("❌ DB connection failed: %v", err)
	}
	defer db.Close()

	// Migrate
	if err := database.Migrate(db); err != nil {
		log.Fatalf("❌ Migration failed: %v", err)
	}

	// Wire up layers
	repo := repository.New(db)
	svc := services.New(repo)
	router := api.NewRouter(svc)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server running on http://localhost:%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("❌ Server failed: %v", err)
	}
}

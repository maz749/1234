package api

import (
	"facade-platform/internal/api/handlers"
	"facade-platform/internal/middleware"
	"facade-platform/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func NewRouter(svc *services.Service) *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "https://*.vercel.app"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	h := handlers.New(svc)
	auth := middleware.AuthRequired(svc)

	v1 := r.Group("/api/v1")
	{
		v1.GET("/health", h.Health)

		// Auth
		v1.POST("/auth/register", h.Register)
		v1.POST("/auth/login", h.Login)

		// Public
		v1.GET("/materials", h.GetMaterials)
		v1.GET("/materials/:id", h.GetMaterial)
		v1.GET("/facades", h.GetFacades)

		// Calculator (no auth needed)
		v1.POST("/calculator", h.Calculate)

		// Orders (no auth needed for quote requests)
		v1.POST("/orders", h.CreateOrder)

		// Protected
		projects := v1.Group("/projects", auth)
		{
			projects.GET("", h.GetProjects)
			projects.POST("", h.CreateProject)
			projects.GET("/:id", h.GetProject)
			projects.PUT("/:id", h.UpdateProject)
			projects.DELETE("/:id", h.DeleteProject)
		}
	}

	return r
}

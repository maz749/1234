package middleware

import (
	"facade-platform/internal/services"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthRequired(svc *services.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "требуется авторизация"})
			return
		}
		tokenStr := strings.TrimPrefix(auth, "Bearer ")
		userID, err := svc.ValidateToken(tokenStr)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "недействительный токен"})
			return
		}
		c.Set("user_id", userID)
		c.Next()
	}
}

func OptionalAuth(svc *services.Service) gin.HandlerFunc {
	return func(c *gin.Context) {
		auth := c.GetHeader("Authorization")
		if auth != "" {
			tokenStr := strings.TrimPrefix(auth, "Bearer ")
			if userID, err := svc.ValidateToken(tokenStr); err == nil {
				c.Set("user_id", userID)
			}
		}
		c.Next()
	}
}

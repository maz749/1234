package services

import (
	"errors"
	"facade-platform/internal/models"
	"facade-platform/internal/repository"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	repo *repository.Repository
}

func New(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

// ── AUTH ──────────────────────────────────────────────────────────────────────

func (s *Service) Register(req models.RegisterRequest) (*models.AuthResponse, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	if err != nil {
		return nil, err
	}
	user, err := s.repo.CreateUser(req.Email, string(hash), req.Name)
	if err != nil {
		return nil, errors.New("email уже используется")
	}
	token, err := generateToken(user.ID)
	if err != nil {
		return nil, err
	}
	return &models.AuthResponse{Token: token, User: *user}, nil
}

func (s *Service) Login(req models.LoginRequest) (*models.AuthResponse, error) {
	user, err := s.repo.GetUserByEmail(req.Email)
	if err != nil {
		return nil, errors.New("неверный email или пароль")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("неверный email или пароль")
	}
	token, err := generateToken(user.ID)
	if err != nil {
		return nil, err
	}
	return &models.AuthResponse{Token: token, User: *user}, nil
}

func generateToken(userID int) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "facade-secret-key-change-in-prod"
	}
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(30 * 24 * time.Hour).Unix(),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
}

func (s *Service) ValidateToken(tokenStr string) (int, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "facade-secret-key-change-in-prod"
	}
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return 0, errors.New("invalid token")
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, errors.New("invalid claims")
	}
	userID := int(claims["user_id"].(float64))
	return userID, nil
}

// ── MATERIALS ─────────────────────────────────────────────────────────────────

func (s *Service) GetMaterials() ([]models.Material, error) {
	return s.repo.GetMaterials()
}

func (s *Service) GetMaterialByID(id int) (*models.Material, error) {
	return s.repo.GetMaterialByID(id)
}

// ── FACADES ───────────────────────────────────────────────────────────────────

func (s *Service) GetFacades(category string) ([]models.Facade, error) {
	return s.repo.GetFacades(category)
}

// ── CALCULATOR ────────────────────────────────────────────────────────────────

func (s *Service) Calculate(req models.CalculatorRequest) (*models.CalculatorResponse, error) {
	mat, err := s.repo.GetMaterialByID(req.MaterialID)
	if err != nil {
		return nil, errors.New("материал не найден")
	}

	area := req.Width * req.Height
	basePrice := area * mat.PricePerM2
	doorsPrice := float64(req.Doors) * mat.PricePerM2 * 0.3
	drawersPrice := float64(req.Drawers) * mat.PricePerM2 * 0.2

	return &models.CalculatorResponse{
		Area:         area,
		MaterialName: mat.Name,
		PricePerM2:   mat.PricePerM2,
		BasePrice:    basePrice,
		DoorsPrice:   doorsPrice,
		DrawersPrice: drawersPrice,
		TotalPrice:   basePrice + doorsPrice + drawersPrice,
	}, nil
}

// ── PROJECTS ──────────────────────────────────────────────────────────────────

func (s *Service) GetProjects(userID int) ([]models.Project, error) {
	return s.repo.GetUserProjects(userID)
}

func (s *Service) GetProject(id, userID int) (*models.Project, error) {
	return s.repo.GetProjectByID(id, userID)
}

func (s *Service) CreateProject(userID int, name, configJSON string) (*models.Project, error) {
	if name == "" {
		name = "Мой проект"
	}
	return s.repo.CreateProject(userID, name, configJSON)
}

func (s *Service) UpdateProject(id, userID int, name, configJSON string) (*models.Project, error) {
	return s.repo.UpdateProject(id, userID, name, configJSON)
}

func (s *Service) DeleteProject(id, userID int) error {
	return s.repo.DeleteProject(id, userID)
}

// ── ORDERS ────────────────────────────────────────────────────────────────────

func (s *Service) CreateOrder(order *models.Order) (*models.Order, error) {
	return s.repo.CreateOrder(order)
}

func (s *Service) GetOrders() ([]models.Order, error) {
	return s.repo.GetOrders()
}

package handlers

import (
	"facade-platform/internal/models"
	"facade-platform/internal/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	svc *services.Service
}

func New(svc *services.Service) *Handler {
	return &Handler{svc: svc}
}

func userID(c *gin.Context) int {
	id, _ := c.Get("user_id")
	if v, ok := id.(int); ok {
		return v
	}
	return 0
}

// ── AUTH ──────────────────────────────────────────────────────────────────────

func (h *Handler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	resp, err := h.svc.Register(req)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, resp)
}

func (h *Handler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	resp, err := h.svc.Login(req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, resp)
}

// ── MATERIALS ─────────────────────────────────────────────────────────────────

func (h *Handler) GetMaterials(c *gin.Context) {
	materials, err := h.svc.GetMaterials()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, materials)
}

func (h *Handler) GetMaterial(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	mat, err := h.svc.GetMaterialByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "материал не найден"})
		return
	}
	c.JSON(http.StatusOK, mat)
}

// ── FACADES ───────────────────────────────────────────────────────────────────

func (h *Handler) GetFacades(c *gin.Context) {
	category := c.Query("category")
	facades, err := h.svc.GetFacades(category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, facades)
}

// ── CALCULATOR ────────────────────────────────────────────────────────────────

func (h *Handler) Calculate(c *gin.Context) {
	var req models.CalculatorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := h.svc.Calculate(req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, result)
}

// ── PROJECTS ──────────────────────────────────────────────────────────────────

func (h *Handler) GetProjects(c *gin.Context) {
	projects, err := h.svc.GetProjects(userID(c))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, projects)
}

func (h *Handler) GetProject(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	p, err := h.svc.GetProject(id, userID(c))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "проект не найден"})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *Handler) CreateProject(c *gin.Context) {
	var body struct {
		Name       string `json:"name"`
		ConfigJSON string `json:"config_json"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	p, err := h.svc.CreateProject(userID(c), body.Name, body.ConfigJSON)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, p)
}

func (h *Handler) UpdateProject(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var body struct {
		Name       string `json:"name"`
		ConfigJSON string `json:"config_json"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	p, err := h.svc.UpdateProject(id, userID(c), body.Name, body.ConfigJSON)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *Handler) DeleteProject(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	if err := h.svc.DeleteProject(id, userID(c)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// ── ORDERS ────────────────────────────────────────────────────────────────────

func (h *Handler) CreateOrder(c *gin.Context) {
	var order models.Order
	if err := c.ShouldBindJSON(&order); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	created, err := h.svc.CreateOrder(&order)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, created)
}

// ── HEALTH ────────────────────────────────────────────────────────────────────

func (h *Handler) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "facade-platform-api"})
}

# Facade Platform

Платформа для конфигурации интерьерных фасадов с 3D визуализацией и AI-превью.

## Стек
- **Frontend**: Next.js 14, Three.js / React Three Fiber, Zustand, Framer Motion
- **Backend**: Go 1.22, Gin, PostgreSQL, JWT
- **AI Service**: Python, FastAPI, OpenCV, Pillow
- **Инфраструктура**: Docker, docker-compose

## Быстрый старт (рекомендуется)

```bash
# Клонировать репозиторий
git clone <repo-url>
cd facade-platform

# Скопировать конфиги
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local   # или уже есть .env.local

# Запустить всё одной командой
docker-compose up --build

# → Frontend:    http://localhost:3000
# → Backend API: http://localhost:8080
# → AI Service:  http://localhost:8000
# → API Docs:    http://localhost:8000/docs
```

---

## Локальный запуск без Docker

### 1. База данных

```bash
# Через Docker (только БД)
docker run -d --name facade-db \
  -e POSTGRES_DB=facade \
  -e POSTGRES_USER=facade_user \
  -e POSTGRES_PASSWORD=secret \
  -p 5432:5432 postgres:16
```

### 2. Backend (Go)

```bash
cd backend
cp .env.example .env        # настройте если нужно
go mod tidy
go run cmd/server/main.go

# → http://localhost:8080
# База мигрирует и заполняется автоматически при первом запуске
```

### 3. AI Service (Python)

```bash
cd ai-service
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# → http://localhost:8000
# → Документация API: http://localhost:8000/docs
```

### 4. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev

# → http://localhost:3000
```

---

## API Endpoints

| Метод | URL | Описание |
|-------|-----|----------|
| GET | /api/v1/health | Проверка сервера |
| GET | /api/v1/materials | Список материалов |
| GET | /api/v1/materials/:id | Материал по ID |
| GET | /api/v1/facades | Каталог фасадов |
| POST | /api/v1/calculator | Расчёт стоимости |
| POST | /api/v1/auth/register | Регистрация |
| POST | /api/v1/auth/login | Вход |
| GET | /api/v1/projects | Проекты пользователя |
| POST | /api/v1/projects | Создать проект |
| PUT | /api/v1/projects/:id | Обновить проект |
| DELETE | /api/v1/projects/:id | Удалить проект |
| POST | /api/v1/orders | Отправить заявку |

### AI Service
| Метод | URL | Описание |
|-------|-----|----------|
| POST | /api/v1/preview | Сгенерировать превью (binary) |
| POST | /api/v1/preview/base64 | Сгенерировать превью (base64 JSON) |

---

## Структура проекта

```
facade-platform/
├── frontend/              # Next.js приложение
│   ├── src/app/           # Страницы (App Router)
│   │   ├── page.tsx       # Главная
│   │   ├── facades/       # Каталог материалов
│   │   ├── configurator/  # 3D конфигуратор
│   │   ├── calculator/    # Калькулятор стоимости
│   │   ├── gallery/       # AI-превью
│   │   ├── projects/      # Сохранённые проекты
│   │   ├── contacts/      # Форма заявки
│   │   └── auth/          # Вход/регистрация
│   ├── src/three/         # Three.js сцены
│   ├── src/services/      # API клиент
│   └── src/store/         # Zustand store
│
├── backend/               # Go API сервер
│   ├── cmd/server/        # Точка входа
│   └── internal/
│       ├── api/           # Router + handlers
│       ├── services/      # Бизнес-логика
│       ├── repository/    # Работа с БД
│       ├── models/        # Типы данных
│       ├── database/      # Подключение + миграции
│       └── middleware/    # Auth middleware
│
├── ai-service/            # Python FastAPI
│   ├── main.py            # Точка входа
│   ├── routers/           # API роуты
│   └── services/          # Сегментация изображений
│
├── docker-compose.yml     # Запуск всего стека
└── README.md
```

---

## Дорожная карта

- [x] Phase 1: Core Website (лендинг, каталог, контакты, API)
- [x] Phase 2: Calculator (расчёт стоимости фасада)
- [x] Phase 3: 3D Configurator (Three.js kitchen/wardrobe)
- [x] Phase 4: Save Projects (JWT авторизация, CRUD проектов)
- [x] Phase 5: AI Preview (загрузка фото, сегментация, замена текстур)

---

## Деплой

```
Frontend  → Vercel (next.config.mjs уже настроен)
Backend   → VPS / Railway / Fly.io
AI Service → Docker container на VPS
Database  → Managed PostgreSQL (Supabase, Neon, Railway)
```
# 1234

# Team Task Manager

A professional, full-stack task management application built with Spring Boot and React. Designed for teams to collaborate, assign tasks, and track project progress with role-based access control.

## 🚀 Features
- **Project Management**: Create and organize projects.
- **Task & Subtask Assignment**: Assign work to specific team members.
- **Role-Based Access Control (RBAC)**: Distinct permissions for Owners, Contributors, and Viewers.
- **Interactive Dashboard**: Visualized statistics of project health and task completion.
- **Modern UI**: Sleek, dark-mode interface with glassmorphism aesthetics.
- **Real-time Security**: Robust JWT-based authentication.

## 🛠 Tech Stack
- **Frontend**: React, Vite, TailwindCSS (for custom styling), Lucide Icons, Framer Motion.
- **Backend**: Java 17, Spring Boot 3.3, Spring Security, Spring Data JPA.
- **Database**: PostgreSQL.
- **Caching**: Redis.
- **Deployment**: Railway (Nixpacks).

## ⚙️ Environment Variables

### Backend
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | JDBC connection string for PostgreSQL |
| `DATABASE_USER` | Database username |
| `DATABASE_PASSWORD` | Database password |
| `REDIS_HOST` | Redis server hostname |
| `REDIS_PORT` | Redis server port |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontend URLs for CORS |

### Frontend
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | The full URL to the backend API (ending in /api) |

## 📦 Local Setup

### Backend
1. Navigate to `spring/backend`.
2. Ensure you have PostgreSQL and Redis running locally.
3. Run `./mvnw spring-boot:run`.

### Frontend
1. Navigate to `spring/frontend`.
2. Run `npm install`.
3. Create a `.env` file with `VITE_API_URL=http://localhost:8080/api`.
4. Run `npm run dev`.

## 🌐 Deployment (Railway)
1. Connect your GitHub repository to Railway.
2. Set the **Root Directory** for the backend service to `spring/backend`.
3. Set the **Root Directory** for the frontend service to `spring/frontend`.
4. Configure the environment variables as listed above.
5. Ensure the backend `ALLOWED_ORIGINS` matches the frontend's generated URL.

---
Built with ❤️ by Antigravity AI

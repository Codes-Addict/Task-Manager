TEAM TASK MANAGER - PROJECT OVERVIEW
===================================

A full-stack task management application designed for professional team collaboration.

TECH STACK:
- Backend: Java Spring Boot 3.3, Spring Security, JPA
- Frontend: React, Vite, Tailwind
- Database: PostgreSQL
- Caching: Redis

CORE FEATURES:
- User Authentication (JWT)
- Project Creation & Management
- Team Member Assignments
- Task/Subtask Tracking
- Role-Based Permissions (Owner, Contributor, Viewer)
- Dashboard Analytics

DEPLOYMENT GUIDE (RAILWAY):
1. Connect GitHub repository.
2. Set Root Directory for Backend: spring/backend
3. Set Root Directory for Frontend: spring/frontend
4. Configure Variables:
   - Backend: DATABASE_URL, DATABASE_USER, DATABASE_PASSWORD, REDIS_HOST, JWT_SECRET, ALLOWED_ORIGINS
   - Frontend: VITE_API_URL (pointing to backend/api)

IMPORTANT:
Always ensure the backend's ALLOWED_ORIGINS matches your frontend URL to prevent CORS errors.

Created on: May 3, 2026
Assistant: Antigravity AI

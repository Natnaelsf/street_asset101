# Smart Street Light Pole Management System - Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Nginx (Reverse Proxy)              │
│                   Port 80 / 443 (HTTPS)                 │
├──────────────────────┬──────────────────────────────────┤
│   Frontend (Next.js) │   Backend (NestJS API)           │
│   Port 3000          │   Port 4000                      │
├──────────────────────┴──────────────────────────────────┤
│                   PostgreSQL + PostGIS                   │
│                       Port 5432                          │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

- Docker & Docker Compose v2+
- Node.js 20+ (for local development)
- PostgreSQL 16 with PostGIS extension
- Git

## Remote Ubuntu Server Deployment

If you are deploying to an external Ubuntu server (for example, VM at `192.168.213.128`), ensure the server has Docker installed and the repository is copied there. Use the helper script:

```bash
sudo bash scripts/ubuntu-docker-server-setup.sh
```

After installation, create a root `.env` file from the example if needed, then run the deploy commands from the repository root on the server.

```bash
cp .env.example .env
# set CORS_ORIGIN and NEXT_PUBLIC_API_URL if the server is accessed as http://192.168.213.128
# CORS_ORIGIN=http://192.168.213.128
# NEXT_PUBLIC_API_URL=http://192.168.213.128/api/v1
```

## Quick Start (Docker)

### 1. Clone & Configure

```bash
git clone <repository-url>
cd smart-street-light-system

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

### 2. Set Environment Variables

Edit `backend/.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/street_light_db"
JWT_SECRET="your-strong-secret-here"
JWT_REFRESH_SECRET="your-strong-refresh-secret-here"
```

### 3. Start Services

```bash
docker-compose up -d --build
```

This starts:
- PostgreSQL with PostGIS on port 5432
- Backend API on port 4000
- Frontend on port 3000
- Nginx reverse proxy on port 80

### 4. Run Database Migrations & Seed

```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

### 5. Access Application

- Frontend: http://localhost:3000
- API: http://localhost:4000/api/v1
- Default login: director.general@streetlight.gov / Admin@123

## Local Development

### Backend

```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npx prisma db seed
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | Required |
| JWT_SECRET | JWT signing secret | Required |
| JWT_REFRESH_SECRET | Refresh token secret | Required |
| JWT_EXPIRATION | Access token expiry | 15m |
| JWT_REFRESH_EXPIRATION | Refresh token expiry | 7d |
| PORT | API server port | 4000 |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:3000 |
| UPLOAD_DIR | File upload directory | ./uploads |
| SMTP_HOST | Email server host | Optional |
| SMS_API_KEY | SMS gateway key | Optional |

### Frontend (.env.local)

| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | http://localhost:4000/api/v1 |
| NEXT_PUBLIC_MAPBOX_TOKEN | Mapbox token (optional) | |
| NEXT_PUBLIC_DEFAULT_MAP_CENTER | Default map center | 9.0243,38.7468 |

## RBAC Permission Matrix

| Role | Poles | Incidents | Work Orders | Inventory | Users | Reports |
|------|-------|-----------|-------------|-----------|-------|---------|
| Director General | View | View | View | View | View | All |
| Engineering DDG | View | - | View | - | - | View |
| Procurement Dir | - | - | - | View | - | - |
| Design/Project Dir | View | - | - | - | - | - |
| License & Permit DDG | CRUD | - | - | - | - | - |
| ICT Director | CRUD | - | - | - | CRUD | All |
| O&M DDG | CRUD | Approve | Approve | Approve | - | View |
| O&M Director | CRUD | View | Create | Create | - | - |
| Region Directors | - | Create | Create | Create | - | - |
| Call Center Agent | - | Create | - | - | - | - |
| Engineer | - | - | Execute | - | - | - |
| Supervisor | - | Create | - | - | - | - |

## Production Deployment Checklist

- [ ] Change all default passwords and secrets
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Set up email/SMS provider credentials
- [ ] Configure file storage (S3 or local)
- [ ] Enable rate limiting
- [ ] Run security audit
- [ ] Set up CI/CD pipeline
- [ ] Configure automated database backups
- [ ] Set up health check endpoints
- [ ] Configure log rotation

## API Endpoints

### Authentication
- POST /api/v1/auth/login
- POST /api/v1/auth/register
- POST /api/v1/auth/refresh
- GET /api/v1/auth/profile

### Poles
- GET /api/v1/poles (list with pagination)
- POST /api/v1/poles (create)
- GET /api/v1/poles/:id
- PUT /api/v1/poles/:id
- DELETE /api/v1/poles/:id
- GET /api/v1/poles/gis (GIS data)
- POST /api/v1/poles/import (bulk import)
- GET /api/v1/poles/import-history

### Incidents
- GET /api/v1/incidents
- POST /api/v1/incidents
- GET /api/v1/incidents/:id
- PUT /api/v1/incidents/:id
- GET /api/v1/incidents/sla-stats

### Work Orders
- GET /api/v1/work-orders
- POST /api/v1/work-orders
- GET /api/v1/work-orders/:id
- PUT /api/v1/work-orders/:id
- POST /api/v1/work-orders/:id/comments

### Maintenance
- POST /api/v1/maintenance/reports/:workOrderId
- PUT /api/v1/maintenance/reviews/:reportId
- PUT /api/v1/maintenance/issues/:incidentId/approve
- GET /api/v1/maintenance/stats

### Inventory
- GET /api/v1/inventory/items
- POST /api/v1/inventory/items
- GET /api/v1/inventory/requests
- POST /api/v1/inventory/requests
- PUT /api/v1/inventory/requests/:id/approve
- GET /api/v1/inventory/low-stock

### Dashboard
- GET /api/v1/dashboard/overview
- GET /api/v1/dashboard/regional-comparison
- GET /api/v1/dashboard/maintenance-stats
- GET /api/v1/dashboard/fault-statistics
- GET /api/v1/dashboard/recent-activities

### Reports
- GET /api/v1/reports/pole-inventory?format=pdf|excel|csv
- GET /api/v1/reports/maintenance?format=pdf|excel|csv
- GET /api/v1/reports/incidents?format=pdf|excel|csv

### Notifications
- GET /api/v1/notifications
- PUT /api/v1/notifications/:id/read
- PUT /api/v1/notifications/read-all

### Users
- GET /api/v1/users
- GET /api/v1/users/:id
- PUT /api/v1/users/:id
- DELETE /api/v1/users/:id
- GET /api/v1/users/permissions

### Regions
- GET /api/v1/regions
- GET /api/v1/regions/subcities

### Utility
- POST /api/v1/attachments/upload
- GET /api/v1/call-logs
- POST /api/v1/call-logs
- GET /api/v1/audit-logs

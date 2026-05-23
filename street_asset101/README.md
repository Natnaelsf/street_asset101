# Smart Street Light Pole Management System

Enterprise-grade full-stack web application for government smart city street light administration.

## Architecture

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Leaflet.js, Recharts
- **Backend**: NestJS, Prisma ORM, PostgreSQL + PostGIS, JWT Auth, RBAC
- **DevOps**: Docker, Nginx, CI/CD ready

## Quick Start

```bash
# Using Docker
docker-compose up -d --build
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed

# Access at http://localhost:3000
# Login: director.general@streetlight.gov / Admin@123
```

## Modules

1. **Street Light Pole Registry** - GIS-enabled asset management with map view
2. **Call Center** - Incident tracking, SLA management, call logging
3. **Maintenance Workflow** - Multi-step approval workflow (7 steps)
4. **Inventory** - Spare parts tracking, low stock alerts
5. **Dashboard & Analytics** - KPIs, charts, regional comparisons
6. **Reporting** - PDF/Excel/CSV export

## RBAC Roles

17 hierarchical roles from Director General to Maintenance Engineer, with regional divisions (North, South, East, West).

## API

RESTful API at `/api/v1/` with complete CRUD for all entities, file upload, and report generation.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete deployment guide.

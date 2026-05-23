#!/usr/bin/env bash
set -euo pipefail

# complete-deploy.sh
# Usage: sudo bash scripts/complete-deploy.sh [REPO_DIR] [HOST_IP]
# Example: sudo bash scripts/complete-deploy.sh /opt/street_asset101 192.168.213.128

REPO_DIR="${1:-$(pwd)}"
HOST_IP="${2:-192.168.213.128}"

echo "Using repository directory: $REPO_DIR"
echo "Using public host IP: $HOST_IP"

if [[ $(id -u) -ne 0 ]]; then
  echo "This script should be run as root (sudo). Running with sudo is recommended."
  exit 1
fi

# Install Docker if missing
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found — installing Docker Engine and Compose plugin..."
  apt-get update
  apt-get install -y ca-certificates curl gnupg lsb-release
  mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  CODENAME=$(lsb_release -cs)
  # fallback to jammy if Docker doesn't support the release codename
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${CODENAME} stable" > /etc/apt/sources.list.d/docker.list || true
  apt-get update || true
  if ! apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin; then
    echo "Stable Docker packages not available for codename '${CODENAME}'. Retrying with 'jammy'..."
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu jammy stable" > /etc/apt/sources.list.d/docker.list
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  fi
  systemctl enable --now docker
else
  echo "Docker already installed."
fi

# Ensure git is available
if ! command -v git >/dev/null 2>&1; then
  apt-get update
  apt-get install -y git
fi

# Move to repo dir
cd "$REPO_DIR"

# If repository is a parent folder (street_asset101/street_asset101), detect nested repo
if [[ -d "${REPO_DIR}/street_asset101" && -f "${REPO_DIR}/street_asset101/docker-compose.yml" ]]; then
  echo "Detected nested repo at ${REPO_DIR}/street_asset101 — switching into it."
  cd "${REPO_DIR}/street_asset101"
fi

# Create .env from example if missing
if [[ ! -f .env ]]; then
  if [[ -f .env.example ]]; then
    cp .env.example .env
    echo "Created .env from .env.example"
  else
    echo ".env.example not found; creating minimal .env"
    cat > .env <<EOF
CORS_ORIGIN="http://$HOST_IP"
NEXT_PUBLIC_API_URL="http://$HOST_IP/api/v1"
JWT_SECRET="$(head -c 32 /dev/urandom | base64)"
JWT_REFRESH_SECRET="$(head -c 32 /dev/urandom | base64)"
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/street_light_db?schema=public"
EOF
  fi
else
  echo ".env exists — updating host-specific values"
  sed -i "s|^CORS_ORIGIN=.*|CORS_ORIGIN=\"http://$HOST_IP\"|" .env || true
  sed -i "s|^NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=\"http://$HOST_IP/api/v1\"|" .env || true
fi

# Build and start compose stack
echo "Bringing up Docker Compose stack..."
docker compose up -d --build

# Wait for postgres to be healthy (if image provides healthcheck)
echo "Waiting for PostgreSQL to be ready..."
for i in {1..60}; do
  if docker compose ps | grep -E "postgres|postgis" | grep -E "healthy|Up" >/dev/null 2>&1; then
    echo "Postgres appears up."
    break
  fi
  sleep 2
done

# Run migrations and seed
echo "Running Prisma migrations and seed inside backend container..."
set +e
RETRY=0
until docker compose exec -T backend npx prisma migrate deploy 2>/dev/null; do
  RETRY=$((RETRY+1))
  if [ "$RETRY" -ge 10 ]; then
    echo "Migrations failed after multiple attempts. Showing backend logs and exiting."
    docker compose logs --tail 200 backend
    exit 1
  fi
  echo "Waiting for backend to be ready for migrations (attempt $RETRY)..."
  sleep 5
done
# seed
docker compose exec -T backend npx prisma db seed || echo "Seeding may have failed or is not needed."
set -e

echo "Deployment finished. Application should be available at http://$HOST_IP"

# Show the running containers
docker compose ps

EOF
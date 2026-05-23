#!/usr/bin/env bash
set -euo pipefail

if [[ $(id -u) -ne 0 ]]; then
  echo "This script must be run as root or with sudo."
  exit 1
fi

echo "Installing prerequisites..."
apt-get update
apt-get install -y ca-certificates curl gnupg lsb-release apt-transport-https software-properties-common

echo "Adding Docker official repository..."
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
ARCH=$(dpkg --print-architecture)
RELEASE=$(lsb_release -cs)
cat > /etc/apt/sources.list.d/docker.list <<EOF

deb [arch=${ARCH} signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${RELEASE} stable
EOF

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "Enabling Docker service..."
systemctl enable --now docker

if [[ -n "${SUDO_USER:-}" && "${SUDO_USER}" != "root" ]]; then
  echo "Adding ${SUDO_USER} to docker group..."
  usermod -aG docker "${SUDO_USER}"
fi

cat <<'EOF'

Docker installation complete.

Next steps from the project root on the Ubuntu server:
  cd /path/to/street_asset101
  docker compose up -d --build
  docker compose exec backend npx prisma migrate deploy
  docker compose exec backend npx prisma db seed

If the server is remote and you access it via browser, open:
  http://192.168.213.128

Note: adjust backend .env and docker-compose values if you want the frontend/API to use the remote host address explicitly.
EOF

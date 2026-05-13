#!/bin/bash
# Docker clean rebuild script for combined-dashboard-work branch

echo "🔍 Current branch: $(git branch --show-current)"
echo "📝 Latest commit: $(git log --oneline -1)"
echo ""

# Confirm we're on the right branch
if [ "$(git branch --show-current)" != "combined-dashboard-work" ]; then
    echo "❌ ERROR: Not on combined-dashboard-work branch!"
    echo "   Run: git checkout combined-dashboard-work"
    exit 1
fi

echo "🧹 Cleaning Docker containers and volumes..."
cd ..
docker compose down -v

echo "🗑️  Removing Docker build cache..."
docker builder prune -f

echo "🏗️  Rebuilding Docker images (no cache)..."
docker compose build --no-cache superset-node

echo "✅ Build complete! Starting services..."
docker compose up -d

echo ""
echo "📊 Check logs with: docker compose logs -f superset_app"
echo "🌐 Access Superset at: http://localhost:8088"

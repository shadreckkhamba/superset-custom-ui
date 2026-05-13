#!/bin/bash
# Docker clean rebuild script for combined-dashboard-work branch

echo "🔍 Current branch: $(git branch --show-current)"
echo "📝 Latest commit: $(git log --oneline -1)"
echo ""

# Confirm we're on the right branch
EXPECTED_BRANCH="combined-features-clean"
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$EXPECTED_BRANCH" ]; then
    echo "❌ ERROR: Not on $EXPECTED_BRANCH branch!"
    echo "   Current branch: $CURRENT_BRANCH"
    echo "   Run: git checkout $EXPECTED_BRANCH"
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

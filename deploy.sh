#!/bin/bash
# SmartResume Builder - Quick Deployment Script
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 SmartResume Builder v1.0 Deployment Script"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker${NC}"

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

echo ""
echo "📦 Building application..."

# Backend build
echo "  Building backend..."
cd resume-builder/backend
npm install --legacy-peer-deps
npm run build
echo -e "  ${GREEN}✅ Backend built${NC}"

# Frontend build
echo "  Building frontend..."
cd ../frontend
npm install --legacy-peer-deps
npm run build
echo -e "  ${GREEN}✅ Frontend built${NC}"

cd ../..

echo ""
echo "🐳 Building Docker image..."
docker build -t resume-builder:1.0.0 -f Dockerfile . --quiet
echo -e "${GREEN}✅ Docker image built${NC}"

echo ""
echo "📝 Creating .env file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠️  .env file created from template${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env with your configuration${NC}"
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

echo ""
echo "✨ Deployment preparation complete!"
echo ""
echo "🟢 Next steps:"
echo "  1. Edit .env with your configuration:"
echo "     - DATABASE_URL"
echo "     - JWT_SECRET"
echo "     - GEMINI_API_KEY"
echo ""
echo "  2. Start services with Docker Compose:"
echo "     docker-compose up --build"
echo ""
echo "  3. Verify health check:"
echo "     curl http://localhost:3000/health"
echo ""
echo "  4. Access application:"
echo "     Frontend: http://localhost:5173"
echo "     Backend:  http://localhost:3000"
echo ""

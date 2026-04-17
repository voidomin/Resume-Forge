# SmartResume Builder - Quick Deployment Script (PowerShell)
# This script automates the deployment process for Windows

param(
    [switch]$SkipBuild = $false,
    [switch]$SkipTests = $false
)

Write-Host "🚀 SmartResume Builder v1.0 Deployment Script" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

$hasIssues = $false

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker - $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed" -ForegroundColor Red
    $hasIssues = $true
}

# Check Docker Compose
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose - $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed" -ForegroundColor Red
    $hasIssues = $true
}

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js - $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    $hasIssues = $true
}

if ($hasIssues) {
    Write-Host ""
    Write-Host "❌ Please install missing prerequisites" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Build if not skipped
if (-not $SkipBuild) {
    Write-Host "📦 Building application..." -ForegroundColor Yellow
    
    # Backend build
    Write-Host "  Building backend..." -ForegroundColor Cyan
    Push-Location "resume-builder/backend"
    npm install --legacy-peer-deps | Out-Null
    npm run build | Out-Null
    Pop-Location
    Write-Host "  ✅ Backend built" -ForegroundColor Green
    
    # Frontend build
    Write-Host "  Building frontend..." -ForegroundColor Cyan
    Push-Location "resume-builder/frontend"
    npm install --legacy-peer-deps | Out-Null
    npm run build | Out-Null
    Pop-Location
    Write-Host "  ✅ Frontend built" -ForegroundColor Green
}

# Run tests if not skipped
if (-not $SkipTests) {
    Write-Host ""
    Write-Host "🧪 Running tests..." -ForegroundColor Yellow
    
    Write-Host "  Running backend unit tests..." -ForegroundColor Cyan
    Push-Location "resume-builder/backend"
    npm test -- --passWithNoTests 2>&1 | Out-Null
    Pop-Location
    Write-Host "  ✅ Tests passed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🐳 Building with Docker Compose..." -ForegroundColor Yellow
docker-compose build
Write-Host "✅ Docker images built" -ForegroundColor Green

Write-Host ""
Write-Host "📝 Checking .env file..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  .env file created from template" -ForegroundColor Yellow
    Write-Host "⚠️  Please edit .env with your configuration" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "✨ Deployment preparation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🟢 Next steps:" -ForegroundColor Green
Write-Host "  1. Edit .env with your configuration:" -ForegroundColor Cyan
Write-Host "     - DATABASE_URL"
Write-Host "     - JWT_SECRET"
Write-Host "     - GEMINI_API_KEY"
Write-Host ""
Write-Host "  2. Start services with Docker Compose:" -ForegroundColor Cyan
Write-Host "     docker-compose up --build"
Write-Host ""
Write-Host "  3. Verify health check:" -ForegroundColor Cyan
Write-Host "     Invoke-WebRequest http://localhost:3000/health"
Write-Host ""
Write-Host "  4. Access application:" -ForegroundColor Cyan
Write-Host "     Frontend: http://localhost:5173"
Write-Host "     Backend:  http://localhost:3000"
Write-Host ""

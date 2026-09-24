#!/usr/bin/env powershell
# =====================================================
# SonarQube Setup Script for TaskFlow
# Windows PowerShell
# =====================================================

Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      TaskFlow - SonarQube Setup Script      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Variables
$PROJECT_DIR = $PSScriptRoot
$SONAR_DOCKER_NAME = "sonarqube"
$SONAR_PORT = "9000"
$SONAR_URL = "http://localhost:$SONAR_PORT"

# =====================================================
# Funciones
# =====================================================

function Write-Step {
    param([string]$message)
    Write-Host "▶ $message" -ForegroundColor Green
}

function Write-Info {
    param([string]$message)
    Write-Host "ℹ $message" -ForegroundColor Blue
}

function Write-Error-Custom {
    param([string]$message)
    Write-Host "✗ $message" -ForegroundColor Red
}

function Write-Success {
    param([string]$message)
    Write-Host "✓ $message" -ForegroundColor Green
}

# =====================================================
# Menú Principal
# =====================================================

function Show-Menu {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║              SONARQUBE SETUP               ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Selecciona una opción:" -ForegroundColor Yellow
    Write-Host "  1. Verificar requisitos"
    Write-Host "  2. Instalar SonarQube en Docker"
    Write-Host "  3. Generar reporte de cobertura (Backend)"
    Write-Host "  4. Ejecutar análisis SonarQube (Backend)"
    Write-Host "  5. Generar reporte de cobertura (Frontend)"
    Write-Host "  6. Ver dashboard SonarQube"
    Write-Host "  7. Detener SonarQube"
    Write-Host "  8. Eliminar SonarQube"
    Write-Host "  9. Ejecutar todo (1-4)"
    Write-Host "  0. Salir"
    Write-Host ""
}

# =====================================================
# Verificaciones
# =====================================================

function Check-Requirements {
    Write-Step "Verificando requisitos..."
    Write-Host ""
    
    # Verificar Node.js
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Success "Node.js: $nodeVersion"
    } else {
        Write-Error-Custom "Node.js no está instalado"
        return $false
    }
    
    # Verificar npm
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Success "npm: v$npmVersion"
    } else {
        Write-Error-Custom "npm no está instalado"
        return $false
    }
    
    # Verificar Docker
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Success "Docker: $dockerVersion"
    } else {
        Write-Error-Custom "Docker no está instalado. Descargarlo desde https://www.docker.com/"
        return $false
    }
    
    # Verificar archivo de configuración
    if (Test-Path "$PROJECT_DIR\sonar-project.properties") {
        Write-Success "Archivo: sonar-project.properties"
    } else {
        Write-Error-Custom "sonar-project.properties no encontrado"
        return $false
    }
    
    # Verificar jest.config.js
    if (Test-Path "$PROJECT_DIR\jest.config.js") {
        Write-Success "Archivo: jest.config.js"
    } else {
        Write-Error-Custom "jest.config.js no encontrado"
        return $false
    }
    
    Write-Host ""
    Write-Success "Todos los requisitos están cumplidos ✓"
    return $true
}

# =====================================================
# Docker
# =====================================================

function Install-SonarQube-Docker {
    Write-Step "Instalando SonarQube en Docker..."
    Write-Host ""
    
    # Verificar si ya existe
    $container = docker ps -a --filter "name=$SONAR_DOCKER_NAME" -q 2>$null
    if ($container) {
        Write-Info "Contenedor existente encontrado. Eliminando..."
        docker stop $SONAR_DOCKER_NAME 2>$null | Out-Null
        docker rm $SONAR_DOCKER_NAME 2>$null | Out-Null
    }
    
    # Crear volúmenes
    Write-Info "Creando volúmenes de persistencia..."
    docker volume create sonarqube_data 2>$null | Out-Null
    docker volume create sonarqube_extensions 2>$null | Out-Null
    docker volume create sonarqube_logs 2>$null | Out-Null
    
    # Ejecutar SonarQube
    Write-Info "Iniciando contenedor SonarQube..."
    docker run -d `
        --name $SONAR_DOCKER_NAME `
        -e SONAR_JDBC_URL="jdbc:h2:tcp://localhost:9092/sonarqube" `
        -e SONAR_JDBC_USER="sa" `
        -e SONAR_JDBC_PASSWORD="" `
        -v sonarqube_data:/opt/sonarqube/data `
        -v sonarqube_extensions:/opt/sonarqube/extensions `
        -v sonarqube_logs:/opt/sonarqube/logs `
        -p $SONAR_PORT`:9000 `
        sonarqube:latest | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "SonarQube iniciado en Docker"
        Write-Host ""
        
        # Esperar a que se inicie
        Write-Info "Esperando que SonarQube se inicie (esto puede tardar 1-2 minutos)..."
        $maxAttempts = 30
        $attempt = 0
        
        while ($attempt -lt $maxAttempts) {
            $response = Invoke-WebRequest -Uri $SONAR_URL -ErrorAction SilentlyContinue -TimeoutSec 2
            if ($response.StatusCode -eq 200) {
                Write-Success "SonarQube está listo"
                break
            }
            $attempt++
            Write-Host "." -NoNewline
            Start-Sleep -Seconds 4
        }
        
        Write-Host ""
        Write-Host ""
        Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║       SonarQube está listo para usar       ║" -ForegroundColor Green
        Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
        Write-Host ""
        Write-Host "URL:              $SONAR_URL" -ForegroundColor Cyan
        Write-Host "Usuario:          admin" -ForegroundColor Cyan
        Write-Host "Contraseña:       admin" -ForegroundColor Cyan
        Write-Host ""
        Write-Info "⚠️ Cambiar contraseña en primera ejecución"
        Write-Host ""
    } else {
        Write-Error-Custom "Error al iniciar SonarQube"
        return $false
    }
    
    return $true
}

# =====================================================
# Tests y Cobertura
# =====================================================

function Generate-Coverage-Backend {
    Write-Step "Generando reporte de cobertura (Backend)..."
    Write-Host ""
    
    Set-Location $PROJECT_DIR
    npm run test:cov 2>&1 | Tee-Object -Variable output
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Success "Reporte de cobertura generado"
        Write-Info "Ubicación: $PROJECT_DIR\coverage\lcov.info"
        
        # Mostrar estadísticas
        if (Test-Path "$PROJECT_DIR\coverage\coverage-summary.json") {
            $summary = Get-Content "$PROJECT_DIR\coverage\coverage-summary.json" -Raw | ConvertFrom-Json
            Write-Host ""
            Write-Host "Estadísticas:" -ForegroundColor Cyan
            Write-Host "  Lines:       $($summary.total.lines.pct)%"
            Write-Host "  Statements:  $($summary.total.statements.pct)%"
            Write-Host "  Functions:   $($summary.total.functions.pct)%"
            Write-Host "  Branches:    $($summary.total.branches.pct)%"
        }
        return $true
    } else {
        Write-Error-Custom "Error al generar reporte de cobertura"
        return $false
    }
}

function Generate-Coverage-Frontend {
    Write-Step "Generando reporte de cobertura (Frontend)..."
    Write-Host ""
    
    $frontendDir = "$PROJECT_DIR\taskflow-frontend"
    if (-not (Test-Path $frontendDir)) {
        Write-Error-Custom "Directorio del frontend no encontrado"
        return $false
    }
    
    Set-Location $frontendDir
    npm run test:cov 2>&1 | Tee-Object -Variable output
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Success "Reporte de cobertura generado"
        Write-Info "Ubicación: $frontendDir\coverage\lcov.info"
        return $true
    } else {
        Write-Error-Custom "Error al generar reporte de cobertura"
        return $false
    }
}

# =====================================================
# Análisis SonarQube
# =====================================================

function Run-SonarQube-Analysis-Backend {
    Write-Step "Ejecutando análisis SonarQube (Backend)..."
    Write-Host ""
    
    # Verificar que SonarQube está corriendo
    $running = docker ps --filter "name=$SONAR_DOCKER_NAME" -q 2>$null
    if (-not $running) {
        Write-Error-Custom "SonarQube no está corriendo"
        Write-Info "Ejecuta la opción 2 para instalar SonarQube primero"
        return $false
    }
    
    Set-Location $PROJECT_DIR
    
    # Instalar scanner si no existe
    if (-not (sonar-scanner --version 2>$null)) {
        Write-Info "Instalando SonarQube Scanner CLI..."
        npm install -g sonarqube-scanner
    }
    
    # Ejecutar análisis
    Write-Info "Ejecutando análisis (esto puede tardar 1-2 minutos)..."
    sonar-scanner -Dsonar.host.url=$SONAR_URL 2>&1 | Tee-Object -Variable output
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Success "Análisis completado"
        Write-Host ""
        Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║    Revisa los resultados en SonarQube     ║" -ForegroundColor Green
        Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
        Write-Host ""
        Write-Host "URL: $SONAR_URL/projects" -ForegroundColor Cyan
        return $true
    } else {
        Write-Error-Custom "Error en el análisis"
        return $false
    }
}

# =====================================================
# Vista del Dashboard
# =====================================================

function Open-SonarQube-Dashboard {
    Write-Step "Abriendo dashboard de SonarQube..."
    
    $running = docker ps --filter "name=$SONAR_DOCKER_NAME" -q 2>$null
    if (-not $running) {
        Write-Error-Custom "SonarQube no está corriendo"
        return
    }
    
    Write-Info "Abriendo navegador..."
    Start-Process $SONAR_URL
}

# =====================================================
# Detener y Eliminar
# =====================================================

function Stop-SonarQube {
    Write-Step "Deteniendo SonarQube..."
    docker stop $SONAR_DOCKER_NAME 2>$null
    Write-Success "SonarQube detenido"
}

function Remove-SonarQube {
    Write-Step "Eliminando SonarQube..."
    docker stop $SONAR_DOCKER_NAME 2>$null
    docker rm $SONAR_DOCKER_NAME 2>$null
    Write-Success "SonarQube eliminado"
}

# =====================================================
# Ejecutar Todo
# =====================================================

function Run-Complete-Setup {
    Write-Step "Ejecutando configuración completa..."
    Write-Host ""
    
    if (-not (Check-Requirements)) {
        return
    }
    
    Write-Host ""
    if (-not (Install-SonarQube-Docker)) {
        return
    }
    
    Write-Host ""
    if (-not (Generate-Coverage-Backend)) {
        return
    }
    
    Write-Host ""
    if (-not (Run-SonarQube-Analysis-Backend)) {
        return
    }
    
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║        ¡Configuración Completada!        ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
}

# =====================================================
# Loop Principal
# =====================================================

do {
    Show-Menu
    $choice = Read-Host "Selecciona una opción"
    
    Write-Host ""
    
    switch ($choice) {
        "1" {
            Check-Requirements
            Pause
        }
        "2" {
            Install-SonarQube-Docker
            Pause
        }
        "3" {
            Generate-Coverage-Backend
            Pause
        }
        "4" {
            Run-SonarQube-Analysis-Backend
            Pause
        }
        "5" {
            Generate-Coverage-Frontend
            Pause
        }
        "6" {
            Open-SonarQube-Dashboard
        }
        "7" {
            Stop-SonarQube
            Pause
        }
        "8" {
            Remove-SonarQube
            Pause
        }
        "9" {
            Run-Complete-Setup
            Pause
        }
        "0" {
            Write-Host "¡Hasta luego!" -ForegroundColor Cyan
            exit
        }
        default {
            Write-Error-Custom "Opción no válida"
        }
    }
    
    Write-Host ""
    
} while ($choice -ne "0")

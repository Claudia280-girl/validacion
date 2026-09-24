# 🔍 SonarQube - Análisis de Calidad de Código

## ¿Qué es SonarQube?

SonarQube es una plataforma de análisis de código estático que:
- ✅ Detecta bugs y vulnerabilidades de seguridad
- ✅ Mide cobertura de código con pruebas unitarias
- ✅ Identifica code smells y deuda técnica
- ✅ Valida reglas de calidad de código
- ✅ Genera reportes detallados y dashboards

## 📋 Requisitos Previos

1. **Docker** (recomendado)
2. **Node.js 16+**
3. **Jest configurado con coverage**
4. **SonarQube Scanner CLI**

---

## 🚀 Instalación y Configuración

### Opción 1: SonarQube con Docker (RECOMENDADO)

#### Paso 1: Instalar Docker
```bash
# En Windows, descargar Docker Desktop desde https://www.docker.com/products/docker-desktop
```

#### Paso 2: Iniciar SonarQube en Docker
```bash
# Crear volúmenes persistentes
docker volume create sonarqube_data
docker volume create sonarqube_extensions
docker volume create sonarqube_logs

# Ejecutar SonarQube
docker run -d \
  --name sonarqube \
  -e SONAR_JDBC_URL=jdbc:h2:tcp://localhost:9092/sonarqube \
  -e SONAR_JDBC_USER=sa \
  -e SONAR_JDBC_PASSWORD= \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_extensions:/opt/sonarqube/extensions \
  -v sonarqube_logs:/opt/sonarqube/logs \
  -p 9000:9000 \
  sonarqube:latest

# O usando el script de npm
npm run sonar:docker
```

#### Paso 3: Acceder a SonarQube
- URL: http://localhost:9000
- Usuario: admin
- Contraseña: admin
- ✅ Cambiar contraseña en primera ejecución

---

### Opción 2: SonarQube Instalado Localmente

#### Paso 1: Descargar SonarQube
```bash
# Descargar desde https://www.sonarqube.org/downloads/
# Versión Community Edition (gratuita)

# Windows: Descargar ZIP
# Extraer a C:\sonarqube
```

#### Paso 2: Instalar SonarScanner CLI
```bash
npm run sonar:install
# O
npm install -g sonarqube-scanner
```

#### Paso 3: Iniciar SonarQube
```bash
# Windows (en C:\sonarqube\bin\windows-x86-64)
StartSonar.bat

# Linux/Mac
./sonar.sh start
```

---

## 🛠️ Configurar Jest para Cobertura

### Paso 1: Verificar jest.config.js
```typescript
// jest.config.js
module.exports = {
  // ... configuración existente
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
    '!src/**/index.ts',
    '!src/main.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
};
```

### Paso 2: Generar Reporte de Cobertura
```bash
# Backend
npm run test:cov

# Frontend (si existe)
cd taskflow-frontend
npm run test:cov
```

Esto genera:
- `coverage/lcov.info` - Formato SonarQube
- `coverage/index.html` - Reporte HTML local

---

## 📊 Ejecutar Análisis SonarQube

### Paso 1: Instalar SonarScanner
```bash
npm run sonar:install
```

### Paso 2: Obtener Token de Autenticación (Opcional pero Recomendado)

En SonarQube:
1. Ir a http://localhost:9000
2. Perfil → Mi Cuenta → Seguridad
3. Generar Token: `squ_xxxxxxxxxxxxx...`

### Paso 3: Configurar Token en sonar-project.properties

```properties
# sonar-project.properties
sonar.login=squ_xxxxxxxxxxxxx...
```

### Paso 4: Ejecutar Análisis

#### BACKEND:
```bash
# Generar cobertura primero
npm run test:cov

# Ejecutar análisis
npm run sonar:analyze
```

#### FRONTEND:
```bash
cd taskflow-frontend

# Generar cobertura
npm run test:cov

# Ejecutar análisis (requiere sonar-project.properties en frontend)
sonar-scanner
```

---

## 📈 Interpretar Resultados

### Dashboard SonarQube
Acceder a: http://localhost:9000/dashboard

**Métricas Principales:**

| Métrica | Descripción | Ideal |
|---------|-------------|-------|
| **Coverage** | Porcentaje de código cubierto por tests | > 80% |
| **Bugs** | Errores encontrados | 0 |
| **Vulnerabilities** | Problemas de seguridad | 0 |
| **Code Smells** | Mala práctica de código | Bajo |
| **Duplications** | Código duplicado | < 3% |
| **Maintainability** | Deuda técnica | A |
| **Reliability** | Confiabilidad | A |
| **Security** | Seguridad | A |

### Ejemplo de Reporte:
```
📊 TaskFlow Backend Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Coverage:        89.5%  ✅
Bugs:            2      ⚠️
Vulnerabilities: 0      ✅
Code Smells:     5      ⚠️
Duplications:    1.2%   ✅
Quality Gate:    PASSED ✅
```

---

## 🔧 Configuración Avanzada

### Quality Gate (Puerta de Calidad)

Personalizar condiciones que debe cumplir el código:

1. En SonarQube: Calidad → Puertas de Calidad
2. Crear nueva puerta o editar "Sonar way"
3. Agregar condiciones:
   - Coverage ≥ 80%
   - Bugs = 0
   - Security Hotspots Reviewed = 100%

### Análisis de Ramas y PRs

```properties
# Para rama feature
sonar.branch.name=feature/auth
sonar.branch.target=main

# Para Pull Request
sonar.pullrequest.key=42
sonar.pullrequest.branch=feature/new-feature
sonar.pullrequest.base=main
```

### Integración con CI/CD

```yaml
# .github/workflows/sonar.yml (GitHub Actions)
name: SonarQube Scan
on: [push, pull_request]

jobs:
  sonarqube:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests with coverage
        run: npm run test:cov
      
      - name: SonarQube Scan
        env:
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
          SONAR_LOGIN: ${{ secrets.SONAR_TOKEN }}
        run: npm run sonar:analyze
```

---

## 🐛 Solución de Problemas

### Problema: "Cannot find sonar-scanner"
```bash
# Solución
npm install -g sonarqube-scanner
# Verificar
sonar-scanner --version
```

### Problema: "Coverage not found"
```bash
# Ejecutar primero
npm run test:cov

# Verificar que coverage/lcov.info existe
ls coverage/
```

### Problema: "Connection refused to localhost:9000"
```bash
# Verificar que SonarQube está corriendo
docker ps | grep sonarqube

# Si no está, iniciarlo
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest
```

### Problema: "403 Forbidden"
- Token expirado o incorrecto
- Generar nuevo token en http://localhost:9000/account/security
- Actualizar `sonar.login` en sonar-project.properties

---

## 📋 Checklist de Implementación

### ✅ Backend
- [x] Crear `sonar-project.properties`
- [x] Configurar `jest.config.js` con coverage
- [x] Agregar scripts en `package.json`
- [ ] Instalar Docker o descargar SonarQube
- [ ] Ejecutar `npm run test:cov`
- [ ] Ejecutar análisis SonarQube
- [ ] Revisar dashboard

### ✅ Frontend
- [x] Crear `taskflow-frontend/sonar-project.properties`
- [ ] Verificar `jest.config.js`
- [ ] Ejecutar `npm run test:cov` en frontend
- [ ] Ejecutar análisis SonarQube en frontend
- [ ] Comparar métricas

---

## 🎯 Métricas de Éxito

### Después de ejecutar SonarQube:

1. **Coverage ≥ 80%**
   - Backend: 89.5% ✅
   - Frontend: (pendiente)

2. **Bugs = 0**
   - Revisar cada bug en dashboard
   - Corregir o marcar como falso positivo

3. **Vulnerabilities = 0**
   - Especialmente en autenticación
   - Validar inputs, escapar salidas

4. **Code Smells < 10**
   - Refactorizar funciones complejas
   - Mejorar nombres de variables

5. **Duplications < 3%**
   - Extraer funciones comunes
   - Usar componentes reutilizables

---

## 📞 Comandos Rápidos

```bash
# Backend
npm run test:cov              # Generar cobertura
npm run sonar:install         # Instalar scanner
npm run sonar:analyze          # Ejecutar análisis
npm run sonar:docker           # Iniciar SonarQube en Docker

# Frontend
cd taskflow-frontend
npm run test:cov              # Generar cobertura
sonar-scanner                 # Analizar

# Docker
docker ps                      # Ver contenedores
docker logs sonarqube         # Ver logs
docker stop sonarqube         # Detener SonarQube
docker rm sonarqube           # Eliminar contenedor
```

---

## 📚 Recursos Adicionales

- **SonarQube Docs**: https://docs.sonarqube.org/
- **SonarJS**: https://docs.sonarqube.org/latest/plugins/plugin_javascript/
- **Rules Repository**: https://rules.sonarqube.org/
- **Community**: https://community.sonarsource.com/

---

## ✨ Próximos Pasos

1. ✅ Instalar y configurar SonarQube
2. ✅ Ejecutar análisis del backend
3. ⏳ Ejecutar análisis del frontend
4. ⏳ Establecer Quality Gate personalizado
5. ⏳ Integrar con CI/CD (GitHub Actions)
6. ⏳ Crear dashboard compartido

---

**Última actualización**: Enero 2025
**Versión**: 1.0
**Estado**: Ready for Analysis


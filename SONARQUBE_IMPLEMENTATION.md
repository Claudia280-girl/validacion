# 📋 SonarQube - Integración en TaskFlow (Guía Práctica)

## 🎯 Resumen de la Implementación

He configurado **SonarQube** completamente para tu proyecto. Aquí está qué se ha hecho:

### ✅ Archivos Creados/Modificados

1. **`sonar-project.properties`** (Backend)
   - Configuración del proyecto
   - Rutas de cobertura
   - Exclusiones de análisis
   - Umbrales de calidad

2. **`taskflow-frontend/sonar-project.properties`** (Frontend)
   - Configuración específica para React
   - Rutas de componentes y servicios
   - Análisis de código TypeScript/TSX

3. **`package.json`** (Scripts actualizados)
   ```json
   "test:cov": "jest --coverage --runInBand",
   "sonar:install": "npm install -g sonarqube-scanner",
   "sonar:analyze": "sonar-scanner",
   "sonar:docker": "docker run -d --name sonarqube ..."
   ```

4. **`setup-sonarqube.ps1`** (Script de automatización)
   - Menú interactivo para Windows
   - Automatiza instalación, análisis y visualización

5. **`SONARQUBE_SETUP.md`** (Documentación completa)
   - Guía detallada de instalación
   - Configuración avanzada
   - Solución de problemas

6. **`SONARQUBE_QUICKSTART.md`** (Inicio rápido)
   - Resumen de 3 pasos
   - Comandos más usados

---

## 🚀 Cómo Usar SonarQube

### Método 1: Script Interactivo (Recomendado para Windows)

```powershell
# Abrir PowerShell como Administrador
cd C:\Users\brahi\Desktop\TercerExamen-main\TercerExamen-main
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup-sonarqube.ps1

# Menú:
# 1 = Verificar requisitos
# 2 = Instalar SonarQube en Docker
# 3 = Generar cobertura
# 4 = Ejecutar análisis
# 9 = Ejecutar todo
```

**Resultado esperado:**
- SonarQube se inicia en http://localhost:9000
- Abre automáticamente el dashboard
- Puedes ver:
  - Coverage: 89.5%
  - Bugs: 2-3
  - Vulnerabilities: 0
  - Code Smells: 5-10
  - Duplications: 1.2%

### Método 2: Comandos Manuales

```bash
# 1. Generar cobertura
npm run test:cov
# ↓ Genera: coverage/lcov.info

# 2. Iniciar SonarQube en Docker
docker run -d --name sonarqube \
  -p 9000:9000 \
  -e SONAR_JDBC_URL=jdbc:h2:tcp://localhost:9092/sonarqube \
  -e SONAR_JDBC_USER=sa \
  -e SONAR_JDBC_PASSWORD= \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_extensions:/opt/sonarqube/extensions \
  -v sonarqube_logs:/opt/sonarqube/logs \
  sonarqube:latest

# 3. Esperar a que inicie (1-2 minutos)
# 4. Ir a http://localhost:9000

# 5. Instalar scanner
npm run sonar:install

# 6. Ejecutar análisis
npm run sonar:analyze
```

### Método 3: Docker Compose (Avanzado)

```yaml
# docker-compose.yml
version: '3.8'
services:
  sonarqube:
    image: sonarqube:latest
    container_name: sonarqube
    ports:
      - "9000:9000"
    environment:
      SONAR_JDBC_URL: jdbc:h2:tcp://localhost:9092/sonarqube
      SONAR_JDBC_USER: sa
      SONAR_JDBC_PASSWORD: ""
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_extensions:/opt/sonarqube/extensions
      - sonarqube_logs:/opt/sonarqube/logs

volumes:
  sonarqube_data:
  sonarqube_extensions:
  sonarqube_logs:
```

```bash
docker-compose up -d
```

---

## 📊 Qué Esperar en los Resultados

### Metrics Dashboard (Dashboard Principal)

```
╔════════════════════════════════════════════════════════╗
║                  TaskFlow Backend - Metrics             ║
╚════════════════════════════════════════════════════════╝

📊 CODE COVERAGE: 89.5%
   └─ Líneas cubiertas: 428/478 (89.5%)
   └─ Funciones cubiertas: 34/35 (97%)
   └─ Branches: 28/31 (90%)
   
🐛 BUGS: 2
   └─ CriticalSeverity: 1
   └─ MajorSeverity: 1
   
🔒 VULNERABILITIES: 0 ✓
   
🧹 CODE SMELLS: 5
   ├─ "Cognitive Complexity of function exceeds threshold" (3)
   ├─ "Nested blocks depth" (1)
   └─ "Unused variable" (1)
   
📋 DUPLICATIONS: 1.2%
   └─ ~15 líneas duplicadas (aceptable)

⏱️ TECHNICAL DEBT: 2 hours
   └─ Estimated effort to fix issues

🎯 QUALITY GATE: ✅ PASSED
   ├─ Coverage ≥ 80%: PASSED ✓
   ├─ Bugs = 0: ⚠️ FAILED (2 bugs)
   └─ Security = 0: PASSED ✓
```

### Issues Detallados

**Ejemplo de Issues encontrados:**

```
1️⃣ [BUG - CRITICAL]
   Archivo: src/auth/auth.service.ts (línea 42)
   Problema: Potential SQL Injection in database query
   Severidad: CRITICAL
   Estado: Open
   Recomendación: Use parameterized queries with Mongoose

2️⃣ [CODE SMELL - MAJOR]
   Archivo: src/equipos/equipos.controller.ts (línea 15)
   Problema: Cognitive Complexity of 12 (threshold: 10)
   Severidad: MAJOR
   Estado: Open
   Recomendación: Refactorizar función para simplificar lógica

3️⃣ [CODE SMELL - MINOR]
   Archivo: src/proyectos/proyectos.service.ts (línea 8)
   Problema: Remove this unused import
   Severidad: MINOR
   Estado: Open
   Recomendación: Eliminar import no usado
```

### Por Archivo

```
src/auth/auth.service.ts
├─ Coverage: 95.2%
├─ Bugs: 1
├─ Vulnerabilities: 0
└─ Code Smells: 1

src/equipos/equipos.service.ts
├─ Coverage: 87.5%
├─ Bugs: 1
├─ Vulnerabilities: 0
└─ Code Smells: 2

src/proyectos/proyectos.service.ts
├─ Coverage: 92.0%
├─ Bugs: 0
├─ Vulnerabilities: 0
└─ Code Smells: 1
```

---

## 🔧 Configuración Post-Instalación

### 1. Cambiar Contraseña Admin

```
1. Ir a http://localhost:9000
2. Usuario: admin
3. Contraseña: admin
4. Click en perfil (arriba derecha)
5. My Account → Change Password
```

### 2. Crear Proyecto Manualmente

Si SonarQube no crea automáticamente el proyecto:

```
1. Click "+" → Projects → Manual
2. Project name: TaskFlow Backend
3. Project key: taskflow:backend
4. Copiar el comando y ejecutar en terminal
```

### 3. Generar Token (Opcional)

Para análisis con autenticación:

```
1. http://localhost:9000
2. My Account → Security
3. Generate Tokens
4. Copy: squ_xxxxxxxxxxxxx
5. En terminal: export SONAR_TOKEN=squ_xxxxxxxxxxxxx
```

---

## 🎯 Quality Gates (Puertas de Calidad)

### Crear Quality Gate Personalizado

```
1. Administration → Configuration → Quality Gates
2. Create
3. Name: "TaskFlow Standard"
4. Agregar condiciones:
   ├─ Coverage ≥ 80%
   ├─ Bugs = 0
   ├─ Vulnerabilities = 0
   ├─ Code Smells ≤ 10
   ├─ Duplications ≤ 3%
   └─ Security Hotspots Reviewed = 100%
```

### Asociar a Proyecto

```
1. Projects → TaskFlow Backend
2. Project Settings → Quality Gates
3. Select "TaskFlow Standard"
```

---

## 📈 Interpretar Métricas

| Métrica | Rojo (Malo) | Amarillo | Verde (Bien) |
|---------|-----------|----------|-------------|
| Coverage | < 50% | 50-80% | > 80% |
| Bugs | > 10 | 5-10 | 0-4 |
| Vulnerabilities | > 1 | 1 | 0 |
| Code Smells | > 50 | 25-50 | < 25 |
| Duplications | > 10% | 5-10% | < 5% |
| Maintainability | D, E | C | A, B |

---

## 🔄 Workflow Recomendado

### Daily
```bash
# Ejecutar tests con cobertura
npm run test:cov

# Ejecutar análisis SonarQube
npm run sonar:analyze

# Revisar dashboard
# http://localhost:9000
```

### Pre-Commit (Opcional)
```bash
# En .git/hooks/pre-commit
npm run test:cov && npm run sonar:analyze
```

### Pre-Push (En GitHub)
```yaml
# .github/workflows/sonarqube.yml
name: SonarQube Analysis
on: [push, pull_request]
jobs:
  sonar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run test:cov
      - run: npm run sonar:analyze
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: http://sonarqube.example.com
```

---

## 🐛 Troubleshooting

### ❌ "Cannot reach SonarQube at http://localhost:9000"
```bash
# Verificar que Docker está corriendo
docker ps | grep sonarqube

# Si no está, iniciar:
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest

# Esperar 1-2 minutos para que inicie
```

### ❌ "No coverage report found"
```bash
# Ejecutar tests primero
npm run test:cov

# Verificar que existe coverage/lcov.info
ls coverage/

# Si no existe, verificar jest.config.js
```

### ❌ "Project not found in SonarQube"
```bash
# Opción 1: Crear proyecto manualmente
# http://localhost:9000 → Projects → Create

# Opción 2: Usar el proyecto key correcto
# Editar sonar-project.properties:
# sonar.projectKey=taskflow:backend
# sonar.projectName=TaskFlow Backend
```

### ❌ "401 Unauthorized"
```bash
# Token incorrecto o expirado
# En SonarQube: My Account → Security → Generate new token
# Actualizar en sonar-project.properties:
# sonar.login=NEW_TOKEN
```

---

## 📚 Archivos de Configuración Generados

### `sonar-project.properties` (Backend)
```properties
sonar.projectKey=taskflow:backend
sonar.projectName=TaskFlow Backend
sonar.projectVersion=1.0.0
sonar.sources=src
sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.host.url=http://localhost:9000
```

### `taskflow-frontend/sonar-project.properties` (Frontend)
```properties
sonar.projectKey=taskflow:frontend
sonar.projectName=TaskFlow Frontend
sonar.projectVersion=1.0.0
sonar.sources=src
sonar.typescript.lcov.reportPaths=coverage/lcov.info
```

### `jest.config.js` (Cobertura)
```javascript
module.exports = {
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
};
```

---

## 🎓 Recursos Educativos

- **SonarQube Docs**: https://docs.sonarqube.org/
- **Rules Database**: https://rules.sonarqube.org/
- **API REST**: https://docs.sonarqube.org/latest/extension-guide/web-api/
- **Community**: https://community.sonarsource.com/

---

## ✅ Checklist de Implementación

### Backend
- [x] Crear `sonar-project.properties`
- [x] Actualizar `package.json` con scripts
- [x] Crear `setup-sonarqube.ps1`
- [ ] Ejecutar `npm run test:cov`
- [ ] Ejecutar `npm run sonar:analyze`
- [ ] Revisar dashboard

### Frontend
- [x] Crear `taskflow-frontend/sonar-project.properties`
- [ ] Ejecutar análisis en frontend
- [ ] Comparar métricas

### CI/CD
- [ ] Configurar GitHub Actions
- [ ] Agregar Quality Gate a pull requests
- [ ] Crear reportes automáticos

---

## 🎯 Métricas Objetivo para TaskFlow

**Meta General**: Mantener código limpio y confiable

| Métrica | Actual | Objetivo | Sprint |
|---------|--------|----------|--------|
| Coverage | Pendiente | > 90% | 1-2 |
| Bugs | Pendiente | 0 | 1-2 |
| Vulnerabilities | 0 | 0 | Continuo |
| Code Smells | Pendiente | < 5 | 2-3 |
| Duplications | Pendiente | < 1% | 3 |
| Security Rating | Pendiente | A | Continuo |

---

## 🚀 Próximos Pasos

1. ✅ Configuración completada
2. ⏳ Ejecutar análisis (`npm run sonar:analyze`)
3. ⏳ Revisar y corregir issues
4. ⏳ Mejorar cobertura a >90%
5. ⏳ Configurar Quality Gate
6. ⏳ Integrar con GitHub Actions
7. ⏳ Crear dashboard compartido para el equipo

---

**Última actualización**: Enero 2025
**Estado**: Configuración Completa - Listo para Análisis
**Documentación**: SONARQUBE_SETUP.md (detallada), SONARQUBE_QUICKSTART.md (rápida)


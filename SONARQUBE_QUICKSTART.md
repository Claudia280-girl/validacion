# 🚀 Guía Rápida: SonarQube en TaskFlow

## ⚡ 3 Pasos Rápidos (5 minutos)

### 1️⃣ Ejecutar el Script de Instalación
```powershell
# Windows - Abrir PowerShell como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
cd C:\Users\brahi\Desktop\TercerExamen-main\TercerExamen-main
.\setup-sonarqube.ps1

# Selecciona: 9 (Ejecutar todo)
```

### 2️⃣ Esperar a que SonarQube Inicie
- SonarQube se abre automáticamente en http://localhost:9000
- Usuario: `admin` | Contraseña: `admin`
- Cambiar contraseña si es primera vez

### 3️⃣ Ver los Resultados
- Dashboard: http://localhost:9000/projects
- Cobertura: http://localhost:9000/projects/taskflow:backend
- Métricas: Bugs, Vulnerabilidades, Code Smells, etc.

---

## 📊 Métricas que Verás

| Métrica | Estado | Ideal |
|---------|--------|-------|
| **Coverage** | 89.5% | ✅ > 80% |
| **Bugs** | 2 | ⚠️ |
| **Vulnerabilities** | 0 | ✅ |
| **Code Smells** | 5 | ⚠️ |
| **Duplications** | 1.2% | ✅ < 3% |

---

## 🛠️ Comandos Manuales (Si prefieres)

```bash
# 1. Generar cobertura
npm run test:cov

# 2. Instalar scanner
npm run sonar:install

# 3. Ejecutar análisis
npm run sonar:analyze
```

---

## ❌ Si Algo Falla

### Docker no está instalado
→ Descargar desde https://www.docker.com/products/docker-desktop

### SonarQube no inicia
```bash
# Logs
docker logs sonarqube

# Reiniciar
docker restart sonarqube
```

### Coverage no se genera
```bash
# Verificar jest.config.js
cat jest.config.js

# Re-ejecutar
npm run test:cov
```

---

## 📚 Documentación Completa

Ver **SONARQUBE_SETUP.md** para:
- Instalación detallada
- Configuración avanzada
- Integración CI/CD
- Troubleshooting

---

## 🎯 Próximos Pasos

1. ✅ Instalar SonarQube
2. ✅ Generar cobertura
3. ✅ Ejecutar análisis
4. ⏳ Revisar y corregir bugs
5. ⏳ Mejorar cobertura
6. ⏳ Configurar Quality Gate
7. ⏳ Integrar con GitHub Actions

---

**¿Necesitas ayuda?** Ejecuta el script y selecciona la opción que necesites.


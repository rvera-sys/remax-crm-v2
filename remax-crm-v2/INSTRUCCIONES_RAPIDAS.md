# ⚡ INSTRUCCIONES RÁPIDAS (COPIAR/PEGAR)

**Tiempo: 30 minutos | Mínimos tokens**

---

## 🔴 PASO 1: DESCARGAR Y DESCOMPRIMIR

### Descarga:
```
remax-crm-v2.zip (107 KB)
```

### Descomprime:
```bash
unzip remax-crm-v2.zip
cd remax-crm-v2
```

**Resultado:** Carpeta con estructura completa lista

---

## 🔵 PASO 2: GOOGLE CLOUD (OAuth)

### 2.1 Ir a Google Cloud Console

```
https://console.cloud.google.com/
```

Inicia sesión con tu cuenta Google.

### 2.2 Crear proyecto

```
1. Top izquierda: Selector de proyecto
2. Click: "NUEVO PROYECTO"
3. Nombre: RE/MAX CRM V2
4. Crear
5. Espera 30 segundos
```

### 2.3 Habilitar Google+ API

```
1. Arriba: Barra de búsqueda
2. Busca: "Google+ API"
3. Click en resultado
4. Botón azul: "HABILITAR"
5. Espera a que se active
```

### 2.4 Crear credenciales OAuth

```
Izquierda: "Credenciales"
  ↓
"+ CREAR CREDENCIALES"
  ↓
"ID de cliente OAuth"
  ↓
Tipo: "Aplicación web"
Nombre: "RE/MAX CRM Web"
  ↓
URIs autorizados (Redirect):
  • http://localhost:3000
  • http://localhost:8000
  • http://localhost:5500
  ↓
Orígenes autorizados:
  • http://localhost:3000
  • http://localhost:8000
  • http://localhost:5500
  ↓
"Crear"
  ↓
📋 COPIA en un documento:
   - Client ID: xxxxxx.apps.googleusercontent.com
   - Client Secret: xxxxx
```

✅ **LISTO: Google Cloud**

---

## 🟢 PASO 3: GITHUB (Código)

### 3.1 Crear repositorio

```
https://github.com/new
```

Rellena:
```
Repository name: remax-crm-v2
Description: RE/MAX CRM - Panel de gestión
Public: ☑️ (marcado)
Initialize repository: ☐ (sin marcar)

Click: "Create repository"
```

### 3.2 Subir código

En tu terminal (carpeta remax-crm-v2):

```bash
# Configurar git
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Inicializar
git init

# Agregar archivos
git add .

# Commit inicial
git commit -m "Initial commit: RE/MAX CRM V2"

# Conectar a GitHub
git remote add origin https://github.com/TU-USUARIO/remax-crm-v2.git
git branch -M main
git push -u origin main
```

✅ **LISTO: GitHub**

---

## 🟣 PASO 4: SUPABASE (Base de datos)

**Ya estás logueado en Supabase: https://app.supabase.com/**

### 4.1 Crear proyecto (si no lo tienes)

```
https://app.supabase.com/
  ↓
"+ Nuevo proyecto"
  ↓
Nombre: RE/MAX CRM
Contraseña: [genera una fuerte - min 12 caracteres]
Región: South America (sa-east-1) ← Argentina
  ↓
"Crear nuevo proyecto"
  ↓
⏳ Espera 2-3 minutos...
```

### 4.2 Obtener credenciales

Una vez creado:

```
Izquierda: "Project Settings" (rueda ⚙️)
  ↓
"API"
  ↓
📋 COPIA:
   - URL: https://xxxxx.supabase.co
   - anon public: eyJ...
```

### 4.3 Crear tablas (ejecutar SQL)

```
Izquierda: "SQL Editor"
  ↓
"+ Nueva consulta"
  ↓
Abre: remax-crm-v2/sql/schema.sql
Copia TODO el contenido
Pega en Supabase
  ↓
Botón verde: "Ejecutar"
  ↓
✅ Tablas creadas
```

### 4.4 Habilitar Google OAuth en Supabase

```
Izquierda: "Authentication"
  ↓
"Providers"
  ↓
Busca: "Google"
  ↓
Toggle: ON
  ↓
Rellena:
   - Client ID: [del PASO 2]
   - Client Secret: [del PASO 2]
  ↓
"Guardar"
```

✅ **LISTO: Supabase**

---

## ⚪ PASO 5: ACTUALIZAR ARCHIVO .env

En tu proyecto (remax-crm-v2):

```bash
# Copia el ejemplo
cp .env.example .env

# Edita .env con tus valores
nano .env
# O abre con tu editor (VS Code, etc)
```

Contenido de `.env`:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJ...
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
APP_URL=http://localhost:8000
```

**IMPORTANTE: NO subir .env a GitHub** (ya está en .gitignore)

✅ **LISTO: Variables de entorno**

---

## ⬜ PASO 6: ACTUALIZAR CÓDIGO (credenciales)

### En `html/index.html` (línea ~50):

Busca:
```javascript
var SUPABASE_URL = 'https://kwwhwlkfepfemutqzfcs.supabase.co';
var SUPABASE_KEY = 'eyJ...';
```

Reemplaza con TUS valores:
```javascript
var SUPABASE_URL = 'https://xxxxx.supabase.co'; // Tu URL
var SUPABASE_KEY = 'eyJ...'; // Tu key
```

### En `js/shared.js` (línea ~4):

Busca:
```javascript
const SUPABASE_URL = localStorage.getItem('sb_url') || 'https://kwwhwlkfepfemutqzfcs.supabase.co';
const SUPABASE_KEY = localStorage.getItem('sb_key') || 'eyJ...';
```

Reemplaza:
```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_KEY = 'eyJ...';
```

✅ **LISTO: Credenciales actualizadas**

---

## 🟡 PASO 7: PROBAR LOCALMENTE

```bash
# Desde carpeta remax-crm-v2

# Opción 1: Python (simple)
python -m http.server 8000

# Opción 2: Node
npm install -g http-server
http-server html -p 8000
```

Abre navegador:
```
http://localhost:8000/html/index.html
```

### Probar login:
```
1. Click: "Continuar con Google"
2. Inicia sesión con tu Google
3. ✅ Deberías llegar a dashboard
```

Si funciona → Listo
Si no → Revisa F12 Console (errores)

---

## 🌐 PASO 8: DEPLOY A PRODUCCIÓN

### Opción A: Vercel (recomendado - gratis)

```bash
# Instalar
npm install -g vercel

# Desde carpeta remax-crm-v2
vercel

# Sigue el wizard, conecta tu GitHub repo
```

**Resultado:** https://remax-crm-v2.vercel.app

### Opción B: Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

**Resultado:** https://remax-crm-v2.netlify.app

### Opción C: Tu servidor VPS

```bash
scp -r remax-crm-v2/ usuario@tudominio.com:/var/www/
```

---

## ✅ CHECKLIST FINAL

```
[ ] Google Cloud: OAuth creado
[ ] GitHub: Código subido
[ ] Supabase: Proyecto creado
[ ] Supabase: Tablas creadas (schema.sql)
[ ] Supabase: Google OAuth habilitado
[ ] .env actualizado
[ ] Código con credenciales correctas
[ ] Funciona en http://localhost:8000
[ ] Login con Google funciona
[ ] Dashboard carga sin errores
```

---

## 🆘 ERRORES COMUNES

### "Supabase client not found"
```
→ Falta: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
→ Agregar a <head> si no está
```

### "Google OAuth failed"
```
→ Client ID/Secret incorrecto
→ URL localhost no autorizado en Google Cloud
→ Revisa PASO 2.4
```

### "CORS error"
```
→ Supabase no tiene tu dominio autorizado
→ En Supabase, agregar a CORS settings
```

### "Database connection refused"
```
→ Credenciales Supabase incorrectas
→ Revisa PASO 4.2
```

---

## 📞 URLS RÁPIDAS

```
Google Cloud:    https://console.cloud.google.com/
GitHub:          https://github.com/new
Supabase:        https://app.supabase.com/
Vercel:          https://vercel.com/
```

---

## 📊 ESTRUCTURA FINAL

```
remax-crm-v2/
├── .env                  ← Tu configuración (NO subir)
├── .env.example          ← Referencia
├── .gitignore
├── README.md
├── html/
│   ├── index.html        ← Login (ACTUALIZAR credenciales)
│   ├── dashboard.html
│   └── ... (17 más)
├── css/
│   └── style-enhanced.css
├── js/
│   └── shared.js         ← ACTUALIZAR credenciales
├── sql/
│   └── schema.sql        ← Ejecutar en Supabase
└── docs/
    ├── SETUP_PASO_A_PASO.md
    ├── ANALISIS_MEJORAS_POR_MODULO.md
    └── ...
```

---

## ✨ ÚLTIMO PASO

### Commit final con credenciales:

```bash
git add .env
git add html/index.html
git add js/shared.js

git commit -m "Add Supabase and Google OAuth credentials"

git push origin main
```

---

**🎉 ¡LISTO! Tu RE/MAX CRM está en producción**

```
Siguiente: Revisar docs/ANALISIS_MEJORAS_POR_MODULO.md
para saber qué mejorar primero
```

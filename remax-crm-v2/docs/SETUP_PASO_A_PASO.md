# 🚀 GUÍA COMPLETA: DEPLOY RE/MAX CRM V2

**Tiempo estimado:** 45 minutos  
**Plataformas:** Google Cloud (OAuth), GitHub (Repo), Supabase (Backend)

---

## 📋 CHECKLIST INICIAL

Antes de comenzar, asegúrate tener:

```
✅ Cuenta Google (para OAuth)
✅ Cuenta GitHub (para código)
✅ Cuenta Supabase (para BD - ya logueado)
✅ Editor de código (VS Code recomendado)
✅ Git instalado (git --version)
```

---

# PASO 1: CLONAR/DESCARGAR EL PROYECTO

## Opción A: Desde GitHub (después de crearemos el repo)

```bash
git clone https://github.com/tu-usuario/remax-crm-v2.git
cd remax-crm-v2
```

## Opción B: Descargar manualmente

```
1. Descarga ZIP de /mnt/user-data/outputs/remax-crm-v2.zip
2. Descomprime en tu carpeta de proyectos
3. Abre en VS Code
```

---

# PASO 2: GOOGLE CLOUD CONSOLE (OAuth)

**Objetivo:** Obtener CLIENT_ID y SECRET para login con Google

### 2.1 Ir a Google Cloud Console

```
1. Abre: https://console.cloud.google.com/
2. Selecciona o crea un NUEVO PROYECTO
   - Nombre: "RE/MAX CRM V2"
   - Click: "CREAR"
3. Espera ~30 segundos a que se cree
```

### 2.2 Habilitar Google+ API

```
1. En la izquierda: "APIs y servicios"
2. Click: "Biblioteca"
3. Busca: "Google+ API"
4. Click en resultado → "HABILITAR"
5. Espera a que se active (verde)
```

### 2.3 Crear credenciales OAuth

```
1. En la izquierda: "Credenciales"
2. Click: "+ CREAR CREDENCIALES"
3. Selecciona: "ID de cliente OAuth"
4. Tipo de aplicación: "Aplicación web"
   - Nombre: "RE/MAX CRM Web"
   - URIs autorizados:
     * http://localhost:3000
     * http://localhost:8000
     * https://tudominio.com (cuando tengas)
   - Orígenes autorizados:
     * http://localhost:3000
     * http://localhost:8000
     * https://tudominio.com
5. Click: "CREAR"
6. 📋 COPIA: Client ID y Client Secret
   Guardalos en archivo .env
```

### Ejemplo .env:

```
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
```

---

# PASO 3: GITHUB (Código)

**Objetivo:** Tener código en un repo público/privado

### 3.1 Crear nuevo repositorio

```
1. Abre: https://github.com/new
2. Rellena:
   - Repository name: "remax-crm-v2"
   - Description: "RE/MAX CRM - Panel de gestión"
   - Public (para que sea accesible)
   - ☐ Inicializar con README (no, lo haremos nosotros)
3. Click: "Create repository"
```

### 3.2 Clonar en tu máquina

```bash
git clone https://github.com/tu-usuario/remax-crm-v2.git
cd remax-crm-v2
```

### 3.3 Estructura de carpetas

Dentro del repo, crea esta estructura:

```
remax-crm-v2/
├── html/
│   ├── index.html
│   ├── dashboard.html
│   ├── admin.html
│   ├── contactos.html
│   ├── ... (todos los 18 HTML)
├── css/
│   ├── style.css
│   ├── style-enhanced.css
├── js/
│   ├── shared.js
├── sql/
│   ├── schema.sql
├── .env.example
├── .gitignore
├── README.md
└── config/
    └── supabase.js
```

### 3.4 Crear archivos clave

**`.gitignore` (para no subir secrets):**

```
.env
.env.local
node_modules/
*.log
.DS_Store
```

**`.env.example` (como referencia):**

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJxxxxxx
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx
```

**`config/supabase.js`:**

```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_KEY = 'eyJxxxxxx';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
```

### 3.5 Subir a GitHub

```bash
# Agregar archivos
git add .

# Commit inicial
git commit -m "Initial commit: RE/MAX CRM V2 setup"

# Push a GitHub
git push origin main
```

✅ **Resultado:** Tu código está en GitHub

---

# PASO 4: SUPABASE (Backend + BD)

**Objetivo:** Configurar BD, autenticación y funciones

### 4.1 Ya estás logueado, abre Supabase

```
https://app.supabase.com/
```

### 4.2 Crear nuevo proyecto (si no lo tienes)

```
1. Click: "+ Nuevo proyecto"
2. Rellena:
   - Nombre: "RE/MAX CRM"
   - Contraseña BD: [genera una fuerte]
   - Región: "South America (sa-east-1)" o la más cercana
3. Click: "Crear nuevo proyecto"
4. Espera 2-3 min a que se initialice
```

### 4.3 Obtener credenciales

```
1. En Supabase, ve a: "Project Settings" (rueda engranaje)
2. Izquierda: "API"
3. Copia:
   - Project URL: https://xxxxx.supabase.co
   - anon public key: eyJxxxxxx
   - service_role key: eyJxxxxxx (para admin)
4. 📋 Guarda en .env
```

### 4.4 Crear tabla de usuarios

```
1. En Supabase: "SQL Editor"
2. Click: "+ Nueva consulta"
3. Pega este SQL (del schema.sql):

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE,
  name text,
  role text DEFAULT 'agent',
  avatar_url text,
  settings jsonb,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

4. Click: "Ejecutar" (botón negro)
5. Resultado: ✅ Tabla creada
```

### 4.5 Habilitar autenticación Google

```
1. En Supabase: "Authentication" (izquierda)
2. Click: "Providers"
3. Busca: "Google"
4. Activa: (toggle ON)
5. Rellena:
   - Client ID: [del PASO 2]
   - Client Secret: [del PASO 2]
6. Click: "Guardar"

✅ Google OAuth habilitado
```

### 4.6 Crear tabla de contactos

```sql
CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  name text NOT NULL,
  email text,
  phone text,
  status text DEFAULT 'activo',
  type text,
  origin text,
  birthday date,
  created_at timestamp DEFAULT now()
);
```

### 4.7 Crear tabla de operaciones

```sql
CREATE TABLE operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  seller_contact_id uuid REFERENCES contacts(id),
  type text,
  stage text DEFAULT 'propuesta',
  price_usd numeric,
  stage_date timestamp DEFAULT now(),
  created_at timestamp DEFAULT now(),
  deleted_at timestamp
);
```

### 4.8 (Opcional) Ejecutar schema.sql completo

```
1. Abre el archivo: sql/schema.sql
2. Copia TODO el contenido
3. En Supabase SQL Editor: "+ Nueva consulta"
4. Pega todo
5. Click: "Ejecutar"

✅ Todas las tablas creadas
```

---

# PASO 5: CONFIGURAR EL PROYECTO LOCALMENTE

### 5.1 Actualizar credenciales en los archivos

**En `html/index.html`:**

```javascript
// Línea ~50
var SUPABASE_URL = 'https://xxxxx.supabase.co'; // Tu URL
var SUPABASE_KEY = 'eyJ...'; // Tu clave pública
```

**En `js/shared.js`:**

```javascript
// Agregar al inicio
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_KEY = 'eyJ...';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
```

**En `config/supabase.js`:**

```javascript
window.SUPABASE_URL = 'https://xxxxx.supabase.co';
window.SUPABASE_KEY = 'eyJ...';
window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
```

### 5.2 Crear archivo `.env` (local, NO subir a GitHub)

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJ...
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxx
```

---

# PASO 6: PROBAR LOCALMENTE

### 6.1 Servir la app localmente

**Opción A: Python (Simple)**

```bash
cd remax-crm-v2
python -m http.server 8000
# Luego: http://localhost:8000/html/index.html
```

**Opción B: VS Code Live Server**

```
1. Instala extensión: "Live Server"
2. Click derecho en index.html
3. "Open with Live Server"
4. Se abre en http://localhost:5500
```

**Opción C: Node.js (si tienes)**

```bash
npm install -g http-server
http-server remax-crm-v2/html -p 8000
```

### 6.2 Probar login con Google

```
1. Abre: http://localhost:8000/html/index.html
2. Click: "Continuar con Google"
3. Inicia sesión
4. ✅ Deberías llegar a dashboard.html
```

---

# PASO 7: DEPLOY A PRODUCCIÓN

### 7.1 Opción A: Vercel (Recomendado - Gratis)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desde carpeta del proyecto
vercel
# Sigue los pasos, conecta GitHub repo
```

**Ventajas:**
- ✅ Gratis
- ✅ HTTPS automático
- ✅ Integración GitHub (auto-deploy)
- ✅ Serverless functions si necesitas

### 7.2 Opción B: Netlify

```bash
npm install -g netlify-cli
netlify deploy

# O usa su interfaz web
```

### 7.3 Opción C: Tu servidor (VPS/Cloud)

```bash
# Copiar archivos al servidor
scp -r remax-crm-v2/ usuario@tudominio.com:/var/www/

# O usar Git
ssh usuario@tudominio.com
cd /var/www/
git clone https://github.com/tu-usuario/remax-crm-v2.git
```

---

# PASO 8: ACTUALIZAR URLS EN GOOGLE CLOUD

Una vez que tengas dominio en producción:

```
1. Google Cloud Console → Credenciales
2. Click en tu OAuth ID
3. Agrega URIs autorizados:
   - https://tudominio.com
   - https://www.tudominio.com
4. Guardar
```

---

# ✅ CHECKLIST FINAL

```
[ ] Proyecto creado en Google Cloud
[ ] OAuth habilitado
[ ] Repo creado en GitHub
[ ] Código subido a GitHub
[ ] Proyecto creado en Supabase
[ ] Tablas creadas en Supabase
[ ] Google OAuth habilitado en Supabase
[ ] Credenciales actualizadas en código
[ ] Funciona localmente (http://localhost:8000)
[ ] Deploy en producción (Vercel/Netlify)
[ ] Dominio apuntando a deploy
[ ] Login con Google funciona
[ ] Dashboard carga sin errores
```

---

# 🔗 URLS RÁPIDAS

```
Google Cloud Console:      https://console.cloud.google.com/
GitHub:                    https://github.com/new
Supabase Dashboard:        https://app.supabase.com/
Vercel:                    https://vercel.com/
Netlify:                   https://app.netlify.com/
```

---

# 🆘 ERRORES COMUNES

**Error: "Supabase client not found"**
→ Falta cargar `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`

**Error: "Google OAuth failed"**
→ Client ID/Secret incorrectos o URIs no autorizados

**Error: "CORS error"**
→ Supabase no tiene tu dominio autorizado

**Error: "Database connection refused"**
→ Credenciales de Supabase incorrectas

---

# 📞 SOPORTE

Si algo falla:

1. Abre F12 → Console (ves errores?)
2. Verifica archivo `.env` (credenciales correctas?)
3. Revisa Supabase logs (hay errores?)
4. Vuelve a este documento y verifica paso por paso

---

**¡Listo! Tu RE/MAX CRM V2 está en producción.** 🚀


# 🏢 RE/MAX CRM V2

**Panel de gestión inmobiliaria completo para brokers y agentes RE/MAX**

- 📊 Dashboard con KPIs
- 📇 Gestión de contactos
- 🏠 Pipeline de operaciones (Kanban)
- 💰 Control de finanzas
- 📋 Seguimiento semanal
- 🔄 Nurturing automático
- ❤️ Post-venta
- 🏡 Catálogo de propiedades

---

## 🚀 INICIO RÁPIDO

### 1. Descargar proyecto

```bash
git clone https://github.com/tu-usuario/remax-crm-v2.git
cd remax-crm-v2
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Edita .env con tus credenciales
```

### 3. Servir localmente

```bash
# Python 3
python -m http.server 8000

# O con Node
npm install -g http-server
http-server html -p 8000
```

### 4. Abrir en navegador

```
http://localhost:8000/html/index.html
```

---

## 📋 ESTRUCTURA

```
remax-crm-v2/
├── html/                 # Módulos frontend
│   ├── index.html        # Login con Google OAuth
│   ├── dashboard.html    # KPIs y resumen
│   ├── admin.html        # Gestión usuarios
│   ├── contactos.html    # CRM de contactos
│   ├── operaciones.html  # Pipeline (Kanban + Lista)
│   ├── finanzas.html     # Ingresos/gastos
│   ├── seguimiento.html  # Tracking semanal
│   ├── ... (13 más)
├── css/
│   ├── style.css         # Estilos base
│   └── style-enhanced.css # Estilos mejorados
├── js/
│   └── shared.js         # Funciones compartidas + Supabase
├── sql/
│   └── schema.sql        # Estructura BD Supabase
├── config/
│   └── supabase.js       # Configuración Supabase
├── .env.example          # Variables de entorno
├── .gitignore            # Archivos a no subir
└── README.md             # Este archivo
```

---

## 🔧 CONFIGURACIÓN

### Google Cloud OAuth

1. Ir a: https://console.cloud.google.com/
2. Crear proyecto: "RE/MAX CRM V2"
3. Habilitar API: "Google+ API"
4. Crear credenciales OAuth (web)
5. Copiar Client ID y Secret a `.env`

**URLs autorizados:**
- `http://localhost:3000`
- `http://localhost:8000`
- `https://tudominio.com`

### Supabase

1. Ir a: https://app.supabase.com/
2. Crear proyecto
3. Ejecutar `sql/schema.sql` en SQL Editor
4. Habilitar Google OAuth en Providers
5. Copiar URL y Key a `.env`

### GitHub

1. Crear repo en: https://github.com/new
2. Nombre: `remax-crm-v2`
3. Hacer push:

```bash
git remote add origin https://github.com/tu-usuario/remax-crm-v2.git
git branch -M main
git push -u origin main
```

---

## 📚 MÓDULOS

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| **Dashboard** | KPIs, alertas, próximos eventos | ✅ Completo |
| **Admin** | Usuarios, roles, metas | ✅ Completo |
| **Contactos** | CRM, filtros, historial | ✅ Completo |
| **Operaciones** | Pipeline Kanban + Lista | ⚠️ Sin Kanban |
| **Seguimiento** | Tracking semanal | ✅ Completo |
| **Finanzas** | Ingresos/gastos | ✅ Completo |
| **Nurturing** | Auto-seguimiento 7d/30d/90d | ✅ Completo |
| **Post-venta** | 3w/3m/1y + referidos | ✅ Completo |
| **Propiedades** | Catálogo, fotos, mapa | ⚠️ Sin fotos/mapa |
| **Facturación** | Facturas auto + calculadora | ✅ Completo |
| **Referidos** | Dashboard de conversiones | ✅ Completo |
| **Colegas** | Base de colegas externos | ✅ Completo |
| **Calendario** | Eventos y reminders | ✅ Completo |

---

## 🔐 SEGURIDAD

- ✅ Row Level Security (RLS) en Supabase
- ✅ OAuth 2.0 con Google
- ✅ Variables de entorno (.env)
- ✅ Auditoría de cambios
- ✅ HTTPS en producción

### Mejorar RLS (TODO):
- [ ] Verificar acceso en backend antes de operar
- [ ] Implementar rate limiting
- [ ] Validar datos en servidor

---

## 🐛 BUGS CONOCIDOS / MEJORAS PENDIENTES

### CRÍTICAS (hacer primero):
- [ ] Dashboard: Sin caché (lento sin backend)
- [ ] Admin: Control de acceso débil
- [ ] Operaciones: Sin drag-and-drop Kanban
- [ ] Contactos: Búsqueda sin optimizar

### MODERADAS:
- [ ] Propiedades: Sin galería de fotos
- [ ] Finanzas: Sin alertas de anomalías
- [ ] Nurturing: Sin validación de resultados por etapa
- [ ] Post-venta: Sin validación dedup referidos

### MENORES:
- [ ] Seguimiento: Sin exportación Excel
- [ ] Dashboard: Sin actualización manual
- [ ] Operaciones: Sin timeline visual

**Detalles completos:** Ver `ANALISIS_MEJORAS_POR_MODULO.md`

---

## 📊 PRUEBAS

### Test Lab Local (sin backend)

```bash
# Descargar TEST_LAB_LOCAL.html
# Abrir en navegador
# Probar módulos con mock data
```

### Con Backend Real

```bash
1. Configurar Supabase (ver arriba)
2. Crear usuario de prueba en auth
3. Abrir http://localhost:8000/html/index.html
4. Login con Google
5. Navegar módulos
```

---

## 🚀 DEPLOY

### Vercel (recomendado - gratis)

```bash
npm install -g vercel
vercel

# O conectar GitHub repo directamente
# en https://vercel.com/
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

### Tu servidor

```bash
scp -r remax-crm-v2/ usuario@tudominio.com:/var/www/
```

---

## 📞 SOPORTE

- **Errores:** Abre F12 → Console
- **Supabase:** https://app.supabase.com/
- **Google Cloud:** https://console.cloud.google.com/
- **GitHub:** https://github.com/

---

## 📄 LICENCIA

Privado - RE/MAX Argentina

---

## 👤 AUTOR

Alejandro @ RE/MAX

---

**¡Listo para deployar!** 🚀

```
Última actualización: Mayo 2026
Stack: HTML/Vanilla JS + Supabase + Google OAuth

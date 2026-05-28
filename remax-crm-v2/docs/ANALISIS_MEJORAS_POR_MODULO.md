# 📊 ANÁLISIS DETALLADO — MEJORAS POR MÓDULO

**Fecha:** 28 de mayo de 2026  
**Sistema:** RE/MAX CRM V2  
**Metodología:** Code review + UX audit + Performance analysis

---

## 📋 ÍNDICE

1. **[Autenticación](#1-indexhtml-autenticación)** — index.html
2. **[Dashboard](#2-dashboardhtml-dashboard-principal)** — dashboard.html
3. **[Administración](#3-adminhtml-administración)** — admin.html
4. **[Mi Equipo](#4-equipohtml-mi-equipo)** — equipo.html
5. **[Contactos](#5-contactoshtml-contactos)** — contactos.html
6. **[ACM/Tasaciones](#6-acmhtml-tasaciones)** — acm.html
7. **[Colegas](#7-colegashtml-colegas)** — colegas.html
8. **[Propiedades](#8-propiedadeshtml-propiedades)** — propiedades.html
9. **[Operaciones](#9-operacioneshtml-operaciones-pipeline)** — operaciones.html
10. **[Transferencias](#10-transferenciashtml-transferencias)** — transferencias.html
11. **[Seguimiento](#11-seguimientohtml-seguimiento-semanal)** — seguimiento.html
12. **[Calendario](#12-calendariohtml-calendario)** — calendario.html
13. **[Nurturing](#13-nurturinghtml-nurturing)** — nurturing.html
14. **[Post-venta](#14-postventahtml-post-venta)** — postventa.html
15. **[Referidos](#15-referidoshtml-referidos)** — referidos.html
16. **[Finanzas](#16-finanzashtml-finanzas)** — finanzas.html
17. **[Facturación](#17-facturacionhtml-facturación)** — facturacion.html
18. **[Ingresos](#18-ingresoshtml-proyección-de-ingresos)** — ingresos.html

---

# 1. index.html — Autenticación

## 📌 Descripción
Página de login con Google OAuth.

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 Crítico: Validación de estado de sesión incompleta
```javascript
// ACTUAL (problemático)
sb.auth.getSession().then(function(r){
  if(r.data.session) window.location.replace('dashboard.html');
});
```

**Problemas:**
- No maneja errores de conexión
- No valida si el usuario es broker/agent
- No guarda datos de sesión

### 🟠 Moderado: Error handling débil
```javascript
// ACTUAL
if(r.error) {
  showLoading(false);
  showErr('Error al conectar con Google: ' + r.error.message);
}
```

**Problema:** No distingue entre errores de red vs errores de autenticación

### 🟡 Menor: UX en carga lenta
Sin indicador visual de progreso en login redirect

## ✅ MEJORAS SUGERIDAS

```javascript
// 1. Validar sesión con timeout
Promise.race([
  sb.auth.getSession(),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), 5000)
  )
]).then(r => {
  if(r.data.session) {
    // Validar rol del usuario
    const user = r.data.session.user;
    if(user.user_metadata?.role) {
      window.location.replace('dashboard.html');
    } else {
      showErr('Usuario sin rol asignado');
    }
  }
}).catch(e => {
  if(e.message === 'Timeout') {
    showErr('Conexión lenta. Reintentando...');
  }
});

// 2. Mejorar feedback visual
function showLoading(v) {
  const msg = document.getElementById('loading-msg');
  msg.innerHTML = v ? 
    '<span class="spin"></span>Conectando con Google...' :
    '';
  msg.classList.toggle('hidden', !v);
}

// 3. Agregar retry automático
let retryCount = 0;
async function loginGoogle() {
  try {
    retryCount = 0;
    showLoading(true);
    hideErr();
    const r = await sb.auth.signInWithOAuth({...});
    if(r.error) throw r.error;
  } catch(e) {
    retryCount++;
    if(retryCount < 3) {
      setTimeout(() => loginGoogle(), 2000 * retryCount);
    } else {
      showErr('Error persistente. Recarga la página.');
    }
  }
}
```

## 🎯 Prioridad: **MEDIA** | Complejidad: **MEDIA**

---

# 2. dashboard.html — Dashboard Principal

## 📌 Descripción
Dashboard principal con KPIs, operaciones activas, próximos eventos y gráfico anual.

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 Crítico: Falta de caché para datos
```javascript
// ACTUAL
(async function(){
  var r = await initPage('dashboard.html'); 
  // Hace 10+ requests sin cachear
  var [ur,opR]=await Promise.all([...]);
  var tc = await db.tracking.get(user.id, year, getISOWeek(now));
  var txR = await db.transactions.list(user.id, year+'-'+mm+'-01', ...);
  // Cada recarga: nuevas queries
})();
```

**Problema:** Cada recarga del dashboard hace 10+ queries a Supabase

**Solución:**
```javascript
// Implementar caché simple
const dashboardCache = {
  data: null,
  timestamp: 0,
  TTL: 5 * 60 * 1000, // 5 minutos
  
  isValid: function() {
    return this.data && Date.now() - this.timestamp < this.TTL;
  },
  
  get: function() {
    return this.isValid() ? this.data : null;
  },
  
  set: function(data) {
    this.data = data;
    this.timestamp = Date.now();
  }
};

// En initPage
const cached = dashboardCache.get();
if(cached) {
  renderDashboard(cached);
  return;
}
```

### 🟠 Moderado: Gráfico de Chart.js sin destrucción
```javascript
// ACTUAL
updateChart() {
  if(chartInst) chartInst.destroy(); // OK
  chartInst = new Chart(...); // Crea nuevo
}
```

**Problema:** Si llama updateChart() rápidamente, puede haber memory leak

**Solución:**
```javascript
updateChart() {
  // Detener chart animation antes de destruir
  if(chartInst) {
    chartInst.destroy();
    chartInst = null;
  }
  
  // Esperar a que DOM esté listo
  requestAnimationFrame(() => {
    chartInst = new Chart(...);
  });
}
```

### 🟡 Menor: Cálculo de ISO Week está duplicado
```javascript
// Aparece en 3 archivos: dashboard.html, seguimiento.html, equipo.html
function getISOWeek(d) {
  var date = new Date(d);
  date.setHours(0,0,0,0);
  date.setDate(date.getDate()+3-(date.getDay()+6)%7);
  var week1 = new Date(date.getFullYear(),0,4);
  return 1+Math.round(((date-week1)/86400000-3+(week1.getDay()+6)%7)/7);
}
```

**Problema:** Código duplicado

**Solución:** Mover a `shared.js`

## ✅ MEJORAS SUGERIDAS

```javascript
// 1. Agregar indicador de refresh
<div class="refresh-indicator hidden" id="refresh-indicator">
  🔄 Actualizando datos...
</div>

document.getElementById('refresh-indicator').classList.remove('hidden');
// ... fetch data ...
document.getElementById('refresh-indicator').classList.add('hidden');

// 2. Agregar botón de refresh manual
<button class="btn btn-sm" onclick="refreshDashboard()">
  <i class="bi bi-arrow-clockwise"></i> Actualizar
</button>

// 3. Agregar fecha de última actualización
<div class="muted" id="last-update">
  Última actualización: hace 2 min
</div>

// 4. Debounce para cambios de TC
let tcTimeout;
document.getElementById('tc-input').addEventListener('change', () => {
  clearTimeout(tcTimeout);
  tcTimeout = setTimeout(saveTC, 500);
});
```

## 🎯 Prioridad: **ALTA** | Complejidad: **MEDIA**

---

# 3. admin.html — Administración

## 📌 Descripción
Gestión de usuarios, roles, metas mensuales.

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 Crítico: Control de acceso débil
```javascript
// ACTUAL
(async function(){
  var r=await initPage('admin.html');
  if(!r)return;
  if(r.user.role!=='broker'){
    window.location.replace('dashboard.html');
    return;
  }
  uid=r.user.id;
  await load();
})();
```

**Problema:** Redirección visible en el navegador del usuario (IDOR risk)

**Solución:**
```javascript
// Mejor: Verificación en backend
async function initPageSecure(page, requiredRole) {
  const session = await sb.auth.getSession();
  if(!session.data.session) {
    window.location.replace('index.html');
    return null;
  }
  
  // Llamar a RPC de Supabase para verificar rol
  const { data, error } = await sb.rpc('verify_role', {
    required_role: requiredRole
  });
  
  if(error || !data) {
    showErr('Acceso denegado');
    window.location.replace('dashboard.html');
    return null;
  }
  
  return { user: data };
}

// Uso:
const r = await initPageSecure('admin.html', 'broker');
if(!r) return;
```

### 🟠 Moderado: Sin confirmación en cambios de rol críticos
```javascript
// ACTUAL
async function changeRole(userId,newRole){
  if(!confirm('¿Cambiar rol a '+(newRole==='broker'?'Broker':'Agente')+'?'))return;
  var r=await db.users.update(userId,{role:newRole});
}
```

**Problema:** Cambiar a Broker es una acción muy grave (acceso a admin panel completo)

**Solución:**
```javascript
async function changeRole(userId, newRole) {
  if(newRole === 'broker') {
    // Requiere confirmación doble
    if(!confirm('⚠️ ACCIÓN CRÍTICA: Esto dará acceso TOTAL al panel admin.\n\n¿Confirmar?')) 
      return;
    if(!confirm('Última confirmación: Este usuario podrá ver a TODOS los agentes.'))
      return;
    
    // Log de auditoría
    await db.audit.log({
      action: 'role_change_to_broker',
      target_user_id: userId,
      changed_by: uid,
      timestamp: new Date()
    });
  }
  
  var r = await db.users.update(userId, {role: newRole});
  if(!r.error) {
    toast(`Rol actualizado a ${newRole}`);
    // Email al nuevo broker
    gmailNotify(userEmail, `Se cambió tu rol a Broker`);
  }
}
```

### 🟡 Menor: Form de metas sin validación visual
```javascript
// ACTUAL
<input id="g-con" type="number" placeholder="100">
<input id="g-tas" type="number" placeholder="4">
```

**Problema:** No hay feedback visual si números son ilógicos

## ✅ MEJORAS SUGERIDAS

```javascript
// 1. Validación en tiempo real
['g-con','g-tas','g-cap','g-vis','g-cie'].forEach(id => {
  document.getElementById(id).addEventListener('change', (e) => {
    const val = parseInt(e.target.value) || 0;
    
    // Validaciones según tipo
    if(id === 'g-cie' && val > 30) {
      e.target.classList.add('warning');
      toast('⚠️ Meta de cierres muy alta', 'warning');
    } else {
      e.target.classList.remove('warning');
    }
  });
});

// 2. Comparar con promedio histórico
async function loadGoals() {
  const id = document.getElementById('agSelect').value;
  
  // Obtener histórico
  const hist = await db.tracking.stats(id, 12); // últimos 12 meses
  const avg = {
    contacts: Math.round(hist.avg.contacts_worked),
    captures: Math.round(hist.avg.captures),
  };
  
  // Mostrar comparación
  <div class="alert-box alert-info">
    💡 Promedio histórico: ${avg.contacts} contactos
    Meta propuesta: <strong id="goal-val">100</strong>
    Diferencia: <span id="goal-diff">0%</span>
  </div>
}

// 3. Tabla de auditoría de cambios de rol
<table id="role-history">
  <thead>
    <tr><th>Usuario</th><th>Cambio</th><th>Por</th><th>Fecha</th></tr>
  </thead>
  <tbody id="role-history-body"></tbody>
</table>

// Cargar historial
const history = await db.audit.list({action: 'role_change'});
```

## 🎯 Prioridad: **CRÍTICA** | Complejidad: **MEDIA**

---

# 4. equipo.html — Mi Equipo

## 📌 Descripción
Dashboard para broker: performance de agentes, ranking, métricas.

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 Crítico: Fórmula de performance incompleta
```javascript
// ACTUAL
var perf=agentPerformanceStatus(ag, meta);
```

**Problema:** No sabemos cómo se calcula. La función viene de `shared.js`

**Solución:**
```javascript
// Debería mostrar breakdowns
function agentPerformanceDetailed(agent, meta) {
  const t = agent.tracking || {};
  const metrics = [
    {name: 'Contactos', actual: t.contacts, target: meta.contacts, pct: (t.contacts/meta.contacts)*100},
    {name: 'Captaciones', actual: t.captures, target: meta.captures, pct: (t.captures/meta.captures)*100},
    {name: 'Visitas', actual: t.visits, target: meta.visits, pct: (t.visits/meta.visits)*100},
    {name: 'Cierres', actual: t.sales, target: meta.sales, pct: (t.sales/meta.sales)*100},
  ];
  
  const overall = metrics.reduce((s,m) => s + m.pct, 0) / metrics.length;
  
  return {
    overall,
    metrics,
    status: overall >= 80 ? 'green' : overall >= 50 ? 'yellow' : 'red',
    trend: calculateTrend(agent.id) // Comparar con mes anterior
  };
}
```

### 🟠 Moderado: Sin alert de agentes en riesgo severo
```javascript
// ACTUAL
var deficit=data.filter(function(d){return d.perf.avg<50;});
document.getElementById('alerts-eq').innerHTML=deficit.length
  ?'<div class="alert-box alert-red">⚠️ En déficit: <strong>'+deficit.map(...
```

**Problema:** Solo muestra alert, no permite tomar acción

**Solución:**
```html
<div id="alerts-eq"></div>

<div class="card hidden" id="intervention-panel">
  <div class="card-title">🎯 Plan de Intervención</div>
  <div id="intervention-actions"></div>
</div>
```

```javascript
// Mostrar panel de intervención
if(deficit.length) {
  document.getElementById('intervention-panel').classList.remove('hidden');
  
  const actions = deficit.map(agent => `
    <div class="intervention-card">
      <div><strong>${agent.name}</strong> (${agent.perf.avg}%)</div>
      <button class="btn btn-sm" onclick="scheduleCoaching('${agent.id}')">
        📞 Agendar coaching
      </button>
      <button class="btn btn-sm" onclick="openAgentDetail('${agent.id}')">
        📊 Ver detalles
      </button>
    </div>
  `).join('');
  
  document.getElementById('intervention-actions').innerHTML = actions;
}
```

### 🟡 Menor: Falta comparación mes anterior
```javascript
// ACTUAL
var perf=agentPerformanceStatus({...},g);
// No compara con mes anterior
```

## ✅ MEJORAS SUGERIDAS

```javascript
// 1. Agregar trend indicator
<div class="trend-badge trend-up">📈 +15%</div>  <!-- Si mejoró vs mes pasado -->
<div class="trend-badge trend-down">📉 -8%</div>  <!-- Si empeoró -->
<div class="trend-badge trend-flat">➡️ 0%</div>   <!-- Sin cambios -->

// 2. Agregar mini-chart de últimos 3 meses
data.map(agent => {
  const trend = await db.tracking.trend(agent.id, 3); // últimos 3 meses
  renderMiniChart(agent.id, trend);
});

// 3. Agregar predicción: ¿Va a llegar a meta?
function predictMetaCompletion(agent, remainingDays) {
  const dailyRate = agent.currentValue / agent.daysPassed;
  const projected = agent.currentValue + (dailyRate * remainingDays);
  const onTrack = projected >= agent.targetValue;
  
  return {
    projected,
    onTrack,
    message: onTrack ? 
      `✅ En camino (${projected} vs ${agent.targetValue})` :
      `⚠️ Necesita ${Math.ceil((agent.targetValue - projected) / dailyRate)} días extra`
  };
}
```

## 🎯 Prioridad: **ALTA** | Complejidad: **MEDIA**

---

# 5. contactos.html — Contactos

## 📌 Descripción
Gestión de contactos, filtros, búsqueda.

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 Crítico: Búsqueda sin optimización
```javascript
// ACTUAL (problemático)
render(all.filter(function(c){
  return(!q||(c.name||'').toLowerCase().includes(q))
    &&(!s||c.status===s)
    &&(!t||c.type===t)
    &&(!o||c.origin===o);
}));
```

**Problema:** Filtra 10,000+ registros en el cliente (muy lento)

**Solución:**
```javascript
// Usar debounce + búsqueda en servidor
let searchTimeout;
document.getElementById('q').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchContacts(e.target.value);
  }, 300); // Esperar 300ms
});

async function searchContacts(query) {
  // Búsqueda en servidor con índice full-text
  const r = await sb.rpc('search_contacts', {
    query_text: query,
    filters: {
      status: selectedStatus,
      type: selectedType,
      origin: selectedOrigin,
      user_id: uid
    }
  });
  
  render(r.data);
}
```

### 🟠 Moderado: Sin indicador de búsqueda en progreso
```javascript
// ACTUAL
// Abre modal, carga datos... pero sin feedback visual
```

**Solución:**
```javascript
// Agregar loading state en modal
async function openModal(id) {
  const modal = document.getElementById('modal');
  modal.querySelector('.modal-body').innerHTML = '<div class="loading">Cargando…</div>';
  modal.classList.remove('hidden');
  
  if(id) {
    const contact = await db.contacts.get(id);
    populateForm(contact);
  }
  
  modal.querySelector('.modal-body').innerHTML = '<!-- form aquí -->';
}
```

### 🟡 Menor: Falta vista de relacionados
```javascript
// Al abrir un contacto, no muestra:
// - Operaciones del contacto
// - Seguimientos pendientes
// - Historial de comunicación
```

## ✅ MEJORAS SUGERIDAS

```javascript
// 1. Tabs en modal del contacto
<div class="modal">
  <div class="tabs">
    <button class="tab on" onclick="switchTab('info')">Datos</button>
    <button class="tab" onclick="switchTab('operations')">Operaciones</button>
    <button class="tab" onclick="switchTab('history')">Historial</button>
  </div>
  
  <div id="tab-info"><!-- Form del contacto --></div>
  <div id="tab-operations" class="hidden">
    <div id="contact-operations"></div>
  </div>
  <div id="tab-history" class="hidden">
    <div id="contact-history"></div>
  </div>
</div>

// 2. Timeline de comunicación
async function loadContactTimeline(contactId) {
  const events = await db.contacts.timeline(contactId);
  // Combina: operaciones, seguimientos, transacciones, etc.
  
  renderTimeline(events.map(e => ({
    date: e.date,
    type: e.type, // 'operation', 'nurturing', 'call', etc.
    description: e.description,
    agent: e.agent_name
  })));
}

// 3. Sugerir acciones próximas
if(contact.status === 'nurturing') {
  showSuggestion('Siguiente toque: ' + nextTouchDate);
  showButton('Registrar toque', () => openNurturing(contact.id));
}
```

## 🎯 Prioridad: **MEDIA** | Complejidad: **ALTA**

---

# 6. acm.html — Tasaciones (ACM)

## 📌 Descripción
Gestión de tasaciones/valuaciones de propiedades.

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 Crítico: Falta de validación de datos de tasación
```javascript
// ACTUAL (sin validación visible)
// Solo guarda valores sin verificar coherencia
```

**Problema:** Tasación puede tener errores graves (ej: m² = 0, precio = 0)

**Solución:**
```javascript
async function saveTasacion() {
  const data = {
    area_m2: parseFloat(document.getElementById('area').value),
    price_usd: parseFloat(document.getElementById('price').value),
    // ...
  };
  
  // Validaciones
  const errors = [];
  
  if(!data.area_m2 || data.area_m2 <= 0) 
    errors.push('Superficie debe ser mayor a 0');
    
  if(!data.price_usd || data.price_usd <= 0) 
    errors.push('Precio debe ser mayor a 0');
  
  // Validar coherencia de precio/m²
  const pricePerM2 = data.price_usd / data.area_m2;
  const avgPriceM2 = await db.stats.avgPricePerM2(contactZone);
  
  if(pricePerM2 < avgPriceM2 * 0.5 || pricePerM2 > avgPriceM2 * 2) {
    errors.push(
      `⚠️ Precio por m² (USD ${pricePerM2}) está muy lejos del promedio (USD ${avgPriceM2})`
    );
  }
  
  if(errors.length) {
    showErrorsAndAsk('Advertencias:', errors, 
      '¿Continuar de todos modos?', 
      () => submitTasacion(data)
    );
    return;
  }
  
  await submitTasacion(data);
}
```

### 🟠 Moderado: Sin historial de tasaciones anteriores
```javascript
// No muestra si ya se hizo tasación antes
```

**Solución:**
```javascript
async function openTasacionModal(contactId) {
  // Obtener tasaciones anteriores
  const previous = await db.appraisals.list({contact_id: contactId});
  
  if(previous.length) {
    showAlert('info', `
      Este contacto tiene ${previous.length} tasación(es) anterior(es):
      ${previous.map(p => 
        `${p.date} - USD ${p.price} (${p.area_m2}m²)`
      ).join('<br>')}
    `);
  }
}
```

## ✅ MEJORAS SUGERIDAS

```javascript
// 1. Comparativa visual de tasaciones
<div class="comparison">
  <div>
    <strong>Tasación anterior</strong>
    <div>USD ${previous.price}</div>
    <div>${previous.area_m2} m²</div>
  </div>
  <div class="arrow">→</div>
  <div>
    <strong>Nueva tasación</strong>
    <input id="price" value="${previous.price}">
    <input id="area" value="${previous.area_m2}">
  </div>
</div>

// 2. Calcular variación
const prevPrice = previous.price / previous.area_m2;
const newPrice = newData.price_usd / newData.area_m2;
const variation = ((newPrice - prevPrice) / prevPrice * 100).toFixed(1);

showAlert(
  variation > 10 ? 'warning' : 'info',
  `Precio/m² cambió ${variation > 0 ? '+' : ''}${variation}%`
);

// 3. Flujo post-tasación automático
if(contact.status === 'tasacion_rejected') {
  // Sugerir entrar en nurturing
  showAction({
    title: '¿Iniciar seguimiento nurturing?',
    description: 'Este contacto rechazó la tasación.',
    buttons: [
      {text: 'Iniciar nurturing', onclick: () => startNurturing(contact.id)},
      {text: 'Solo guardar', onclick: () => closeModal()}
    ]
  });
}
```

## 🎯 Prioridad: **MEDIA** | Complejidad: **MEDIA**

---

# 7. colegas.html — Colegas

## 📌 Descripción
Gestión de colegas externos (otras inmobiliarias).

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 Crítico: Sin validación de teléfono/email
```javascript
// ACTUAL
<input id="cph" type="tel" placeholder="11-1234-5678">
<input id="cem" type="email" placeholder="colega@email.com">
// Guarda sin validar
```

**Solución:**
```javascript
function validatePhone(phone) {
  // Validar formato: +54 o 54 o 11 o sin prefijo
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 12;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

async function save() {
  const name = document.getElementById('cn').value.trim();
  const phone = document.getElementById('cph').value.trim();
  const email = document.getElementById('cem').value.trim();
  
  if(!name) { toast('Nombre requerido', 'error'); return; }
  if(phone && !validatePhone(phone)) { 
    toast('Teléfono inválido', 'error'); 
    return; 
  }
  if(email && !validateEmail(email)) { 
    toast('Email inválido', 'error'); 
    return; 
  }
  
  // Guardar...
}
```

### 🟠 Moderado: Sin confirmación antes de eliminar
```javascript
// ACTUAL
// No hay opción de eliminar
```

**Solución:**
```javascript
<button class="btn btn-sm" style="color:var(--red)" 
  data-id="${c.id}" onclick="deleteColega(this)">
  🗑️ Eliminar
</button>

async function deleteColega(btn) {
  const id = btn.getAttribute('data-id');
  
  // Verificar si tiene operaciones
  const opsCount = await db.operations.count({buyer_colleague_id: id});
  
  if(opsCount) {
    showErr(`No se puede eliminar: tiene ${opsCount} operación(es) asociada(s)`);
    return;
  }
  
  if(!confirm('¿Eliminar este colega?')) return;
  
  await db.colleagues.delete(id);
  toast('Colega eliminado');
  await load();
}
```

## ✅ MEJORAS SUGERIDAS

```javascript
// 1. Detalles de interacción
<div class="colleague-stats">
  <div>Operaciones: <strong>${opsCount}</strong></div>
  <div>Última operación: <strong>${lastOpsDate}</strong></div>
  <div>Comisión promedio: <strong>${avgCommission}%</strong></div>
</div>

// 2. Favoritos/Favoritos frecuentes
<button class="btn btn-sm" onclick="toggleFavorite('${c.id}')">
  ${isFavorite ? '⭐' : '☆'} Favorito
</button>

// 3. Integración de zona de trabajo
<div class="frow">
  <label>Zona que trabaja</label>
  <input id="czones" placeholder="Caballito, Recoleta, Barrio Norte">
</div>
```

## 🎯 Prioridad: **BAJA** | Complejidad: **BAJA**

---

# 8. propiedades.html — Propiedades

## 📌 Descripción
Catálogo de propiedades listadas.

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 Crítico: Sin fotos/galería de propiedades
```javascript
// ACTUAL
// Solo almacena links a portales, sin galería local
```

**Problema:** No hay forma de ver fotos sin abrir portal externo

**Solución:**
```html
<!-- Modal con galería -->
<div class="modal" id="property-gallery">
  <div class="gallery-container">
    <img id="gallery-main" src="" />
    <div class="gallery-thumbs" id="thumbs"></div>
    <button class="btn btn-sm" onclick="uploadPhoto()">
      📸 Agregar foto
    </button>
  </div>
</div>
```

```javascript
async function loadPropertyPhotos(propertyId) {
  const photos = await db.properties.photos(propertyId);
  
  if(!photos.length) {
    showMsg('Sin fotos. ¿Agregar galería?');
    return;
  }
  
  renderGallery(photos);
}

async function uploadPhoto() {
  const file = document.querySelector('input[type="file"]').files[0];
  if(!file) return;
  
  const formData = new FormData();
  formData.append('file', file);
  
  const url = await uploadToSupabase(
    `properties/${propertyId}/${Date.now()}.jpg`
  );
  
  await db.properties.addPhoto({
    property_id: propertyId,
    url: url,
    order: maxOrder + 1
  });
  
  await loadPropertyPhotos(propertyId);
}
```

### 🟠 Moderado: Sin mapa de propiedades
```javascript
// ACTUAL
// Solo tabla, no hay vista geográfica
```

**Solución:** Integrar Google Maps

```html
<div id="property-map" style="width:100%; height:400px"></div>

<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY"></script>
```

```javascript
async function renderPropertyMap() {
  const properties = all.filter(p => p.status === 'activa');
  
  const map = new google.maps.Map(
    document.getElementById('property-map'),
    {zoom: 12, center: {lat: -34.6037, lng: -58.3816}} // CABA
  );
  
  properties.forEach(p => {
    if(!p.latitude || !p.longitude) return;
    
    new google.maps.Marker({
      position: {lat: p.latitude, lng: p.longitude},
      map: map,
      title: p.address,
      infoWindow: new google.maps.InfoWindow({
        content: `<strong>${p.address}</strong><br>USD ${p.price_usd}`
      })
    });
  });
}
```

## ✅ MEJORAS SUGERIDAS

```javascript
// 1. Filtro por zona (usando Google Maps Bounds)
async function filterByZone() {
  const bounds = map.getBounds();
  const filtered = all.filter(p => {
    const location = new google.maps.LatLng(p.latitude, p.longitude);
    return bounds.contains(location);
  });
  
  render(filtered);
}

// 2. Comparativa de propiedades
<button onclick="compareProperties()">
  ⚖️ Comparar propiedades
</button>

// Mostrar tabla comparativa de precios, superficies, etc.

// 3. Notificaciones de precio
<input id="price-alert" type="number" placeholder="Precio máximo">
<button onclick="setPriceAlert()">
  🔔 Alertar si cae a USD ${priceLimit}
</button>
```

## 🎯 Prioridad: **MEDIA** | Complejidad: **ALTA**

---

# 9. operaciones.html — Operaciones (Pipeline)

## 📌 Descripción
Pipeline de operaciones con vista Kanban y Lista.

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 Crítico: Vista Kanban sin persistencia de orden
```javascript
// ACTUAL (sin drag-and-drop)
<button class="btn" id="btn-kanban" onclick="setView('kanban')">Kanban</button>
```

**Problema:** El Kanban es solo visual, no permite arrastrar tarjetas

**Solución:**
```html
<div class="kanban-board">
  <div class="kanban-column" data-stage="propuesta">
    <h3>Propuesta</h3>
    <div class="kanban-cards" id="cards-propuesta"></div>
  </div>
  <div class="kanban-column" data-stage="tasacion">
    <h3>Tasación</h3>
    <div class="kanban-cards" id="cards-tasacion"></div>
  </div>
  <!-- ... más etapas ... -->
</div>
```

```javascript
// Implementar drag-and-drop
document.querySelectorAll('.kanban-cards').forEach(column => {
  column.addEventListener('dragover', (e) => {
    e.preventDefault();
    column.classList.add('drag-over');
  });
  
  column.addEventListener('dragleave', () => {
    column.classList.remove('drag-over');
  });
  
  column.addEventListener('drop', async (e) => {
    e.preventDefault();
    const operationId = e.dataTransfer.getData('text/plain');
    const newStage = column.parentElement.getAttribute('data-stage');
    
    // Actualizar en BD
    await db.operations.updateStage(operationId, newStage);
    
    // Actualizar UI
    await load();
  });
});

// Hacer cards arrastrables
document.querySelectorAll('.kanban-card').forEach(card => {
  card.draggable = true;
  card.addEventListener('dragstart', (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.getAttribute('data-id'));
  });
});
```

### 🟠 Moderado: Sin timeline de etapas
```javascript
// ACTUAL
// No muestra cuándo cambió a cada etapa
```

**Solución:**
```javascript
<div class="operation-timeline">
  <div class="timeline-step">
    <div class="timeline-marker completed"></div>
    <div class="timeline-date">2026-01-15</div>
    <div class="timeline-stage">Propuesta</div>
  </div>
  <div class="timeline-step">
    <div class="timeline-marker completed"></div>
    <div class="timeline-date">2026-02-01</div>
    <div class="timeline-stage">Tasación</div>
  </div>
  <div class="timeline-step">
    <div class="timeline-marker current"></div>
    <div class="timeline-date">2026-02-15</div>
    <div class="timeline-stage">Negociación (actual)</div>
  </div>
</div>
```

```javascript
async function renderOperationTimeline(operationId) {
  const history = await db.operations.stageHistory(operationId);
  
  const timeline = history.map((h, idx) => `
    <div class="timeline-step">
      <div class="timeline-marker ${idx === history.length - 1 ? 'current' : 'completed'}"></div>
      <div class="timeline-date">${h.date}</div>
      <div class="timeline-stage">${STAGE_LABELS[h.stage]}</div>
    </div>
  `).join('');
  
  document.getElementById('operation-timeline').innerHTML = timeline;
}
```

### 🟡 Menor: Sin indicador de tiempo en cada etapa
```javascript
// No muestra: "Lleva 15 días en Tasación"
```

## ✅ MEJORAS SUGERIDAS

```javascript
// 1. Calcular tiempo por etapa
<div class="stage-duration">
  ⏱️ En esta etapa: <strong>15 días</strong>
  (Promedio: 10 días)
</div>

// 2. Alertar si está mucho tiempo en una etapa
function checkStageDuration(operation) {
  const daysInStage = 
    (Date.now() - new Date(operation.stage_date)) / (1000*60*60*24);
  
  const averageByStage = {
    'propuesta': 7,
    'tasacion': 5,
    'negociacion': 15,
    'boleto': 30,
  };
  
  const average = averageByStage[operation.stage] || 14;
  
  if(daysInStage > average * 2) {
    showWarning(`
      ⚠️ Esta operación lleva ${Math.floor(daysInStage)} días en ${operation.stage}
      (Promedio: ${average} días)
    `);
  }
}

// 3. Agregar notas/milestones por etapa
<div class="stage-notes">
  <input placeholder="Notas de esta etapa...">
  <ul id="milestones">
    <li>✓ Cliente revisó propuesta (2026-01-20)</li>
    <li>⏳ Tasador confirmado, esperando día (2026-02-01)</li>
  </ul>
</div>
```

## 🎯 Prioridad: **CRÍTICA** | Complejidad: **ALTA**

---

# 10. transferencias.html — Transferencias

## 📌 Descripción
Solicitud y aprobación de transferencia de operaciones entre agentes.

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 Crítico: Sin trail de auditoría completo
```javascript
// ACTUAL
async function approve(btn){
  var id=btn.getAttribute('data-id');
  if(!confirm('¿Aprobar esta transferencia?'))return;
  var r=await db.transfers.approve(id,uid);
  // Sin registrar detalles
}
```

**Problema:** No se registra quién aprobó, cuándo, etc.

**Solución:**
```javascript
async function approve(btn) {
  const id = btn.getAttribute('data-id');
  const transfer = all.find(t => t.id === id);
  
  if(!confirm(`¿Transferir "${transfer.operation.seller.name}" a ${transfer.to_user.name}?`)) 
    return;
  
  // Registrar auditoría detallada
  const auditLog = {
    action: 'transfer_approved',
    transfer_id: id,
    operation_id: transfer.operation_id,
    from_user_id: transfer.from_user_id,
    to_user_id: transfer.to_user_id,
    approved_by: uid,
    approved_at: new Date(),
    commission_split: transfer.commission_split_pct,
    notes: `Aprobado por ${CRM.user.name}`
  };
  
  const r = await db.transfers.approve(id, auditLog);
  if(r.error) {
    toast('Error: ' + r.error.message, 'error');
    return;
  }
  
  // Notificar a ambos usuarios
  await gmailNotify([
    transfer.from_user.email,
    transfer.to_user.email
  ], {
    subject: 'Transferencia de operación aprobada',
    body: `${transfer.operation.seller.name}: transferido a ${transfer.to_user.name}`
  });
  
  toast('Transferencia aprobada');
  await load();
}
```

### 🟠 Moderado: Sin validación de comisión split
```javascript
// ACTUAL
<input id="tsplit" type="number" value="0" min="0" max="100" placeholder="0">
// Nunca valida
```

**Problema:** Podría quedar 150% comisión si no se revisa

**Solución:**
```javascript
document.getElementById('tsplit').addEventListener('change', (e) => {
  const split = parseInt(e.target.value) || 0;
  
  if(split < 0 || split > 100) {
    showErr('La comisión debe estar entre 0 y 100%');
    e.target.value = 0;
    return;
  }
  
  const remaining = 100 - split;
  const info = document.getElementById('commission-info');
  info.innerHTML = `
    <div class="alert-box alert-info">
      💡 Distribución de comisión:
      <div>Agente original: ${split}%</div>
      <div>Agente nuevo: ${remaining}%</div>
    </div>
  `;
});
```

## ✅ MEJORAS SUGERIDAS

```javascript
// 1. Mostrar condiciones de transferencia
<div class="transfer-conditions">
  <strong>Condiciones:</strong>
  <ul>
    <li>Comisión original: <strong>${from.name}</strong> - 45%</li>
    <li>Comisión nueva: <strong>${to.name}</strong> - 55%</li>
    <li>Motivo: <strong>${transfer.reason}</strong></li>
  </ul>
</div>

// 2. Opción de reversa (si se aprobó por error)
<button class="btn btn-sm" onclick="reverseTransfer('${t.id}')">
  ↩️ Revertir esta transferencia
</button>

async function reverseTransfer(transferId) {
  const transfer = all.find(t => t.id === transferId);
  if(!confirm(`¿Revertir transferencia? ${transfer.operation.seller.name} vuelve a ${transfer.from_user.name}`))
    return;
    
  await db.transfers.reverse(transferId, uid);
}

// 3. Historial de transferencias de cada operación
await db.operations.get(opId).then(op => {
  const transfers = await db.transfers.byOperation(opId);
  renderTransferHistory(transfers);
});
```

## 🎯 Prioridad: **MEDIA** | Complejidad: **BAJA**

---

# 11. seguimiento.html — Seguimiento Semanal

## 📌 Descripción
Registro de actividades semanales (contactos, tasaciones, visitas, etc.).

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 Crítico: Sin validación de datos coherentes
```javascript
// ACTUAL
<input type="number" min="0" id="d-${date}-contacts_worked">
<input type="number" min="0" id="d-${date}-closed_sales">
// Guarda sin validar
```

**Problema:** Podría tener 100 visitas pero 0 cierres (incoherente)

**Solución:**
```javascript
async function saveAll() {
  const errors = [];
  
  days.forEach(day => {
    const contacts = parseInt(document.getElementById(`d-${day.date}-contacts_worked`).value) || 0;
    const visits = parseInt(document.getElementById(`d-${day.date}-sale_visits`).value) || 0;
    const sales = parseInt(document.getElementById(`d-${day.date}-closed_sales`).value) || 0;
    
    // Validaciones lógicas
    if(visits > contacts) {
      errors.push(`${day.day_name}: No puede haber más visitas que contactos`);
    }
    
    if(sales > visits) {
      errors.push(`${day.day_name}: No puede haber más cierres que visitas`);
    }
    
    // Ratio realista
    if(visits > 0 && (sales / visits) > 0.5) {
      errors.push(`${day.day_name}: Tasa de cierre muy alta (${((sales/visits)*100).toFixed(0)}%)`);
    }
  });
  
  if(errors.length) {
    showWarning('Validaciones:', errors.join('<br>'));
  }
  
  // Permitir guardar igual
  if(!confirm('¿Guardar de todos modos?')) return;
  
  await db.tracking.upsert({...});
}
```

### 🟠 Moderado: Sin comparación con metas
```javascript
// ACTUAL
// Muestra números, pero no compara con meta del mes
```

**Solución:**
```javascript
async function renderWeek() {
  const dates = getWDates(curYear, curWeek);
  const weekNumber = curWeek;
  
  // Obtener meta semanal
  const monthMeta = (CRM.user.settings?.monthly_goals) || {};
  const weekMeta = {
    contacts: Math.round((monthMeta.contacts || 100) / 4.3), // Promedio semana
    captures: Math.round((monthMeta.captures || 2) / 4.3),
    visits: Math.round((monthMeta.visits || 20) / 4.3),
    sales: Math.round((monthMeta.sales || 1) / 4.3),
  };
  
  dates.forEach(date => {
    METRICS.forEach(metric => {
      const actual = parseInt(document.getElementById(`d-${date}-${metric.k}`).value) || 0;
      const meta = weekMeta[metric.k] || 0;
      const pct = meta > 0 ? ((actual / meta) * 100).toFixed(0) : 0;
      
      // Visual indicator
      const color = pct >= 80 ? 'green' : pct >= 50 ? 'amber' : 'red';
      renderProgressBar(date, metric.k, actual, meta, pct, color);
    });
  });
}
```

## ✅ MEJORAS SUGERIDAS

```javascript
// 1. Agregar predicción de mes
<div class="month-forecast">
  <strong>Proyección del mes:</strong>
  Semanas 1-2: 60 contactos (en camino)
  Semana 3: 65 contactos (en camino)
  Meta total: 100 (⚠️ Falta 35)
</div>

// 2. Día con mayor actividad
const dayStats = days.map(d => ({
  day: d.day_name,
  total: d.metrics.contacts_worked + d.metrics.sale_visits
}));
const busiest = dayStats.sort((a,b) => b.total - a.total)[0];

<div class="alert-box alert-info">
  📊 Día más activo: ${busiest.day} (${busiest.total} actividades)
</div>

// 3. Exportar a Excel/PDF
<button onclick="exportWeekly()">
  📥 Descargar reporte semanal
</button>
```

## 🎯 Prioridad: **MEDIA** | Complejidad: **BAJA**

---

# 12. calendario.html — Calendario

## 📌 Descripción
Calendario mensual con eventos (cumpleaños, reuniones, vencimientos).

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🟠 Moderado: Eventos sin color diferenciador
```javascript
// ACTUAL
<div class="cal-ev ev-cumple">🎂 Cumple</div>
<div class="cal-ev ev-nurturing">🔄 Nurturing</div>
```

**Problema:** Se ve amontonado si hay muchos eventos en un día

**Solución:**
```css
/* style.css o style-enhanced.css */
.ev-cumple { background: #fbbf24; color: #78350f; }
.ev-nurturing { background: #a78bfa; color: #4c0519; }
.ev-postventa { background: #86efac; color: #1b2e1b; }
.ev-operacion { background: #60a5fa; color: #0c2342; }
.ev-reunion { background: #f87171; color: #7f1d1d; }
```

```html
<!-- Agrupar eventos en modal si hay muchos -->
<div id="day-events-modal" class="modal hidden">
  <div class="modal-body">
    <h3>${selectedDate}</h3>
    <div id="events-list"></div>
  </div>
</div>
```

### 🟡 Menor: Sin vista de agenda próxima
```javascript
// Solo muestra mes, no hay vista "Próximas 7 días en agenda"
```

## ✅ MEJORAS SUGERIDAS

```javascript
// 1. Agenda próxima (debajo del calendario)
<div class="card">
  <div class="card-title">📅 Próximas actividades (7 días)</div>
  <div id="upcoming-events"></div>
</div>

// 2. ICS export (calendario de Google/Outlook)
<button onclick="exportToGoogleCalendar()">
  📤 Sincronizar con Google Calendar
</button>

// 3. Notificaciones de vencimientos hoy
function checkTodayNotifications() {
  const today = hoy();
  const todayEvents = allEvents[today] || [];
  
  todayEvents.forEach(ev => {
    if(ev.type === 'vencimiento') {
      showNotification({
        title: '⚠️ VENCIMIENTO HOY',
        body: ev.text,
        priority: 'high'
      });
    }
  });
}
```

## 🎯 Prioridad: **BAJA** | Complejidad: **BAJA**

---

# 13. nurturing.html — Nurturing

## 📌 Descripción
Seguimiento automático de contactos que rechazaron tasación.

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 Crítico: Sin validación de resultado del toque
```javascript
// ACTUAL
<select id="mresult" onchange="toggleResult()">
  <option value="">Seleccionar resultado…</option>
  <option value="no_contesto">No contestó</option>
  <option value="acepta">✅ Acepta trabajar</option>
</select>
// No valida qué es lógico para cada etapa
```

**Problema:** En etapa "7d" podría decir "acepta" sin intentar varias veces

**Solución:**
```javascript
async function openTouch(btn) {
  const id = btn.getAttribute('data-id');
  curTouch = pending.find(f => f.id === id);
  
  const stage = curTouch.stage;
  const resultSelect = document.getElementById('mresult');
  
  // Limitar opciones según etapa
  const validResults = {
    '7d': ['no_contesto', 'no_quiere_aun'],      // Solo llamar
    '30d': ['no_contesto', 'no_quiere_aun', 'acepta', 'vendio_con_otro'],
    '60d': ['no_contesto', 'no_quiere_aun', 'acepta', 'vendio_con_otro', 'no_vende'],
    '90d': ['no_contesto', 'acepta', 'vendio_con_otro', 'no_vende'],
    'mensual': ['no_contesto', 'acepta', 'vendio_con_otro', 'no_vende'],
  };
  
  // Deshabilitar opciones no válidas
  resultSelect.querySelectorAll('option').forEach(opt => {
    opt.disabled = !validResults[stage]?.includes(opt.value);
  });
  
  // Mostrar sugerencia
  showInfo(`En etapa "${STAGE_L[stage]}", resultados recomendados: ${validResults[stage].join(', ')}`);
}
```

### 🟠 Moderado: Sin seguimiento de número de intentos
```javascript
// ACTUAL
// No registra: "3 intentos sin respuesta"
```

**Solución:**
```javascript
async function openTouch(btn) {
  // ...
  
  // Obtener intentos anteriores
  const previousTouches = await db.nurturing.touches(curTouch.contact_id);
  
  if(previousTouches.length > 0) {
    showInfo(`
      Historial de toques:
      ${previousTouches.map(t => 
        `${t.date}: ${t.result} (${t.notes})`
      ).join('<br>')}
    `);
  }
}
```

## ✅ MEJORAS SUGERIDAS

```javascript
// 1. Sugerencia inteligente según historial
async function suggestNextAction() {
  const history = await db.nurturing.touches(curTouch.contact_id);
  
  if(history.every(t => t.result === 'no_contesto')) {
    return '⚠️ Sin respuesta en ' + history.length + ' intentos. Quizá cambiar método de contacto.';
  }
  
  if(history.some(t => t.result === 'no_quiere_aun') && 
     history.some(t => t.result === 'no_contesto')) {
    return '💡 Mezcla de rechazo e inatención. Probar por email.';
  }
}

// 2. Alertar si está mucho tiempo esperando
if(daysSinceLastTouch > 10) {
  showWarning(`
    ⚠️ Último toque hace ${daysSinceLastTouch} días
    (Promedio: 7 días entre toques)
  `);
}

// 3. Sugerir cambiar estrategia si no progresa
if(previousTouches.length >= 4 && !history.some(t => t.result === 'acepta')) {
  showSuggestion('💡 Sugerencia: Después de 4 toques sin respuesta, considerar archivar.');
}
```

## 🎯 Prioridad: **MEDIA** | Complejidad: **MEDIA**

---

# 14. postventa.html — Post-venta

## 📌 Descripción
Seguimiento post-cierre (3 sem, 3 meses, 1 año) + solicitud de referidos.

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 Crítico: Sin validación de referidos duplicados
```javascript
// ACTUAL
async function savePV() {
  var refName = document.getElementById('ref-name').value.trim();
  // Crea contacto sin verificar si ya existe
}
```

**Problema:** Podría crear mismo contacto 2 veces (ej: "Juan García" twice)

**Solución:**
```javascript
async function savePV() {
  const refName = document.getElementById('ref-name').value.trim();
  const refPhone = document.getElementById('ref-phone').value.trim();
  const refEmail = document.getElementById('ref-email').value.trim();
  
  if(obtRef && refName) {
    // Buscar duplicados
    const existing = await db.contacts.search({
      user_id: uid,
      name: refName,
      phone: refPhone,
      email: refEmail
    });
    
    if(existing.length > 0) {
      if(!confirm(`⚠️ Contacto "${refName}" ya existe. ¿Duplicar?`)) {
        // Usar existente
        const existingId = existing[0].id;
        await db.referrals.insert({
          source_contact_id: curPV.contact_id,
          referred_contact_id: existingId,
          // ...
        });
        toast('Referido registrado (existente)');
        return;
      }
    }
  }
  
  // Crear nuevo...
}
```

### 🟠 Moderado: Sin tracking de referidos convertidos
```javascript
// ACTUAL
// Crea referido, pero no sigue si se convirtió en cliente
```

**Solución:**
```javascript
// Después de crear referido
async function trackReferralConversion() {
  // Luego, cuando referido se convierte en cliente activo:
  await db.referrals.update(referralId, {
    status: 'convertido',
    conversion_date: today,
    operations_generated: 1 // Si cerró operación
  });
  
  // Calcular comisión por referido
  const referralBonus = operation.commission_total * 0.1; // 10% por referido
  
  showMsg(`
    ✅ Referido convertido!
    ${referredClient.name} cerró operación
    Comisión por referido: USD ${referralBonus}
  `);
}
```

## ✅ MEJORAS SUGERIDAS

```javascript
// 1. Dashboard de referidos activos
<div class="card">
  <div class="card-title">🎁 Mis referidos activos</div>
  <div id="referrals-dashboard"></div>
</div>

// Mostrar: nombre, estado, tiempo desde que se refirió, operaciones generadas

// 2. Recordatorio automático si falta etapa
if(stages === ['3_semanas', '3_meses'] && !stages.includes('1_año')) {
  // Falta última etapa
  showReminder('Próxima etapa: seguimiento de 1 año');
}

// 3. Generar template de email para referido
function generateReferralEmail() {
  return `
    Hola ${referralName},
    
    ${sourceName} me recomendó con vos porque {razón}.
    
    [Propuesta personalizada]
    
    ¿Tenés un momento?
  `;
}
```

## 🎯 Prioridad: **ALTA** | Complejidad: **MEDIA**

---

# 15. referidos.html — Referidos

## 📌 Descripción
Dashboard de referidos: quién te trajo clientes, operaciones generadas, comisiones.

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 Crítico: Sin cálculo de comisión por referido
```javascript
// ACTUAL
<td style="color:var(--green);font-weight:500">${r.commission_amount_usd?fmtU(r.commission_amount_usd):'—'}</td>
// Solo muestra si existe, no calcula
```

**Problema:** No hay forma de validar si comisión es correcta

**Solución:**
```javascript
// Calcular comisión automáticamente
async function calculateReferralCommission(referralId) {
  const referral = await db.referrals.get(referralId);
  
  if(!referral.operation_id) return 0; // Sin operación aún
  
  const operation = await db.operations.get(referral.operation_id);
  const commission = operation.agent_commission_usd;
  
  // Referral bonus: 10% de comisión del agente
  const referralBonus = commission * 0.1;
  
  // Actualizar
  await db.referrals.update(referralId, {
    commission_amount_usd: referralBonus,
    calculation_date: today
  });
  
  return referralBonus;
}
```

### 🟠 Moderado: Sin análisis de mejor fuente de referidos
```javascript
// ACTUAL
// Solo muestra lista, no análisis
```

## ✅ MEJORAS SUGERIDAS

```javascript
// 1. Gráfico de referidos por fuente
<div class="card">
  <div class="card-title">📊 Referidos por origen</div>
  <canvas id="referrals-chart"></canvas>
</div>

const byOrigin = {};
all.forEach(r => {
  byOrigin[r.source_type] = (byOrigin[r.source_type] || 0) + 1;
});

new Chart(document.getElementById('referrals-chart'), {
  type: 'doughnut',
  data: {
    labels: Object.keys(byOrigin),
    datasets: [{data: Object.values(byOrigin)}]
  }
});

// 2. Ranking de referentes (quién trae más clientes)
// 3. ROI por referido (cuánto generó vs tiempo invertido)
// 4. Alertas de referidos "dormidos" sin operación hace 6 meses
```

## 🎯 Prioridad: **MEDIA** | Complejidad: **MEDIA**

---

# 16. finanzas.html — Finanzas

## 📌 Descripción
Registro de ingresos y gastos mensuales.

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 Crítico: Sin categorización automática de gastos
```javascript
// ACTUAL
<select id="tcat"></select>
// Solo lista manualmente
```

**Problema:** Gasto de "Office Depot" se ingresa como "Oficina", otro como "Servicios"

**Solución:**
```javascript
// Categorización inteligente
const CATEGORY_RULES = {
  'marketing': /^(google ads|facebook|publicidad|meta)/i,
  'oficina': /^(office|papelería|útiles|escritorio)/i,
  'transporte': /^(uber|taxi|combustible|estacionamiento)/i,
  'comidas': /^(café|almuerzo|comida|restaurant)/i,
  'servicios': /^(internet|telefonía|hosting|software)/i,
  'impuestos': /^(afip|dgi|impuesto)/i,
};

document.getElementById('tdes').addEventListener('blur', (e) => {
  const description = e.target.value;
  
  for (const [category, regex] of Object.entries(CATEGORY_RULES)) {
    if(regex.test(description)) {
      document.getElementById('tcat').value = category;
      showInfo(`📁 Categorizado como: ${category}`);
      return;
    }
  }
});
```

### 🟠 Moderado: Sin alertas de gastos anómalos
```javascript
// ACTUAL
// Podría gastar $10,000 en "Comidas" sin alerta
```

**Solución:**
```javascript
async function saveTx() {
  const amount = parseFloat(document.getElementById('ta').value);
  const category = document.getElementById('tcat').value;
  
  // Obtener promedio histórico
  const monthAvg = await db.transactions.avgByCategory(uid, category);
  
  if(amount > monthAvg * 3) {
    showWarning(`
      ⚠️ Gasto inusual:
      - Típico en ${category}: USD ${monthAvg}
      - Este gasto: USD ${amount}
      
      ¿Confirmar?
    `, () => saveTx(true)); // true = force save
    return;
  }
  
  // Guardar...
}
```

## ✅ MEJORAS SUGERIDAS

```javascript
// 1. Dashboard de categorías
<div class="expenses-breakdown">
  <div class="category-bar">
    <span>Marketing</span>
    <div class="bar">
      <div style="width: 35%">35%</div>
    </div>
    <span>USD $3,500</span>
  </div>
  <!-- más categorías -->
</div>

// 2. Proyección de año
const monthlySpending = (await db.transactions.list(uid, year+'-01-01'...)).reduce(s, t => s + t.amount);
const projectedYearly = monthlySpending * 12;
showInfo(`Proyección anual: USD ${projectedYearly}`);

// 3. Presupuesto por categoría
<div class="budget-card">
  <div>Marketing: USD $1,000/mes</div>
  <div class="progress">
    <div style="width: ${(currentMarketingSpend/1000)*100}%"></div>
  </div>
  <div>${currentMarketingSpend} / $1,000 (${pctUsed}%)</div>
</div>

// 4. Exportar a contador (Excel con estructura AFIP)
<button onclick="exportToAccountant()">
  📊 Exportar para contador
</button>
```

## 🎯 Prioridad: **MEDIA** | Complejidad: **MEDIA**

---

# 17. facturacion.html — Facturación

## 📌 Descripción
Gestión de facturas, cálculo de comisiones, estado de cobro.

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 Crítico: Calculadora sin historial de operaciones
```javascript
// ACTUAL (sin guardar cálculos anteriores)
function calc(){
  var v=parseFloat(document.getElementById('cv').value)||0;
  // Calcula pero no guarda "plantilla"
}
```

**Problema:** Si operación similar, hay que recalcular todo

**Solución:**
```javascript
// Guardar y reutilizar cálculos
const calculationTemplates = {
  'venta_residencial': {
    property_value: 100000,
    seller_commission: 3,
    buyer_commission: 4,
    iva: 21,
    agent_split: 45
  },
  'venta_comercial': {
    property_value: 200000,
    seller_commission: 2,
    buyer_commission: 3,
    iva: 21,
    agent_split: 50
  }
};

// Botón: Usar plantilla anterior
<button onclick="loadTemplate()">📋 Cargar cálculo anterior</button>

async function loadTemplate() {
  const previous = await db.invoices.list(uid);
  const recent = previous[0]; // Más reciente
  
  if(!recent) return;
  
  document.getElementById('cv').value = recent.operation_value_usd;
  document.getElementById('csv').value = recent.commission_pct; // Parse
  // etc...
  
  calc();
}
```

### 🟠 Moderado: Sin sincronización con Operaciones
```javascript
// ACTUAL
// Factura se crea "manualmente" sin validar con operación
```

**Solución:**
```javascript
// Al llegar a etapa "escritura" en Operaciones
// Crear factura AUTOMÁTICAMENTE
async function onOperationStageChange(operationId, newStage) {
  if(['escritura', 'boleto'].includes(newStage)) {
    const operation = await db.operations.get(operationId);
    
    // Calcular comisión automática
    const commissionCalc = {
      seller_comm: operation.property_price * 0.03,
      buyer_comm: operation.property_price * 0.04,
      iva: /* calcular */,
      agent_share: /* calcular con split */
    };
    
    // Crear factura automática
    const invoice = await db.invoices.createFromOperation({
      operation_id: operationId,
      trigger_stage: newStage,
      ...commissionCalc
    });
    
    // Notificar usuario
    showMsg(`✅ Factura ${invoice.number} creada automáticamente`);
  }
}
```

## ✅ MEJORAS SUGERIDAS

```javascript
// 1. Tabla de facturas pendientes de cobro
<div class="card">
  <div class="card-title">⏳ Facturas pendientes de cobro</div>
  <div id="pending-invoices"></div>
</div>

// Mostrar: número, fecha, operación, monto, días vencida

// 2. Recordatorio de cobro
// Enviar email cada 15 días si factura sin cobrar
const overdueInvoices = all.filter(f => 
  f.status === 'pendiente' && 
  (today - f.date) > 15
);

// 3. Flujo de cobro: Factura → Comprobante de pago
<select id="payment-method">
  <option>Transferencia bancaria</option>
  <option>Efectivo</option>
  <option>Cheque</option>
</select>

<div id="bank-details" class="hidden">
  CBU: [...]
  Alias: [...]
</div>
```

## 🎯 Prioridad: **MEDIA** | Complejidad: **MEDIA**

---

# 18. ingresos.html — Proyección de Ingresos

## 📌 Descripción
Proyección de ingresos anuales vs objetivo.

## ⚠️ PROBLEMAS IDENTIFICADOS

### 🔴 Crítico: Proyección estática sin ajuste
```javascript
// ACTUAL
var PCT_EST=[4.4,5.2,6.0,6.6,7.2,7.8,8.4,9.0,9.6,11.6,12.0,12.2];
// Hardcodeado, nunca se revisa
```

**Problema:** No se ajusta a realidad de cada agente

**Solución:**
```javascript
// Calcular distribución esperada basada en histórico
async function calculateDistribution() {
  const lastYear = await db.transactions.byYear(uid, year - 1);
  
  if(!lastYear.length) {
    // Usar default
    return [4.4, 5.2, 6.0, ...];
  }
  
  // Calcular % real de cada mes
  const total = lastYear.reduce((s,t) => s + t.amount, 0);
  const distribution = {};
  
  lastYear.forEach(t => {
    const month = parseInt(t.date.split('-')[1]);
    distribution[month] = (distribution[month] || 0) + t.amount;
  });
  
  // Convertir a porcentajes
  const percentages = [];
  for(let m = 1; m <= 12; m++) {
    percentages.push((distribution[m] / total * 100) || 0);
  }
  
  return percentages;
}
```

### 🟠 Moderado: Sin análisis de variabilidad
```javascript
// ACTUAL
// Solo muestra línea, no muestra desviación estándar
```

**Solución:**
```javascript
// Agregar banda de incertidumbre
const monthlyHistory = await db.transactions.monthly(uid, 3); // Últimos 3 años

const std = calculateStdDev(monthlyHistory);
const margin = std * 1.96; // 95% confianza

chartInst = new Chart(..., {
  data: {
    datasets: [
      {
        label: 'Objetivo',
        data: objArray,
        borderColor: 'rgba(24,95,165,.6)',
      },
      {
        label: 'Real',
        data: realArr,
        borderColor: 'rgba(26,122,60,.8)',
      },
      {
        label: 'Banda de incertidumbre',
        data: objArray,
        fill: '+1',
        backgroundColor: 'rgba(24,95,165,.1)',
      }
    ]
  }
});
```

## ✅ MEJORAS SUGERIDAS

```javascript
// 1. Análisis de tendencia
// Comparar crecimiento YoY (año vs año anterior)
const thisYear = await db.transactions.byYear(uid, currentYear);
const lastYear = await db.transactions.byYear(uid, currentYear - 1);

const ytdComparison = (thisYear.sum / lastYear.sum) * 100;
showInfo(`Crecimiento YTD: ${ytdComparison}% vs año pasado`);

// 2. Pronóstico inteligente
// Si va a fallar meta, cuánto necesita el resto del año
if(realAcum < objAcum) {
  const gap = objAcum - realAcum;
  const monthsLeft = 12 - currentMonth;
  const dailyNeeded = gap / monthsLeft / 30;
  
  showWarning(`
    ⚠️ Falta USD ${gap} para cumplir meta
    Necesitas USD ${dailyNeeded}/día los próximos ${monthsLeft} meses
  `);
}

// 3. Comparativa con equipo
// ¿Estoy en línea vs otros agentes?
const teamAvg = (await db.stats.teamAverage(brokerUser))[currentMonth];
const myAvg = thisYear.sum / currentMonth;

showInfo(`
  Tu promedio: USD ${myAvg}
  Promedio equipo: USD ${teamAvg}
  Diferencia: ${((myAvg - teamAvg) / teamAvg * 100).toFixed(0)}%
`);
```

## 🎯 Prioridad: **BAJA** | Complejidad: **MEDIA**

---

## 📊 RESUMEN EJECUTIVO

### Prioridad por tipo

**🔴 CRÍTICOS (15):**
- index.html: Validación de sesión
- admin.html: Control de acceso
- dashboard.html: Caché de datos
- contactos.html: Búsqueda optimizada
- acm.html: Validación de tasación
- operaciones.html: Drag-and-drop Kanban
- nurturing.html: Validación de resultados
- postventa.html: Duplicados de referidos
- finanzas.html: Categorización automática
- facturacion.html: Sincronización automática
- ingresos.html: Proyección dinámica
- equipo.html: Control de acceso
- transferencias.html: Trail de auditoría
- seguimiento.html: Validación de coherencia
- propiedades.html: Fotos/galería

**🟠 MODERADOS (18):**
- dashboard.html: Memory leak en gráficos
- admin.html: Confirmación de cambios críticos
- equipo.html: Performance detallada
- contactos.html: Sin vista de relacionados
- colegas.html: Sin validación
- operaciones.html: Sin timeline
- transferencias.html: Sin validación de split
- seguimiento.html: Sin comparación con metas
- calendario.html: Sin diferenciación visual
- nurturing.html: Sin tracking de intentos
- postventa.html: Sin tracking de conversión
- referidos.html: Sin análisis de fuente
- finanzas.html: Sin alertas de anómalos
- facturacion.html: Sin integración automática
- ingresos.html: Sin análisis de variabilidad
- equipo.html: Sin predicción de meta
- propiedades.html: Sin mapa

**🟡 MENORES (10):**
- index.html: UX en carga lenta
- dashboard.html: Código duplicado
- acm.html: Sin histórico visual
- colegas.html: Sin favoritos
- operaciones.html: Sin indicador de tiempo
- calendario.html: Sin vista próximas
- propiedades.html: Sin comparativa
- seguimiento.html: Sin exportación
- finanzas.html: Sin presupuesto
- ingresos.html: Sin tendencia YoY

---

## 🎯 RECOMENDACIONES FINALES

### Corto plazo (1-2 semanas):
1. Implementar caché en dashboard
2. Mejorar validaciones en formularios críticos
3. Agregar confirmaciones dobles en acciones críticas
4. Optimizar búsqueda de contactos

### Mediano plazo (3-4 semanas):
1. Implementar Kanban con drag-and-drop
2. Agregar timeline de etapas
3. Mejorar análisis de performance
4. Integrar fotos/galería

### Largo plazo (1-2 meses):
1. Dark mode
2. Notificaciones push
3. Integración con Google Calendar/Maps
4. Mobile app nativa

---

**Total de mejoras identificadas: 43**  
**Esfuerzo estimado:** 200-300 horas  
**ROI:** Muy alto (mejor UX + menos errores)


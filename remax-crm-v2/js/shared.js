// ============================================================
// CONFIGURACIÓN SUPABASE
// ============================================================

const SUPABASE_URL = localStorage.getItem('sb_url') || 'https://kwwhwlkfepfemutqzfcs.supabase.co';
const SUPABASE_KEY = localStorage.getItem('sb_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3d2h3bGtmZXBmZW11dHF6ZmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDEwODkwMDAsImV4cCI6MjAxNjY2NTAwMH0.xxxxx';

// Crear cliente Supabase
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// FUNCIONES GLOBALES
// ============================================================

// Inicializar página
async function initPage(page) {
  try {
    // Verificar sesión
    const { data: { session } } = await sb.auth.getSession();
    
    if (!session) {
      window.location.href = '/html/index.html';
      return null;
    }

    // Obtener datos del usuario
    const { data: user, error } = await sb
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading user:', error);
    }

    // Renderizar sidebar
    await renderSidebar(user || session.user, page);

    return { user: user || session.user };
  } catch (err) {
    console.error('Init page error:', err);
    return null;
  }
}

// Toast notifications
function toast(message, type = 'info') {
  const id = 'toast-' + Date.now();
  const colors = {
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3'
  };

  const html = `
    <div id="${id}" style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 9999;
      animation: slideIn 0.3s ease;
    ">
      ${message}
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.remove();
  }, 3000);
}

// Renderizar sidebar
async function renderSidebar(user, current) {
  const sidebar = document.getElementById('sidebar-container');
  if (!sidebar) return;

  const modules = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'admin', icon: '⚙️', label: 'Admin' },
    { id: 'contactos', icon: '📇', label: 'Contactos' },
    { id: 'operaciones', icon: '🏠', label: 'Operaciones' },
    { id: 'seguimiento', icon: '📋', label: 'Seguimiento' },
    { id: 'finanzas', icon: '💰', label: 'Finanzas' },
    { id: 'facturacion', icon: '📄', label: 'Facturación' },
    { id: 'nurturing', icon: '🔄', label: 'Nurturing' },
    { id: 'postventa', icon: '❤️', label: 'Post-venta' },
    { id: 'propiedades', icon: '🏡', label: 'Propiedades' },
    { id: 'calendario', icon: '📅', label: 'Calendario' },
    { id: 'referidos', icon: '🤝', label: 'Referidos' },
    { id: 'colegas', icon: '👥', label: 'Colegas' },
  ];

  const links = modules
    .filter(m => current.includes(m.id) === false || true)
    .map(m => `
      <a href="/html/${m.id}.html" class="sidebar-link ${current.includes(m.id) ? 'active' : ''}">
        ${m.icon} ${m.label}
      </a>
    `)
    .join('');

  sidebar.innerHTML = `
    <div class="sidebar">
      <div class="sidebar-header">
        <h2>🏢 RE/MAX CRM</h2>
        <div class="user-info">
          ${user.name || user.email}
          <button onclick="logout()" style="margin-top: 10px; width: 100%; padding: 8px; background: #cc0000; color: white; border: none; border-radius: 4px; cursor: pointer;">Logout</button>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${links}
      </nav>
    </div>
  `;

  // Estilos sidebar
  if (!document.getElementById('sidebar-style')) {
    const style = document.createElement('style');
    style.id = 'sidebar-style';
    style.textContent = `
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        width: 250px;
        height: 100vh;
        background: #1a1a1a;
        color: white;
        padding: 20px;
        overflow-y: auto;
        z-index: 100;
      }
      .sidebar-header h2 {
        margin: 0 0 20px;
        font-size: 18px;
      }
      .user-info {
        background: #333;
        padding: 10px;
        border-radius: 4px;
        font-size: 12px;
        margin-bottom: 20px;
      }
      .sidebar-nav {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .sidebar-link {
        display: block;
        padding: 10px;
        color: #ddd;
        text-decoration: none;
        border-radius: 4px;
        transition: all 0.2s;
      }
      .sidebar-link:hover {
        background: #333;
        color: #fff;
      }
      .sidebar-link.active {
        background: #cc0000;
        color: white;
      }
      main.main {
        margin-left: 250px;
      }
    `;
    document.head.appendChild(style);
  }
}

// Logout
async function logout() {
  await sb.auth.signOut();
  window.location.href = '/html/index.html';
}

// ============================================================
// UTILIDADES DE FORMATO
// ============================================================

const fmt = {
  // Formato fecha
  date: (d) => new Date(d).toLocaleDateString('es-AR'),
  dateTime: (d) => new Date(d).toLocaleString('es-AR'),
  
  // Formato moneda
  usd: (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0 }),
  ars: (n) => '$' + n.toLocaleString('es-AR', { minimumFractionDigits: 0 }),
  
  // Formato porcentaje
  pct: (n) => (n * 100).toFixed(1) + '%',
  
  // Formato número
  num: (n) => n.toLocaleString('es-AR', { maximumFractionDigits: 0 }),
};

// ============================================================
// DATABASE HELPER (Mock / Real)
// ============================================================

const db = {
  // Contactos
  contacts: {
    list: async (userId) => {
      return await sb.from('contacts').select('*').eq('user_id', userId);
    },
    get: async (id) => {
      return await sb.from('contacts').select('*').eq('id', id).single();
    },
    insert: async (data) => {
      return await sb.from('contacts').insert([data]);
    },
    update: async (id, data) => {
      return await sb.from('contacts').update(data).eq('id', id);
    },
    delete: async (id) => {
      return await sb.from('contacts').delete().eq('id', id);
    },
  },

  // Operaciones
  operations: {
    list: async (userId) => {
      return await sb.from('operations').select('*').eq('user_id', userId);
    },
    get: async (id) => {
      return await sb.from('operations').select('*').eq('id', id).single();
    },
    insert: async (data) => {
      return await sb.from('operations').insert([data]);
    },
    update: async (id, data) => {
      return await sb.from('operations').update(data).eq('id', id);
    },
  },

  // Transacciones
  transactions: {
    list: async (userId) => {
      return await sb.from('transactions').select('*').eq('user_id', userId);
    },
    insert: async (data) => {
      return await sb.from('transactions').insert([data]);
    },
  },

  // Seguimiento
  tracking: {
    get: async (userId, year, week) => {
      return await sb
        .from('tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('year', year)
        .eq('week_number', week)
        .single();
    },
    upsert: async (data) => {
      return await sb.from('tracking').upsert([data]);
    },
    month: async (userId, year, month) => {
      return await sb
        .from('tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('year', year)
        .eq('month', month);
    },
  },

  // Usuarios
  users: {
    get: async (id) => {
      return await sb.from('users').select('*').eq('id', id).single();
    },
    list: async () => {
      return await sb.from('users').select('*');
    },
    update: async (id, data) => {
      return await sb.from('users').update(data).eq('id', id);
    },
  },
};

// ============================================================
// FUNCIONES ÚTILES
// ============================================================

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

function fd2(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-AR', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getISOWeek(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

function getWDates(year, week) {
  const jan4 = new Date(year, 0, 4);
  const mon = new Date(jan4);
  mon.setDate(jan4.getDate() - (jan4.getDay() + 6) % 7 + (week - 1) * 7);
  const dates = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

// Renderizar TC (topbar)
function renderTC() {
  const tc = document.getElementById('tc');
  if (!tc) return;

  tc.innerHTML = `
    <style>
      #tc {
        background: #cc0000;
        color: white;
        padding: 10px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        position: sticky;
        top: 0;
        z-index: 99;
      }
    </style>
    <div>USD/ARS: 
      <span id="tc-val" style="font-weight: bold;">
        <span style="animation: spin 1s linear infinite;">⏳</span>
      </span>
    </div>
  `;

  // Cargar TC (simulado)
  fetch('https://api.bluelytics.com.ar/v2/latest')
    .then(r => r.json())
    .then(d => {
      const blue = d.blue?.value_sell || 1000;
      document.getElementById('tc-val').textContent = Math.round(blue);
    })
    .catch(() => {
      document.getElementById('tc-val').textContent = '1000 (demo)';
    });
}

// Llamar renderTC al cargar
document.addEventListener('DOMContentLoaded', renderTC);

// ============================================================
// ESTILOS GLOBALES
// ============================================================

if (!document.getElementById('shared-style')) {
  const style = document.createElement('style');
  style.id = 'shared-style';
  style.textContent = `
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 0;
      background: #f5f5f5;
      color: #333;
    }

    .btn {
      padding: 8px 16px;
      background: #cc0000;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn:hover {
      background: #990000;
    }

    .btn-primary {
      background: #2196f3;
    }

    .btn-primary:hover {
      background: #1976d2;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #333;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    thead {
      background: #f5f5f5;
    }

    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    input[type="text"],
    input[type="email"],
    input[type="number"],
    input[type="date"],
    select,
    textarea {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
    }

    input:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: #cc0000;
      box-shadow: 0 0 0 3px rgba(204, 0, 0, 0.1);
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-size: 18px;
      color: #999;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
    }

    .kpi {
      background: white;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #cc0000;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .kpi-label {
      font-size: 12px;
      color: #999;
      margin-bottom: 5px;
    }

    .kpi-val {
      font-size: 24px;
      font-weight: 600;
      color: #cc0000;
    }

    .kpi-sub {
      font-size: 11px;
      color: #ccc;
      margin-top: 5px;
    }

    .gap-sm {
      display: flex;
      gap: 10px;
    }

    .tbl-wrap {
      overflow-x: auto;
    }

    .ph {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      background: white;
      padding: 20px;
      border-radius: 8px;
    }

    .ph-title {
      font-size: 20px;
      font-weight: 600;
    }

    .ph-sub {
      font-size: 12px;
      color: #999;
      margin-top: 5px;
    }
  `;
  document.head.appendChild(style);
}

console.log('✅ shared.js loaded');

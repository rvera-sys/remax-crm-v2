# 🧪 TEST LAB LOCAL — GUÍA RÁPIDA

**Archivo:** `TEST_LAB_LOCAL.html`  
**Tamaño:** Único archivo, 0 dependencias, funciona offline  
**Tiempo setup:** 30 segundos

---

## ⚡ CÓMO USAR

### Paso 1: Descargar
```
Descarga: TEST_LAB_LOCAL.html
```

### Paso 2: Abrir en navegador
```
Doble-click en TEST_LAB_LOCAL.html
O: arrastrar a navegador
O: http://localhost:8000/TEST_LAB_LOCAL.html (si tienes servidor)
```

### Paso 3: Probar
```
1. Selecciona un módulo (botones arriba)
2. Interactúa con los elementos
3. Anota qué funciona/no funciona
4. Copia la lista a un documento
```

---

## 📊 QUÉ VAS A VER

Cada módulo tiene:

```
✅ Mock data realista
✅ UI preview (cómo se vería)
✅ Botones interactivos (para ver qué sucede)
✅ Log de acciones (abajo)
✅ Problemas identificados (notas en rojo)
```

---

## 🎯 CHECKLIST POR MÓDULO

Abre cada uno y marca qué falta:

### Dashboard
- [ ] ¿Carga rápido? (sin caché → lento)
- [ ] ¿Gráfico funciona?
- [ ] ¿Botón "Actualizar" existe?
- [ ] ¿Muestra última actualización?

### Admin
- [ ] ¿Puedo cambiar rol fácilmente?
- [ ] ¿Pide confirmación al cambiar a Broker?
- [ ] ¿Muestra tabla de auditoría?

### Operaciones
- [ ] ¿Puedo arrastrar tarjetas (Kanban)?
- [ ] ¿Muestra días en cada etapa?
- [ ] ¿Hay timeline de movimientos?

### Contactos
- [ ] ¿Búsqueda es rápida? (sin debounce → lenta)
- [ ] ¿Muestra relacionados (operaciones, seguimientos)?
- [ ] ¿Hay vista timeline?

### Propiedades
- [ ] ¿Hay galería de fotos?
- [ ] ¿Hay mapa integrado?
- [ ] ¿Puedo ver comparativa de precios?

### Nurturing
- [ ] ¿Sugiere acciones según historial?
- [ ] ¿Valida qué resultado es válido para cada etapa?
- [ ] ¿Alerta si lleva mucho tiempo?

### Post-venta
- [ ] ¿Se puede pedir referido?
- [ ] ¿Evita duplicados de contactos?
- [ ] ¿Muestra tracking de conversión?

### Finanzas
- [ ] ¿Alerta si gasto es anómalo?
- [ ] ¿Categoriza automáticamente?
- [ ] ¿Hay presupuesto por categoría?

### Seguimiento
- [ ] ¿Valida coherencia? (ej: no más cierres que visitas)
- [ ] ¿Compara con metas?
- [ ] ¿Se puede exportar?

---

## 📝 TEMPLATE DE REPORTE

Copia y completa para cada módulo:

```
MÓDULO: [nombre]
ARCHIVO: [archivo.html]

✅ FUNCIONA:
  - Feature 1
  - Feature 2

❌ NO FUNCIONA / FALTA:
  - Feature A
  - Feature B

⚠️ LENTO/PROBLEMA:
  - Issue 1
  - Issue 2

💡 SUGERENCIA DE MEJORA:
  - [tu idea]

PRIORIDAD: ALTA / MEDIA / BAJA
COMPLEJIDAD: BAJA / MEDIA / ALTA
ESFUERZO: [X] horas
```

---

## 🔗 RELACIÓN CON ANÁLISIS

Cada "❌ NO FUNCIONA" que encuentres → corresponde a una mejora en `ANALISIS_MEJORAS_POR_MODULO.md`

Ejemplo:
```
❌ "No puedo arrastrar tarjetas en Kanban"
  ↓
✅ operaciones.html → Mejora #1 CRÍTICA: Implementar drag-and-drop
```

---

## 💾 EXPORTAR RESULTADOS

```
Al final, click en: 📥 Exportar resultados
→ Se descarga archivo .txt con tu análisis
→ Puedes compartirlo o guardar
```

---

## ✨ TIPS PARA AHORRAR TOKENS

### Lo que SÍ necesitas:
- Este TEST_LAB_LOCAL.html (único archivo)
- La guía de mejoras (para cotejar)

### Lo que NO necesitas:
- Descargar todos los HTML individuales
- Tener Supabase corriendo
- Servidor backend
- Node.js / Python / nada

### Ahorrar más tokens:
1. Haz testing rápido (5 min por módulo)
2. Anota solo lo importante
3. Usa template para reportar
4. Copia/pega mis sugerencias, no me pidas que las repita

---

## 🚀 WORKFLOW RECOMENDADO

```
MINUTO 0-5:
  Abre TEST_LAB_LOCAL.html
  Entiende cómo funciona

MINUTO 5-45:
  Prueba cada módulo (5 min cada uno)
  Marca qué funciona/no funciona
  Anota problemas

MINUTO 45-50:
  Compara con ANALISIS_MEJORAS_POR_MODULO.md
  ¿Coinciden mis hallazgos? ✓
  ¿Hay algo nuevo? 📝

MINUTO 50-55:
  Decide: ¿implementar? ¿descartar? ¿modificar?
  Prioriza top 3 mejoras

RESULTADO:
  Tienes decisión clara sin gastar tokens
```

---

## ❓ PREGUNTAS FRECUENTES

**¿Funciona sin internet?**  
✅ Sí, 100% offline. Todo está en un archivo HTML.

**¿Necesito cambiar algo?**  
❌ No, abre y usa. El mock data está integrado.

**¿Y si quiero agregar más contactos/operaciones?**  
Edita en el archivo `mockData` (arriba en el script). O me avisas y lo hago.

**¿Se ve igual que el real?**  
Aproximadamente. Es un preview. Lo importante es funcionalidad.

**¿Puedo probar el JavaScript real?**  
No en este lab (no hay Supabase). Pero con las notas, sabrás qué falta.

---

## 📊 EJEMPLO DE REPORTE

```
MÓDULO: Dashboard
ARCHIVO: dashboard.html

✅ FUNCIONA:
  - Muestra KPIs correctamente
  - Tabla de operaciones carga
  - Botones son visibles

❌ NO FUNCIONA / FALTA:
  - No hay botón "Actualizar"
  - No muestra "última actualización"
  - Gráfico no está integrado
  - Sin caché (cada refresh → lento)

⚠️ LENTO/PROBLEMA:
  - Simula 10+ queries sin caché
  - Memory leak potencial en gráfico

💡 SUGERENCIA DE MEJORA:
  - Agregar TTL cache de 5 min
  - Botón manual "Actualizar" visible
  - Timestamp de última carga

PRIORIDAD: ALTA
COMPLEJIDAD: MEDIA
ESFUERZO: 2 horas
```

---

## 🎁 BONUS: TESTING RÁPIDO

Preguntas quick para cada módulo:

1. **¿Qué acción es más frecuente?** → ¿Es fácil?
2. **¿Hay confirmaciones dobles innecesarias?**
3. **¿Falta feedback visual (spinner, toast)?**
4. **¿Hay búsqueda/filtro? ¿Es rápido?**
5. **¿Hay tablas? ¿Son legibles?**

---

**Listo. Abre `TEST_LAB_LOCAL.html` y comienza a probar.** 🚀


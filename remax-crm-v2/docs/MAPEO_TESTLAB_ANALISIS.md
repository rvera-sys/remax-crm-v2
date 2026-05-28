# 🗺️ MAPEO: TEST LAB ↔️ ANÁLISIS DE MEJORAS

**Encuentra un problema en el TEST LAB → Encuentra la mejora correspondiente aquí**

---

## DASHBOARD

### ❌ Problema que encontrarás:
- "No hay botón Actualizar"
- "No muestra cuándo se actualizó por última vez"
- "Aparenta ser lento"

### ✅ Mejora correspondiente:
**ANÁLISIS_MEJORAS_POR_MODULO.md → Sección 2 (dashboard.html)**

```
🔴 CRÍTICO: Falta de caché para datos
   Solución: Implementar TTL cache de 5 minutos

🟠 MODERADO: Gráfico sin destrucción
   Solución: Destruir gráfico antes de recrear

🟡 MENOR: Código duplicado (getISOWeek)
   Solución: Mover a shared.js
```

### 📌 Qué significa:
- Sin caché → cada recarga hace 10+ queries (lento)
- Con caché → reutiliza datos 5 min (rápido)

---

## ADMIN

### ❌ Problema que encontrarás:
- "Cambiar de Broker a Agente es fácil (peligroso)"
- "No hay confirmación doble"
- "No hay historial de quién cambió qué"

### ✅ Mejora correspondiente:
**ANÁLISIS_MEJORAS_POR_MODULO.md → Sección 3 (admin.html)**

```
🔴 CRÍTICO: Control de acceso débil (IDOR risk)
   Solución: Verificar en backend, no solo frontend

🔴 CRÍTICO: Sin confirmación en cambios críticos
   Solución: Doble confirmación para rol Broker

🟠 MODERADO: Sin validación de números
   Solución: Validar metas realistas vs histórico
```

### 📌 Qué significa:
- IDOR = puede acceder a datos de otro usuario
- Necesita backend validation (Supabase RPC)

---

## OPERACIONES

### ❌ Problema que encontrarás:
- "No puedo arrastrar tarjetas en Kanban"
- "No muestra cuántos días lleva en cada etapa"
- "No hay timeline de qué pasó"

### ✅ Mejora correspondiente:
**ANÁLISIS_MEJORAS_POR_MODULO.md → Sección 9 (operaciones.html)**

```
🔴 CRÍTICO: Vista Kanban sin persistencia
   Solución: HTML5 Drag & Drop API + guardar en DB

🟠 MODERADO: Sin timeline de etapas
   Solución: Mostrar operacion_stage_history

🟡 MENOR: Sin indicador de tiempo en etapa
   Solución: "Lleva X días aquí"
```

### 📌 Qué significa:
- Drag & drop = arrastrar tarjetas, cambiar orden/etapa
- Timeline = historial visual de movimientos

---

## CONTACTOS

### ❌ Problema que encontrarás:
- "Buscar es lento"
- "No veo operaciones del contacto en un lado"
- "No hay historial de comunicación"

### ✅ Mejora correspondiente:
**ANÁLISIS_MEJORAS_POR_MODULO.md → Sección 5 (contactos.html)**

```
🔴 CRÍTICO: Búsqueda sin optimización
   Solución: Full-text search en servidor + debounce

🟠 MODERADO: Sin vista de relacionados
   Solución: Tabs con operaciones + historial

🟡 MENOR: Sin sugerir acciones
   Solución: "Próximo toque: X fecha"
```

### 📌 Qué significa:
- Debounce = esperar 300ms antes de buscar
- Relacionados = mostrar todo sobre ese contacto

---

## PROPIEDADES

### ❌ Problema que encontrarás:
- "No hay fotos (0 imágenes)"
- "No hay mapa"
- "No puedo comparar precios"

### ✅ Mejora correspondiente:
**ANÁLISIS_MEJORAS_POR_MODULO.md → Sección 8 (propiedades.html)**

```
🔴 CRÍTICO: Sin fotos/galería
   Solución: Upload de imágenes + galería local

🟠 MODERADO: Sin mapa de propiedades
   Solución: Google Maps integration

🟡 MENOR: Sin comparativa visual
   Solución: Tooltip con "precio anterior"
```

### 📌 Qué significa:
- Galería = ver fotos sin salir del app
- Mapa = ubicar todas las propiedades en Buenos Aires

---

## FINANZAS

### ❌ Problema que encontrarás:
- "Gasto de $10,000 en comidas sin alerta"
- "No se categoriza automáticamente"
- "No hay presupuesto por categoría"

### ✅ Mejora correspondiente:
**ANÁLISIS_MEJORAS_POR_MODULO.md → Sección 16 (finanzas.html)**

```
🔴 CRÍTICO: Sin categorización automática
   Solución: Regex rules para categorizar por descripción

🟠 MODERADO: Sin alertas de anomalías
   Solución: Comparar vs promedio histórico

🟡 MENOR: Sin presupuesto
   Solución: Límite por categoría + barra de progreso
```

### 📌 Qué significa:
- Categorización automática = detecta "Office Depot" → "Oficina"
- Anomalía = gasto 3x el promedio → alerta

---

## NURTURING

### ❌ Problema que encontrarás:
- "No valida qué resultados son válidos para etapa"
- "No muestra historial de intentos"
- "No sugiere cambiar estrategia si no funciona"

### ✅ Mejora correspondiente:
**ANÁLISIS_MEJORAS_POR_MODULO.md → Sección 13 (nurturing.html)**

```
🔴 CRÍTICO: Sin validación de resultados
   Solución: Limitar opciones según etapa (7d→no_contesto, 90d→acepta)

🟠 MODERADO: Sin tracking de intentos
   Solución: Mostrar "3 intentos sin respuesta"

🟡 MENOR: Sin sugerencia inteligente
   Solución: "Prueba email en vez de teléfono"
```

### 📌 Qué significa:
- Validación = en etapa "7d" solo "no contestó" o "no quiere aún"
- Tracking = mostrar cuántos intentos ya hay

---

## POST-VENTA

### ❌ Problema que encontrarás:
- "Puedo crear mismo referido 2 veces"
- "No muestra si referido se convirtió en cliente"
- "No hay flujo de referido → operación → comisión"

### ✅ Mejora correspondiente:
**ANÁLISIS_MEJORAS_POR_MODULO.md → Sección 14 (postventa.html)**

```
🔴 CRÍTICO: Sin validación de referidos duplicados
   Solución: Buscar existentes antes de crear

🟠 MODERADO: Sin tracking de conversión
   Solución: Marcar "convertido" cuando referido cierra operación

🟡 MENOR: Sin flujo automático
   Solución: Referido → cliente activo → operación → comisión
```

### 📌 Qué significa:
- Dedup = evitar "Juan García" 2 veces en BD
- Conversión = referido cierra operación → gano comisión

---

## SEGUIMIENTO

### ❌ Problema que encontrarás:
- "Puedo ingresar 100 visitas pero 0 cierres (ilógico)"
- "No compara con meta del mes"
- "No se puede exportar a Excel"

### ✅ Mejora correspondiente:
**ANÁLISIS_MEJORAS_POR_MODULO.md → Sección 11 (seguimiento.html)**

```
🔴 CRÍTICO: Sin validación de coherencia
   Solución: visitas <= contactos, cierres <= visitas

🟠 MODERADO: Sin comparación con metas
   Solución: Mostrar "Falta 35 contactos para llegar a 100"

🟡 MENOR: Sin exportación
   Solución: Botón "Descargar Excel"
```

### 📌 Qué significa:
- Coherencia = números lógicos (no 100 cierres si solo 10 visitas)
- Meta = mostrar progreso visual vs objetivo

---

## FACTURACIÓN

### ❌ Problema que encontrarás:
- "Calcula factura pero no la vincula a operación"
- "No guarda cálculos anteriores (hay que rehacer)"
- "No muestra cuándo vence el cobro"

### ✅ Mejora correspondiente:
**ANÁLISIS_MEJORAS_POR_MODULO.md → Sección 17 (facturacion.html)**

```
🔴 CRÍTICO: Sin sincronización automática
   Solución: Al pasar operación a "escritura" → crear factura auto

🟠 MODERADO: Sin historial de cálculos
   Solución: Guardar plantillas + reutilizar

🟡 MENOR: Sin tabla de pendientes
   Solución: "Factura #123 vence en X días"
```

### 📌 Qué significa:
- Sincronización = operación finaliza → factura automática
- Plantillas = guardar cálculos para reutilizar

---

## INGRESOS

### ❌ Problema que encontrarás:
- "Proyección es estática (mismo % todos los años)"
- "No muestra si voy a cumplir meta"
- "No compara con año anterior"

### ✅ Mejora correspondiente:
**ANÁLISIS_MEJORAS_POR_MODULO.md → Sección 18 (ingresos.html)**

```
🔴 CRÍTICO: Proyección estática
   Solución: Calcular distribución basada en histórico

🟠 MODERADO: Sin análisis de tendencia
   Solución: Comparar con año anterior (YoY)

🟡 MENOR: Sin pronóstico
   Solución: "Necesitas USD X/día para cumplir meta"
```

### 📌 Qué significa:
- Proyección dinámica = ajustarse a tus patrones reales
- YoY = año vs año (crecimiento)

---

## RESUMEN RÁPIDO

| Módulo | Problema #1 | Mejora |
|--------|-------------|--------|
| Dashboard | Lentitud sin caché | 🔴 Caché TTL |
| Admin | IDOR risk | 🔴 Backend validation |
| Operaciones | Sin Kanban | 🔴 Drag & drop |
| Contactos | Búsqueda lenta | 🔴 Full-text search |
| Propiedades | Sin fotos | 🔴 Galería + mapa |
| Finanzas | Sin alertas | 🔴 Categorización auto |
| Nurturing | Validación débil | 🔴 Resultados x etapa |
| Post-venta | Duplicados | 🔴 Dedup + tracking |
| Seguimiento | Sin validación | 🔴 Coherencia números |
| Facturación | Sin sincronización | 🔴 Auto trigger |
| Ingresos | Proyección fija | 🔴 Dinámica histórico |

---

## 🎯 CÓMO USAR ESTE DOCUMENTO

1. **Prueba un módulo en TEST_LAB_LOCAL.html**
2. **Anota qué no funciona/falta**
3. **Busca el módulo en esta tabla**
4. **Lee la mejora correspondiente en ANÁLISIS_MEJORAS_POR_MODULO.md**
5. **Decide: ¿implemento? ¿descarto?**

---

**Resultado: Decisión informada con mínimos tokens** ✅


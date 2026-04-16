# Backlog Inicial - Mis Soles

## Fuentes revisadas

- `MisSoles_Stitch_Brief.md`
- `MisSoles_UI (1).html`
- `stitch_mis_soles_ui_ux_design (1).zip`
- `Mis_Soles_PRD_v1_2.docx`

## Sintesis de producto y UI

- App movil de finanzas personales para Peru, offline-first y sin login en el MVP.
- Stack objetivo: React Native + Expo, `expo-router`, `zustand`, `expo-sqlite`, Drizzle ORM y `date-fns`.
- Navegacion principal con 5 tabs: Inicio, Movimientos, Estadisticas, Obligaciones y Mas.
- FAB central sobre la tab bar, visible en Inicio y Movimientos, que abre un bottom sheet de alta rapida.
- Visual base confirmada en HTML y Stitch: header verde, tarjetas limpias, fondo claro `#F4F6F4`, tab bar `#FFFBF0`, jerarquia flat, bordes sutiles y mucho aire.
- Branding solicitado: `fullLogo.png` para splash, `logotype.png` para onboarding y `iconoSinLetras.png` para header in-app.
- Reglas de negocio criticas del PRD: doble moneda PEN/USD con tipo de cambio manual, deudas informales y pagos fijos como flujos de primera clase, montos en unidades menores, `scheduled_payment` separado de la transaccion real y comisiones de transferencia modeladas como movimiento independiente.

## Supuestos para este backlog

- El backlog esta orientado a MVP funcional + base tecnica escalable, no a una version final con nube.
- Se prioriza corte vertical por flujo de usuario antes que construir modulos aislados sin UI.
- El onboarding se implementa como flujo por pasos configurable.
- Nota: el brief habla de 4 pasos y una confirmacion final, mientras que una variante del Stitch concentra moneda, tipo de cambio y cuenta inicial en una sola pantalla. Por eso conviene modelar onboarding por configuracion y no hardcodear una unica estructura visual.

## Fuera de alcance inicial

- Login o registro.
- Sincronizacion cloud.
- Integracion bancaria.
- Push notifications.
- Exportacion de datos.
- Modo oscuro.

## Hitos recomendados

1. Hito A: Fundaciones, branding, router, SQLite/Drizzle, onboarding y shell de navegacion.
2. Hito B: Movimientos, cuentas e inicio con datos reales.
3. Hito C: Obligaciones, presupuestos, estadisticas y preferencias.
4. Hito D: Pulido, QA offline, migraciones y estabilizacion visual.

## Backlog por epica

### EP-01. Fundacion tecnica y design system

| ID | Pri | Talla | Item | Listo cuando |
| --- | --- | --- | --- | --- |
| MS-001 | P0 | M | Crear app Expo con `expo-router` y estructura de rutas base | Existe shell inicial con rutas `(tabs)` y stack para modales/subpantallas |
| MS-002 | P0 | M | Definir tokens de color, espaciado, radios y tipografia del proyecto | La UI usa la paleta oficial y no depende de colores hardcodeados dispersos |
| MS-003 | P0 | S | Configurar branding de assets | `fullLogo.png` en splash, `logotype.png` en onboarding y `iconoSinLetras.png` en header |
| MS-004 | P0 | M | Construir componentes base reutilizables | Hay `AppHeader`, `Screen`, `Card`, `Chip`, `MoneyText`, `PrimaryButton`, `BottomSheetLauncher` |
| MS-005 | P0 | M | Inicializar `expo-sqlite` + Drizzle + estrategia de migraciones | La app crea base local, corre migraciones y expone cliente listo para repositorios |
| MS-006 | P0 | M | Crear utilidades globales | Existen helpers para moneda, fechas, montos ocultos, colores de importe y periodos con `date-fns` |
| MS-007 | P0 | S | Montar stores globales con `zustand` | Hay estado para onboarding, filtros, preferencias de UI y visibilidad de montos |

### EP-02. Modelo de datos offline-first

| ID | Pri | Talla | Item | Listo cuando |
| --- | --- | --- | --- | --- |
| MS-008 | P0 | L | Diseñar schema Drizzle del MVP | Quedan modeladas tablas para settings, accounts, categories, transactions, debts, debt_payments, budgets y scheduled_payments |
| MS-009 | P0 | M | Definir enums y reglas de dominio | Existen tipos para expense, income, transfer, debt_payment, fee, monedas, frecuencias y estados |
| MS-010 | P0 | M | Sembrar datos base locales | Se crean categorias iniciales de gasto/ingreso alineadas al contexto peruano y preferencias por defecto |
| MS-011 | P1 | M | Implementar capa de repositorios y casos de uso | UI no escribe SQL directo y cada flujo usa servicios con reglas de negocio centralizadas |
| MS-012 | P1 | S | Preparar fixtures/demo seed para desarrollo | Se puede poblar la app con datos demo sin tocar manualmente SQLite |

### EP-03. App shell, splash y onboarding

| ID | Pri | Talla | Item | Listo cuando |
| --- | --- | --- | --- | --- |
| MS-013 | P0 | S | Implementar splash screen branded | La app abre con `fullLogo.png` y transiciona correctamente al flujo inicial |
| MS-014 | P0 | M | Crear route guard de primera ejecucion | Si no existe configuracion inicial, la app entra al onboarding; si ya existe, va a tabs |
| MS-015 | P0 | M | Construir onboarding stepper configurable | El flujo soporta 4 pasos logicos aunque luego el diseño fusione campos en menos pantallas |
| MS-016 | P0 | M | Capturar moneda principal y tipo de cambio manual | Se valida PEN/USD, se persiste la moneda principal y el tipo de cambio inicial |
| MS-017 | P0 | M | Registrar primera cuenta y saldo inicial | El onboarding crea una cuenta real y el saldo queda disponible para dashboard y movimientos |
| MS-018 | P1 | S | Agregar pantalla final de confirmacion/primer movimiento sugerido | El usuario puede cerrar onboarding con CTA claro y ver siguiente accion recomendada |

### EP-04. Navegacion principal y experiencia base

| ID | Pri | Talla | Item | Listo cuando |
| --- | --- | --- | --- | --- |
| MS-019 | P0 | M | Implementar bottom tabs custom | Las 5 tabs replican el patron visual del Stitch, incluida linea superior de tab activa |
| MS-020 | P0 | M | Montar FAB central contextual + bottom sheet | El FAB solo aparece en Inicio y Movimientos y abre opciones: Gasto, Ingreso, Transferencia, Deuda/Prestamo, Pago fijo |
| MS-021 | P0 | S | Crear estados vacios y confirmacion de borrado | Todas las pantallas del MVP tienen empty state y dialogo de confirmacion al eliminar |
| MS-022 | P1 | S | Adaptar safe areas, small screens y scroll containers | La UI funciona bien en dispositivos compactos y no rompe header, FAB o tab bar |

### EP-05. Cuentas, movimientos y dashboard

| ID | Pri | Talla | Item | Listo cuando |
| --- | --- | --- | --- | --- |
| MS-023 | P0 | M | Construir pantalla Inicio | Muestra header, balance hero, resumen mensual, salud financiera, proximas obligaciones y ultimas 5 transacciones |
| MS-024 | P0 | M | Crear CRUD basico de cuentas | El usuario puede ver cuentas, crear al menos efectivo/debito/credito y guardar moneda por cuenta |
| MS-025 | P0 | L | Implementar formulario de movimiento | Soporta gasto, ingreso y transferencia con monto, categoria, cuenta, nota y validaciones |
| MS-026 | P0 | M | Persistir impacto contable de movimientos | Cada movimiento afecta saldos de cuenta y se guarda con consistencia en SQLite |
| MS-027 | P1 | M | Implementar historial de movimientos | Incluye busqueda, filtros rapidos, agrupacion por fecha y acciones editar/eliminar |
| MS-028 | P1 | M | Implementar transferencias completas | Soporta origen/destino, cruce de moneda si aplica y comision separada tipo `fee` |
| MS-029 | P1 | S | Añadir vista de cuentas estilo Stitch | Tarjeta principal, cuentas secundarias y total consolidado con tipo de cambio visible |

### EP-06. Obligaciones: deudas y pagos fijos

| ID | Pri | Talla | Item | Listo cuando |
| --- | --- | --- | --- | --- |
| MS-030 | P0 | L | Construir pantalla Obligaciones | Muestra chips Deudas/Pagos fijos, secciones "Debo a otros", "Me deben" y proximos pagos fijos |
| MS-031 | P0 | M | Crear alta de deuda/prestamo informal | Guarda persona, direccion, monto original, pendiente, fecha de creacion y vencimiento opcional |
| MS-032 | P0 | M | Implementar abonos parciales y pago total | La app recalcula pendiente y estado tras cada abono y registra `debt_payment` como movimiento |
| MS-033 | P1 | M | Crear pagos fijos recurrentes | Soporta frecuencia, monto estimado, proxima fecha y visualizacion por urgencia |
| MS-034 | P1 | M | Marcar pago fijo como realizado | Al confirmar pago se genera movimiento real y siguiente vencimiento automaticamente |

### EP-07. Presupuestos y estadisticas

| ID | Pri | Talla | Item | Listo cuando |
| --- | --- | --- | --- | --- |
| MS-035 | P1 | M | Implementar presupuestos por categoria | El usuario define limite, periodo y ve progreso por color verde/dorado/rojo |
| MS-036 | P1 | S | Hacer configurable el umbral de alerta | El umbral por defecto es 80% y puede ajustarse desde preferencias o presupuesto |
| MS-037 | P1 | M | Construir pantalla Estadisticas | Incluye chips de periodo, tarjetas de resumen, donut por categoria y barras semanales |
| MS-038 | P2 | S | Integrar alertas de presupuesto en Inicio | El dashboard refleja categorias en riesgo o ya excedidas |

### EP-08. Mas, configuracion y pulido final

| ID | Pri | Talla | Item | Listo cuando |
| --- | --- | --- | --- | --- |
| MS-039 | P1 | M | Construir pantalla Mas/Configuracion | Replica tarjeta de perfil, secciones General, Preferencias y App |
| MS-040 | P1 | S | Implementar preferencia "Ocultar montos" | La app puede ofuscar montos de forma consistente en todas las vistas |
| MS-041 | P1 | S | Gestionar tipo de cambio desde ajustes | El usuario puede editarlo luego del onboarding y refrescar vistas derivadas |
| MS-042 | P2 | M | Crear gestion de categorias | Permite personalizar categorias manteniendo un set base local |
| MS-043 | P2 | S | Agregar seccion "Datos locales" segura | Permite limpiar demo/cache o reiniciar datos con confirmacion fuerte |
| MS-044 | P1 | M | QA funcional y visual del MVP | Se validan persistencia offline, migraciones, calculos monetarios, small screens y consistencia de UI |

## Orden recomendado de ejecucion

1. MS-001 a MS-007
2. MS-008 a MS-018
3. MS-019 a MS-029
4. MS-030 a MS-034
5. MS-035 a MS-044

## Corte sugerido para una primera demo funcional

- Splash + onboarding guardado localmente.
- Shell con tabs y branding final.
- Cuentas basicas.
- Alta de gasto, ingreso y transferencia.
- Home con balance y ultimos movimientos.
- Historial de movimientos.
- Obligaciones con alta de deuda y vista de proximos pagos.

## Riesgos a vigilar desde el inicio

- Diferencias entre brief y variantes Stitch en el onboarding pueden generar retrabajo si se codifica la UI demasiado rigida.
- Si no se modelan bien las unidades menores y las conversiones PEN/USD, luego sera costoso corregir calculos.
- Transferencias, deudas y pagos fijos comparten impactos contables; conviene centralizar esas reglas temprano.
- Si el tab shell, header y FAB no se vuelven componentes base desde el inicio, la UI se fragmentara rapido.

## Definicion de hecho para historias del MVP

- Persistencia local funcional.
- Copy en espanol.
- Empty state cuando no hay datos.
- Confirmacion antes de borrar.
- Colores de montos y urgencias segun reglas del brief.
- Diseno consistente con header verde, tarjetas limpias, tab bar crema y FAB central.

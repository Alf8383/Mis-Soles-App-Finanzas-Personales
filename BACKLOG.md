# Backlog - Mis Soles

## Fuentes revisadas

- `MisSoles_Stitch_Brief.md`
- `MisSoles_UI (1).html`
- `stitch_mis_soles_ui_ux_design (1).zip`
- `Mis_Soles_PRD_v1_2.docx`

## Sintesis de producto y UI

- App movil de finanzas personales para Peru con arquitectura **cloud-first** y acceso autenticado.
- Stack actual base: React Native + Expo, `expo-router`, `zustand`, `expo-sqlite`, Drizzle ORM y `date-fns`.
- Backend previsto: **Supabase** para autenticacion y persistencia remota.
- Metodo inicial de acceso: **email + contraseña**.
- Navegacion principal con 5 tabs: Inicio, Movimientos, Estadisticas, Obligaciones y Mas.
- FAB central sobre la tab bar, visible en Inicio y Movimientos, que abre un bottom sheet de alta rapida.
- Visual base confirmada en HTML y Stitch: header verde, tarjetas limpias, fondo claro `#F4F6F4`, tab bar `#FFFBF0`, jerarquia flat, bordes sutiles y mucho aire.
- Branding solicitado: `fullLogo.png` para splash, `logotype.png` para onboarding y `iconoSinLetras.png` para header in-app.
- Reglas de negocio criticas del PRD: doble moneda PEN/USD con tipo de cambio manual, deudas informales y pagos fijos como flujos de primera clase, montos en unidades menores, `scheduled_payment` separado de la transaccion real y comisiones de transferencia modeladas como movimiento independiente.

## Estado del backlog

- **EP-01 completado**: fundacion tecnica, theme, branding, shell base, utilidades, base local tecnica y stores iniciales.
- Antes de la integracion real con nube, se agregara una fase intermedia para construir las pantallas de **login** y **registro** sin logica backend aun.

## Supuestos para este backlog

- El producto se posiciona como **cloud-first** con login obligatorio.
- Supabase es el backend inicial planeado para auth y datos remotos.
- Las pantallas de auth entran primero como fase UI y navegacion, antes de integrar la logica real de autenticacion.
- La persistencia local construida en EP-01 se considera infraestructura de base, no la estrategia principal de largo plazo.
- El onboarding seguira existiendo, pero quedara **despues** del acceso autenticado.

## Fuera de alcance inicial

- Integracion bancaria.
- Push notifications.
- Exportacion de datos.
- Modo oscuro.
- OAuth social en la primera iteracion, salvo que se priorice despues.

## Hitos recomendados

1. Hito A: Fundaciones, branding, router, SQLite/Drizzle y shell base.
2. Hito B: Pantallas de acceso y flujo de navegacion pre-auth.
3. Hito C: Integracion cloud y autenticacion real.
4. Hito D: Modelo de datos financiero y onboarding autenticado.
5. Hito E: Dashboard, movimientos, obligaciones, estadisticas y configuracion.

## Backlog por epica

### EP-01. Fundacion tecnica y design system

Estado: completada

| ID | Pri | Talla | Item | Listo cuando |
| --- | --- | --- | --- | --- |
| MS-001 | P0 | M | Crear app Expo con `expo-router` y estructura de rutas base | Existe shell inicial con rutas `(tabs)` y stack para modales/subpantallas |
| MS-002 | P0 | M | Definir tokens de color, espaciado, radios y tipografia del proyecto | La UI usa la paleta oficial y no depende de colores hardcodeados dispersos |
| MS-003 | P0 | S | Configurar branding de assets | `fullLogo.png` en splash, `logotype.png` en onboarding y `iconoSinLetras.png` en header |
| MS-004 | P0 | M | Construir componentes base reutilizables | Hay `AppHeader`, `Screen`, `Card`, `Chip`, `MoneyText`, `PrimaryButton`, `BottomSheetLauncher` |
| MS-005 | P0 | M | Inicializar `expo-sqlite` + Drizzle + estrategia de migraciones | La app crea base local, corre migraciones y expone cliente listo para repositorios |
| MS-006 | P0 | M | Crear utilidades globales | Existen helpers para moneda, fechas, montos ocultos, colores de importe y periodos con `date-fns` |
| MS-007 | P0 | S | Montar stores globales con `zustand` | Hay estado para onboarding, filtros, preferencias de UI y visibilidad de montos |

### EP-01.5. Pantallas de acceso

| ID | Pri | Talla | Item | Listo cuando |
| --- | --- | --- | --- | --- |
| MS-008 | P0 | S | Crear grupo de rutas `app/(auth)` con layout propio | Existe un layout de auth separado del shell principal y listo para pantallas no autenticadas |
| MS-009 | P0 | M | Crear pantalla visual de login | La pantalla existe, navega bien, respeta branding/theme y no implementa backend aun |
| MS-010 | P0 | M | Crear pantalla visual de registro | La pantalla existe, navega bien, respeta branding/theme y no implementa backend aun |
| MS-011 | P0 | S | Diseñar CTA entre login y registro | El usuario puede ir de login a registro y volver sin romper el flujo |
| MS-012 | P0 | M | Ajustar ruta inicial y guards visuales | El entrypoint contempla un estado no autenticado mock y redirige al grupo auth por ahora |
| MS-013 | P0 | S | Reutilizar componentes base del EP-01 en auth | Las pantallas usan `Screen`, `Card`, botones y estilos del sistema ya creado |

### EP-02. Integracion cloud y autenticacion real

| ID | Pri | Talla | Item | Listo cuando |
| --- | --- | --- | --- | --- |
| MS-014 | P0 | M | Integrar cliente base de Supabase en la app | Existe configuracion base y cliente compartido para auth y datos |
| MS-015 | P0 | M | Implementar registro real con email y contraseña | El usuario puede crear cuenta contra Supabase Auth |
| MS-016 | P0 | M | Implementar login real con email y contraseña | El usuario puede iniciar sesion y recibir estado autenticado valido |
| MS-017 | P0 | M | Persistir y restaurar sesion | La app recuerda sesion y resuelve bootstrap autenticado vs no autenticado |
| MS-018 | P1 | S | Manejar logout y errores basicos de auth | La UX contempla credenciales invalidas, carga y cierre de sesion |
| MS-019 | P1 | S | Preparar estructura para futuras pantallas de recuperacion | Queda prevista la extension sin bloquear el MVP |

### EP-03. Modelo de datos cloud y onboarding autenticado

| ID | Pri | Talla | Item | Listo cuando |
| --- | --- | --- | --- | --- |
| MS-020 | P0 | L | Diseñar modelo de datos remoto del MVP | Quedan definidas entidades financieras ligadas al usuario autenticado |
| MS-021 | P0 | M | Definir enums y reglas de dominio para nube | Existen tipos para movimientos, monedas, deudas, presupuestos y pagos fijos |
| MS-022 | P0 | M | Construir onboarding autenticado | El onboarding ocurre despues del login y guarda configuracion ligada al usuario |
| MS-023 | P1 | M | Preparar seed y datos iniciales por usuario | El alta inicial crea los datos base necesarios para operar |

### EP-04. Navegacion principal y experiencia base autenticada

| ID | Pri | Talla | Item | Listo cuando |
| --- | --- | --- | --- | --- |
| MS-024 | P0 | M | Consolidar shell logged-in con tabs | Las 5 tabs operan dentro del estado autenticado |
| MS-025 | P0 | M | Implementar bottom tabs custom | Las tabs replican el patron visual del Stitch, incluida linea superior de tab activa |
| MS-026 | P0 | M | Montar FAB central contextual + bottom sheet | El FAB aparece en Inicio y Movimientos con opciones de alta rapida |
| MS-027 | P1 | S | Crear estados vacios y confirmacion de borrado | Todas las pantallas tienen empty state y confirmacion de acciones destructivas |
| MS-028 | P1 | S | Adaptar safe areas, small screens y scroll containers | La UI se mantiene estable en dispositivos compactos |

### EP-05. Cuentas, movimientos y dashboard

| ID | Pri | Talla | Item | Listo cuando |
| --- | --- | --- | --- | --- |
| MS-029 | P0 | M | Construir pantalla Inicio | Muestra header, balance hero, resumen mensual, salud financiera, proximas obligaciones y ultimas 5 transacciones |
| MS-030 | P0 | M | Crear CRUD de cuentas remoto | El usuario puede crear y consultar cuentas guardadas en nube |
| MS-031 | P0 | L | Implementar formulario de movimiento | Soporta gasto, ingreso y transferencia con validaciones y persistencia remota |
| MS-032 | P0 | M | Persistir impacto contable de movimientos | Cada movimiento afecta saldos de cuenta con consistencia |
| MS-033 | P1 | M | Implementar historial de movimientos | Incluye busqueda, filtros rapidos, agrupacion por fecha y acciones editar/eliminar |
| MS-034 | P1 | M | Implementar transferencias completas | Soporta origen/destino, cruce de moneda si aplica y comision separada tipo `fee` |
| MS-035 | P1 | S | Añadir vista de cuentas estilo Stitch | Tarjeta principal, cuentas secundarias y total consolidado con tipo de cambio visible |

### EP-06. Obligaciones, presupuestos y estadisticas

| ID | Pri | Talla | Item | Listo cuando |
| --- | --- | --- | --- | --- |
| MS-036 | P0 | L | Construir pantalla Obligaciones | Muestra chips Deudas/Pagos fijos, secciones "Debo a otros", "Me deben" y proximos pagos fijos |
| MS-037 | P0 | M | Crear alta de deuda/prestamo informal | Guarda persona, monto original, pendiente, fechas y direccion de la deuda |
| MS-038 | P0 | M | Implementar abonos parciales y pago total | La app recalcula pendiente y estado tras cada abono |
| MS-039 | P1 | M | Crear pagos fijos recurrentes | Soporta frecuencia, monto estimado, proxima fecha y visualizacion por urgencia |
| MS-040 | P1 | M | Marcar pago fijo como realizado | Al confirmar pago se genera movimiento real y siguiente vencimiento |
| MS-041 | P1 | M | Implementar presupuestos por categoria | El usuario define limite, periodo y ve progreso por color |
| MS-042 | P1 | S | Hacer configurable el umbral de alerta | El umbral por defecto es 80% y puede ajustarse |
| MS-043 | P1 | M | Construir pantalla Estadisticas | Incluye periodo, resumenes, donut por categoria y barras semanales |

### EP-07. Configuracion y pulido final

| ID | Pri | Talla | Item | Listo cuando |
| --- | --- | --- | --- | --- |
| MS-044 | P1 | M | Construir pantalla Mas/Configuracion | Replica tarjeta de perfil, secciones General, Preferencias y App |
| MS-045 | P1 | S | Implementar preferencia "Ocultar montos" | La app puede ofuscar montos de forma consistente |
| MS-046 | P1 | S | Gestionar tipo de cambio desde ajustes | El usuario puede editarlo y refrescar vistas derivadas |
| MS-047 | P2 | M | Crear gestion de categorias | Permite personalizar categorias manteniendo un set base |
| MS-048 | P2 | S | Agregar seccion de datos del usuario y estado de sesion | La app expone informacion minima de cuenta y sesion activa |
| MS-049 | P1 | M | QA funcional y visual del MVP cloud-first | Se validan auth, navegacion, datos remotos, small screens y consistencia de UI |

## Orden recomendado de ejecucion

1. MS-001 a MS-007
2. MS-008 a MS-013
3. MS-014 a MS-019
4. MS-020 a MS-028
5. MS-029 a MS-043
6. MS-044 a MS-049

## Corte sugerido para una primera demo funcional

- Splash y shell base.
- Pantallas de login y registro navegables.
- Integracion real con login y registro por email/contraseña.
- Sesion persistente.
- Onboarding autenticado.
- Primera cuenta creada y datos basicos remotos.

## Riesgos a vigilar desde el inicio

- Si no se separa bien la fase de auth visual de la auth real, se puede mezclar UI mock con contratos de backend inestables.
- El cambio de local-first a cloud-first obliga a revisar rutas, bootstrap y manejo de estados de carga.
- Si el modelo multiusuario no se define temprano, luego sera costoso adaptar cuentas, movimientos y obligaciones.
- La experiencia entre estado no autenticado, autenticado y onboarding debe quedar muy clara para evitar loops de navegacion.

## Definicion de hecho para historias del MVP

- La documentacion refleja cloud-first y login obligatorio.
- El flujo logged-out y logged-in esta claramente separado en UX.
- Las pantallas de auth visual existen antes de la integracion backend.
- La autenticacion real maneja sesiones validas y errores basicos.
- Los datos financieros quedan asociados a una cuenta autenticada.
- El diseño sigue consistente con header verde, tarjetas limpias, tab bar crema y FAB central.

# Mis Soles - Design Brief para Stitch

## Objetivo

Diseñar la app móvil **Mis Soles**, una app de finanzas personales para Perú. La app permite registrar ingresos, gastos, transferencias, deudas informales, pagos fijos recurrentes, presupuestos, cuentas y categorías.

El producto actual es **cloud-first**:

- Tiene login y registro.
- Usa Firebase Authentication.
- Guarda datos financieros en Firestore bajo una cuenta autenticada.
- Cada usuario ve solo sus propios datos.

El objetivo de Stitch es generar pantallas móviles realistas, consistentes y listas para implementarse en React Native + Expo. El diseño debe seguir este brief como fuente principal, no una landing page ni un dashboard web.

## Formato de Diseño

- Plataforma: mobile app.
- Tamaño base: `375 x 812`.
- Estilo: app nativa iOS/Android.
- Idioma: español.
- Tema: claro.
- Moneda principal: soles peruanos `S/`.
- Moneda secundaria: dólares `US$`.
- No incluir modo oscuro.
- No diseñar versión web.

## Personalidad Visual

La app debe sentirse:

- Limpia.
- Cálida.
- Peruana sin ser folclórica.
- Financiera pero cercana.
- Compacta pero con suficiente aire.
- Fácil de leer en móvil.
- Fiel al sistema visual definido en este brief.

Evitar:

- Estética bancaria fría.
- Fondos morados o azules genéricos.
- Glassmorphism excesivo.
- Sombras pesadas.
- Cards gigantes sin necesidad.
- Layouts web.
- Rediseñar la identidad visual.

## Paleta de Colores

Usar exactamente esta paleta:

| Token | Color | Uso |
| --- | --- | --- |
| Verde primario | `#0F6E56` | Header, FAB, botones, tab activa |
| Verde medio | `#1D9E75` | Ingresos, estados positivos |
| Verde claro | `#E1F5EE` | Fondos suaves positivos |
| Dorado | `#EF9F27` | Acentos, alertas, avatar |
| Dorado claro | `#FAEEDA` | Fondos suaves dorados |
| Dorado oscuro | `#BA7517` | Texto sobre dorado claro |
| Rojo | `#E24B4A` | Gastos, errores, límites |
| Rojo claro | `#FCEBEB` | Fondos suaves rojos |
| Azul | `#378ADD` | Transferencias |
| Azul claro | `#EBF4FF` | Fondos suaves azules |
| Fondo general | `#F4F6F4` | Fondo de app |
| Tarjetas | `#FFFFFF` | Cards y superficies |
| Texto primario | `#111827` | Títulos y contenido principal |
| Texto secundario | `#6B7280` | Descripciones |
| Texto terciario | `#9CA3AF` | Metadata e inactivos |
| Tab bar | `#FFFBF0` | Bottom navigation |
| Borde | `rgba(0,0,0,0.07)` | Bordes sutiles |

## Tipografía

Usar **Plus Jakarta Sans** para mantener una apariencia moderna, compacta y cercana.

Jerarquía:

| Elemento | Tamaño aproximado | Peso |
| --- | --- | --- |
| Balance principal | `34-40px` | `800` |
| Monto grande en formularios | `48-52px` | `800` |
| Título de pantalla | `17-20px` | `700-800` |
| Título de sección | `14px` | `700` |
| Texto de row/card | `13-14px` | `500-600` |
| Metadata | `10-12px` | `500-600` |
| Labels de tab bar | `9-10px` | `600` |

No usar bold extremo en todo. Reservar peso `800` para balances, montos y títulos importantes.

## Branding

Usar assets existentes:

- Splash: `fullLogo.png`.
- Login, registro y onboarding: `logotype.png`.
- Header in-app: `iconoSinLetras.png`.

Reglas:

- No rediseñar el logo.
- No cambiar colores del logo.
- No crear isotipos alternativos.
- No usar íconos genéricos en lugar del logo.

## Navegación

### Rutas sin tab bar

Estas pantallas no deben mostrar bottom tab bar:

- Splash.
- Login.
- Registro.
- Onboarding.

### Rutas con tab bar

La app autenticada tiene 5 tabs:

1. Inicio.
2. Movimientos.
3. Estadísticas.
4. Obligaciones.
5. Más.

La bottom tab bar debe tener:

- Fondo `#FFFBF0`.
- Alto aproximado `72px`.
- Borde superior dorado suave.
- Icono + label.
- Tab activa en verde primario.
- Línea superior verde de `22px x 2px` encima del icono activo.

### FAB

Debe existir un botón flotante circular `+`:

- Tamaño `52px`.
- Fondo `#0F6E56`.
- Icono blanco.
- Centrado sobre la tab bar.
- Visible solo en `Inicio` y `Movimientos`.
- Abre bottom sheet con acciones rápidas:
  - Gasto.
  - Ingreso.
  - Transferencia.
  - Deuda/Préstamo.
  - Pago fijo.

## Componentes Base

### Header In-App

- Fondo verde `#0F6E56`.
- Logo pequeño a la izquierda.
- Título blanco.
- Subtítulo blanco con opacidad.
- Avatar circular dorado opcional a la derecha.
- Altura compacta, con densidad visual de app móvil real.

Ejemplo:

```text
Inicio
Tu resumen financiero
```

### Cards

- Fondo `#FFFFFF`.
- Radio `12-18px`.
- Borde `0.5px solid rgba(0,0,0,0.07)`.
- Sombra mínima o inexistente.
- Padding `12-16px`.
- No usar cards gigantes si el contenido es simple.

### Rows

Para listas de movimientos, obligaciones, cuentas y categorías:

- Usar rows compactos.
- Ícono circular o emoji a la izquierda.
- Nombre y metadata al centro.
- Monto o acción a la derecha.
- Evitar separadores muy oscuros.

### Chips

Estados:

- Activo: fondo verde, texto blanco.
- Inactivo: fondo blanco, texto gris, borde sutil.
- Dorado: fondo `#FAEEDA`, texto `#BA7517`.
- Rojo: fondo `#FCEBEB`, texto `#E24B4A`.
- Verde suave: fondo `#E1F5EE`, texto `#0F6E56`.

### Inputs

- Fondo `#EAECE8` o blanco.
- Radio `10px`.
- Borde sutil.
- Label pequeño arriba.
- Placeholder gris.
- Formularios compactos, no bancarios ni pesados.

### Montos

- Gastos: rojo `#E24B4A`.
- Ingresos: verde medio `#1D9E75`.
- Transferencias: azul `#378ADD`.
- Balance principal: blanco sobre hero verde.
- Cuentas PEN muestran `S/`.
- Cuentas USD muestran `US$` o `$`.

## Pantallas Requeridas

### 1. Splash

Debe mostrar:

- `fullLogo.png`.
- Fondo blanco o claro.
- Composición limpia.

### 2. Login

Debe mostrar:

- Logo `logotype.png`.
- Título: `Inicia sesión`.
- Subtítulo: `Accede a tu cuenta de Mis Soles`.
- Campo email.
- Campo contraseña.
- Botón principal: `Ingresar`.
- CTA: `¿No tienes cuenta? Crear cuenta`.

Estilo:

- Fondo `#F4F6F4`.
- Card blanca para formulario.
- Botón verde.
- Sin tab bar.

### 3. Registro

Debe mostrar:

- Logo `logotype.png`.
- Título: `Crea tu cuenta`.
- Campo email.
- Campo contraseña.
- Campo confirmar contraseña.
- Botón principal: `Crear cuenta`.
- CTA: `¿Ya tienes cuenta? Inicia sesión`.
- Sin tab bar.

### 4. Onboarding

Debe mostrar:

- Logo `logotype.png`.
- Título: `Configura Mis Soles`.
- Selección de moneda principal: `PEN / USD`.
- Tipo de cambio manual.
- Nombre de cuenta inicial.
- Saldo inicial.
- Botón: `Empezar`.
- Sin tab bar.

### 5. Inicio

Debe incluir:

- Header verde con logo y avatar.
- Tarjeta hero de balance total.
- Resumen mensual.
- Indicador de salud financiera.
- Próximas obligaciones.
- Últimas 5 transacciones.
- FAB central.

Balance hero:

- Label: `Balance total`.
- Monto grande: `S/ 1,524.00`.
- Dos columnas: `Ingresos` y `Gastos`.
- Health pill: `Salud financiera: ahorro 32%`.

Rows de movimiento:

- Emoji o icono de categoría.
- Descripción.
- Fecha/categoría.
- Monto a la derecha.

### 6. Movimientos

Debe incluir:

- Header verde.
- Barra de búsqueda.
- Botón de filtro.
- Chips rápidos: `Todo`, `Gastos`, `Ingresos`, `Este mes`.
- Historial agrupado por fecha: `Hoy`, `Ayer`, `12 mayo`.
- FAB central.

Cada row:

- Ícono emoji de categoría.
- Nombre.
- Subcategoría o tipo.
- Monto con color según tipo.
- Acciones de editar/eliminar pueden representarse como swipe o menú contextual.

### 7. Nuevo Movimiento

Diseñar como modal o subpantalla de alta rápida.

Variantes:

- Gasto.
- Ingreso.
- Transferencia.
- Deuda/Préstamo.
- Pago fijo.

Para Gasto/Ingreso:

- Selector tipo tabs: `Gasto`, `Ingreso`, `Transferencia`.
- Monto grande centrado.
- Grilla de categorías `4x2` con emojis.
- Cuenta.
- Nota.
- Botón guardar.

Para Transferencia:

- Cuenta origen.
- Cuenta destino.
- Monto.
- Tipo de cambio si aplica.
- Comisión opcional.
- Botón guardar.

Para Deuda:

- Persona.
- Dirección: `Yo debo` / `Me deben`.
- Monto.
- Moneda.
- Fecha opcional.
- Nota.
- Botón guardar deuda.

Para Pago fijo:

- Nombre.
- Monto.
- Cuenta.
- Categoría.
- Frecuencia.
- Próximo vencimiento.
- Botón guardar pago fijo.

### 8. Cuentas

Debe incluir:

- Header verde o modal header.
- Tarjeta principal verde.
- Tarjetas secundarias blancas.
- Cada tarjeta muestra nombre, saldo, tipo y moneda.
- Fila de total consolidado con tipo de cambio y fecha de actualización.
- Formulario compacto para crear/editar cuenta.

### 9. Obligaciones

Debe incluir chips:

- Deudas.
- Pagos fijos.
- Presupuestos.

#### Deudas

Secciones:

- `Debo a otros`.
- `Me deben`.

Card deuda:

- Persona.
- Monto pendiente.
- Monto original.
- Barra de progreso.
- Fecha de vencimiento.
- Acciones: `Abonar`, `Pago total`, `Archivar`.

#### Pagos fijos

Rows:

- Dot de color por urgencia.
- Nombre.
- Frecuencia.
- Próxima fecha.
- Monto.
- Acción `Marcar pagado`.

#### Presupuestos

Cards:

- Ícono.
- Nombre de categoría.
- Barra de progreso.
- Monto usado / límite.
- Periodo.

Color de barra:

- Verde si está bajo 80%.
- Dorado si llega a 80%.
- Rojo si supera 95%.

### 10. Estadísticas

Debe incluir:

- Header verde.
- Chips de periodo: `Este mes`, `Semana`, `Mes anterior`, `Rango`.
- Cards resumen: `Ingresos`, `Gastos`, `Neto`.
- Donut de gastos por categoría con leyenda.
- Barras semanales verdes.

No usar gráficos complejos. Debe verse implementable con vistas nativas.

### 11. Más / Configuración

Debe incluir:

- Header verde.
- Card de perfil con avatar, email, UID corto y estado Firebase.
- Moneda principal.
- Tipo de cambio actual.

Secciones:

- General: `Cuentas`, `Categorías`, `Presupuestos`.
- Preferencias: `Tipo de cambio`, `Ocultar montos`.
- App y sesión: `Estado de sesión`, `Cerrar sesión`.

Debe quedar claro que la app usa cuenta y nube.

### 12. Categorías

Debe incluir:

- Lista de categorías de gasto.
- Lista de categorías de ingreso.
- Crear categoría.
- Editar categoría.
- Archivar categoría personalizada.

Las categorías base deben verse protegidas o marcadas como:

```text
Base de Mis Soles
```

## Categorías Demo

### Gastos

- 🛒 Mercado.
- 🏪 Bodega.
- 🚌 Transporte.
- 🏍️ Mototaxi.
- 🍽️ Comida.
- ❤️ Salud.
- 📚 Educación.
- 🎮 Entretenimiento.
- 💡 Servicios.
- 👕 Ropa.
- 📦 Otros.

### Ingresos

- 💼 Sueldo.
- 🏠 Propina familiar.
- 💻 Freelance.
- 🏬 Negocio.
- 📦 Otros.

## Datos Demo Sugeridos

```text
Balance total: S/ 1,524.00
Ingresos: S/ 3,200.00
Gastos: S/ 1,676.00

Movimientos:
- Mercado de Surquillo · Comida · -S/ 84.50
- Yape recibido · Ingresos · +S/ 120.00
- Metropolitano · Transporte · -S/ 3.50
- Transferencia a ahorros · Transferencia · S/ 300.00

Obligaciones:
- Internet · Pago fijo · S/ 120.00 · 25 mayo
- Ana · Me debe · S/ 80.00
- Carlos · Yo debo · S/ 150.00

Cuentas:
- Billetera · Efectivo · S/ 320.00
- BCP Sueldo · Banco · S/ 1,204.00
- Ahorros USD · Ahorro · US$ 140.00
```

## Reglas de UX Importantes

- Los montos negativos siempre en rojo.
- Los montos positivos siempre en verde medio.
- Las transferencias siempre en azul.
- Las alertas de presupuesto al 80% en dorado.
- Los vencimientos inminentes, menos de 2 días, en rojo.
- Cuentas con saldo USD muestran `US$` o `$`.
- Cuentas con saldo PEN muestran `S/`.
- Login, registro y onboarding no tienen bottom tab bar.
- Tabs autenticadas sí tienen bottom tab bar.
- Estados vacíos deben tener mensaje y CTA.
- Confirmar antes de eliminar o archivar cualquier registro.

## Lo que la App No Tiene

- Integración bancaria.
- Notificaciones push.
- Exportación de datos en esta versión.
- Modo oscuro.
- OAuth social.
- Dashboard web.

## Criterio de Éxito

El diseño será correcto si:

- Se reconoce claramente como Mis Soles.
- Se parece al sistema visual definido en este brief.
- Todas las pantallas comparten el mismo sistema visual.
- La app se siente móvil, no web.
- La UI es implementable en React Native + Expo.
- No se inventan estilos fuera de la paleta.
- No contradice el producto actual cloud-first.
- Login, registro y sesión están presentes.
- El diseño no se aleja hacia otra dirección visual.

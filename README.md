# Mis Soles

Aplicacion movil de finanzas personales para Peru, construida con React Native + Expo y orientada a una arquitectura **cloud-first** con acceso autenticado.

## Vision actual del producto

Mis Soles ya no se plantea como un MVP sin cuenta ni sin nube. La direccion actual del producto es:

- login obligatorio
- registro de usuario
- backend inicial en Supabase
- datos financieros asociados a una cuenta autenticada
- nube como fuente de verdad prevista

Antes de conectar la autenticacion real con backend, el proyecto incorporara una fase intermedia para construir las pantallas de **login** y **registro** como experiencia visual lista para conectarse despues.

## Stack actual y objetivo

Base ya implementada:

- React Native
- Expo
- Expo Router
- Zustand
- Expo SQLite
- Drizzle ORM
- date-fns

Arquitectura prevista para la siguiente fase:

- Supabase Auth para email y contraseña
- Supabase Postgres como base remota principal
- sesiones de usuario persistentes
- datos del usuario ligados a identidad autenticada

Nota importante:
La persistencia local actual pertenece a la base tecnica ya construida en EP-01. No representa la vision final del producto como fuente principal de datos.

## Estado actual

El proyecto ya incluye la base del **EP-01**:

- scaffold Expo con `expo-router`
- sistema de theme y tokens visuales
- branding conectado para splash, onboarding y header
- componentes base reutilizables
- utilidades globales de moneda, fechas y periodos
- SQLite local + Drizzle con migracion tecnica inicial
- stores globales con Zustand para onboarding, filtros y preferencias de UI

Lo siguiente en la hoja de ruta es:

1. pantallas de login y registro
2. integracion real de auth con Supabase
3. modelo de datos cloud
4. onboarding autenticado y features financieras

## Scripts

```bash
npm start
npm run android
npm run ios
npm run web
```

## Estructura principal

```text
app/
  (tabs)/
  (onboarding)/
  (modals)/
  (auth)/        # previsto para la siguiente fase visual
src/
  components/
  constants/
  lib/
    db/
    utils/
  providers/
  stores/
  theme/
assets/
  images/
    branding/
```

## Primer arranque

1. Instala dependencias:

```bash
npm install --legacy-peer-deps
```

2. Inicia Expo:

```bash
npm start
```

## Arquitectura prevista

La arquitectura objetivo del producto se documenta asi:

- autenticacion por email y contraseña
- sesiones persistentes por usuario
- datos financieros vinculados a la cuenta autenticada
- backend inicial en Supabase
- nube como fuente de verdad prevista

La base local actual puede mantenerse mas adelante como soporte tecnico o cache, pero no debe leerse como la estrategia final del producto.

## Branding

Los assets activos viven en:

- `assets/images/branding/fullLogo.png`
- `assets/images/branding/logotype.png`
- `assets/images/branding/iconoSinLetras.png`

## Roadmap inmediato

- EP-01 completado: fundaciones, shell y design system
- EP-01.5: pantallas visuales de login y registro
- EP-02: integracion de autenticacion real con Supabase
- EP-03: modelo de datos cloud y onboarding autenticado
- EP-04+: dashboard, movimientos, obligaciones, estadisticas y configuracion

## Referencias del proyecto

- `BACKLOG.md`
- brief de Stitch y assets de marca usados para la base visual del producto

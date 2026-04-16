# Mis Soles

Aplicacion movil de finanzas personales para Peru, construida con React Native + Expo.

## Stack

- React Native
- Expo
- Expo Router
- Zustand
- Expo SQLite
- Drizzle ORM
- date-fns

## Estado actual

El proyecto ya incluye la base del EP-01:

- scaffold Expo con `expo-router`
- sistema de theme y tokens visuales
- branding conectado para splash, onboarding y header
- componentes base reutilizables
- utilidades globales de moneda, fechas y periodos
- SQLite local + Drizzle con migracion tecnica inicial
- stores globales con Zustand para onboarding, filtros y preferencias de UI

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

## Persistencia local

La app usa `expo-sqlite` como base local y Drizzle como capa ORM. En esta fase se inicializa una tabla tecnica `app_meta` para validar el runtime y el arranque de migraciones.

## Branding

Los assets activos viven en:

- `assets/images/branding/fullLogo.png`
- `assets/images/branding/logotype.png`
- `assets/images/branding/iconoSinLetras.png`

## Roadmap inmediato

- EP-02: schema funcional de cuentas, transacciones, deudas, presupuestos y pagos fijos
- EP-03: onboarding real y shell de navegacion mas cercano al Stitch
- EP-04+: dashboard, movimientos, obligaciones, estadisticas y configuracion

## Referencias del proyecto

- `BACKLOG_INICIAL_MIS_SOLES.md`
- brief de Stitch y assets de marca usados para la base visual del producto

# Mis Soles

Aplicacion movil de finanzas personales para Peru, construida con React Native + Expo y orientada a una arquitectura **cloud-first** con acceso autenticado.

## Vision actual del producto

Mis Soles ya no se plantea como un MVP sin cuenta ni sin nube. La direccion actual del producto es:

- login obligatorio
- registro de usuario
- backend inicial en Firebase
- datos financieros asociados a una cuenta autenticada
- nube como fuente de verdad prevista

La autenticacion real con Firebase ya esta conectada a nivel de codigo. Para probarla contra un proyecto real, falta configurar las variables locales de Firebase en `.env`.

## Stack actual y objetivo

Base implementada:

- React Native
- Expo
- Expo Router
- Zustand
- Expo SQLite
- Drizzle ORM
- date-fns
- Firebase Authentication
- Firebase Firestore inicializado

Arquitectura cloud actual:

- Firebase Authentication para email y contraseña
- Firebase Firestore como base remota principal prevista para datos financieros
- sesiones de usuario persistentes
- datos del usuario ligados a identidad autenticada

Nota importante:
La persistencia local actual pertenece a la base tecnica ya construida en EP-01. No representa la vision final del producto como fuente principal de datos.

## Estado actual

El proyecto ya incluye:

- **EP-01 completado**: scaffold Expo, `expo-router`, theme, branding, componentes base, utilidades, SQLite local + Drizzle y stores iniciales.
- **EP-01.5 completado**: pantallas de login y registro, validaciones visuales, navegacion auth y guards.
- **EP-02 completado a nivel tecnico**: Firebase JS SDK, Firebase Auth real, restauracion de sesion, logout real, errores basicos y Firestore inicializado para la siguiente etapa.

Pendiente para probar EP-02 contra backend real:

- crear un proyecto Firebase
- habilitar Authentication con email y contraseña
- crear `.env` local usando `.env.example`
- colocar las variables `EXPO_PUBLIC_FIREBASE_*`

Lo siguiente en la hoja de ruta es:

1. modelo de datos cloud en Firestore
2. onboarding autenticado
3. primeras entidades financieras remotas
4. dashboard, movimientos, obligaciones y estadisticas

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
  (auth)/        # pantallas de login y registro
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

2. Configura Firebase si quieres probar login/registro reales:

```bash
cp .env.example .env
```

Completa el `.env` con los valores de tu proyecto Firebase.

3. Inicia Expo:

```bash
npm start
```

## Arquitectura prevista

La arquitectura objetivo del producto se documenta asi:

- autenticacion por email y contraseña
- sesiones persistentes por usuario
- datos financieros vinculados a la cuenta autenticada
- backend inicial en Firebase
- nube como fuente de verdad prevista

La base local actual puede mantenerse mas adelante como soporte tecnico o cache, pero no debe leerse como la estrategia final del producto.

## Branding

Los assets activos viven en:

- `assets/images/branding/fullLogo.png`
- `assets/images/branding/logotype.png`
- `assets/images/branding/iconoSinLetras.png`

## Roadmap inmediato

- EP-01 completado: fundaciones, shell y design system
- EP-01.5 completado: pantallas visuales de login y registro
- EP-02 completado: integracion de autenticacion real con Firebase
- EP-03 siguiente: modelo de datos cloud y onboarding autenticado
- EP-04+: dashboard, movimientos, obligaciones, estadisticas y configuracion

## Referencias del proyecto

- `BACKLOG.md`
- brief de Stitch y assets de marca usados para la base visual del producto

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
- **EP-03 completado a nivel tecnico**: modelo Firestore por usuario, reglas locales, onboarding autenticado, cuenta inicial y categorias base.
- **EP-04 completado a nivel tecnico**: shell autenticado con tabs custom, FAB central, bottom sheet, modal de alta rapida y empty states.
- **EP-05 completado a nivel tecnico**: dashboard real desde Firestore, CRUD de cuentas, formulario de movimientos, transferencias e impacto contable remoto.
- **EP-06 completado a nivel tecnico**: obligaciones, pagos fijos, presupuestos y estadisticas reales desde Firestore.

Pendiente para probar contra backend real:

- crear un proyecto Firebase
- habilitar Authentication con email y contraseña
- colocar las variables `EXPO_PUBLIC_FIREBASE_*`
- publicar/aplicar `firestore.rules` en el proyecto Firebase cuando corresponda

Lo siguiente en la hoja de ruta es:

1. configuracion avanzada
2. gestion de categorias
3. QA funcional y visual del MVP cloud-first

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
    domain/
    db/
    firebase/
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
`EXPO_PUBLIC_FIREBASE_DATABASE_ID` es opcional. Dejalo vacio para usar la base Firestore `(default)`.

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
- modelo multiusuario bajo `/users/{uid}`

La base local actual puede mantenerse mas adelante como soporte tecnico o cache, pero no debe leerse como la estrategia final del producto.

## Firestore

EP-03 define esta base remota:

```text
users/{uid}
  profile/main
  settings/app
  accounts/{accountId}
  movements/{movementId}
  obligations/{obligationId}
  scheduledPayments/{scheduledPaymentId}
  budgets/{budgetId}
  categories/{categoryId}
  onboarding/state
```

El archivo `firestore.rules` contiene reglas locales para aislar cada usuario bajo su propio `uid`.

Si ves `Database '(default)' not found`, crea Firestore Database en Firebase Console para el mismo proyecto configurado en `.env`. Si usas una base con ID personalizado, define `EXPO_PUBLIC_FIREBASE_DATABASE_ID` con ese ID.

## Branding

Los assets activos viven en:

- `assets/images/branding/fullLogo.png`
- `assets/images/branding/logotype.png`
- `assets/images/branding/iconoSinLetras.png`

## Roadmap inmediato

- EP-01 completado: fundaciones, shell y design system
- EP-01.5 completado: pantallas visuales de login y registro
- EP-02 completado: integracion de autenticacion real con Firebase
- EP-03 completado: modelo de datos cloud y onboarding autenticado
- EP-04 completado: navegacion principal y experiencia base autenticada
- EP-05 completado: cuentas, movimientos, transferencias y dashboard
- EP-06 completado: obligaciones, presupuestos y estadisticas
- EP-07 siguiente: configuracion y pulido final

## Referencias del proyecto

- `BACKLOG.md`
- brief de Stitch y assets de marca usados para la base visual del producto

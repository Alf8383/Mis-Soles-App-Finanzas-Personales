# Design System Document

## 1. Overview & Creative North Star: "The Modern Hacienda"

This design system is built to transform personal finance from a chore into a curated, editorial experience. We are moving away from the "banking app" stereotype—cluttered, rigid, and cold—and moving toward a **"Modern Hacienda"** aesthetic. 

This North Star blends the lush, botanical greens of Peru’s landscape with a sophisticated, airy minimalism. The system prioritizes breathing room, intentional asymmetry, and a "layered paper" approach to depth. By ditching heavy lines in favor of tonal shifts, we create a digital environment that feels as trustworthy as a heritage bank but as effortless as a high-end lifestyle magazine.

---

## 2. Colors: Tonal Depth & The No-Line Rule

Our palette is rooted in a deep, authoritative green, accented by a warm, sun-drenched gold. To achieve a premium feel, we utilize the Material Design tonal tiers to define structure.

### Core Palette
*   **Primary (`#005440`):** The foundation of trust. Used for high-level brand moments.
*   **Secondary (`#855400`):** The "Sol" (Gold/Amber). Used for moments of delight, rewards, or highlighting specific financial goals.
*   **Tertiary (`#004b84`):** Specifically for Transfers, providing a cool contrast to the warm primary palette.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. They create visual noise and "trap" the user's eye. Instead:
*   **Boundary Definition:** Use background shifts. A `surface-container-low` section sitting on a `surface` background is all the definition a user needs.
*   **Nesting:** Treat the UI as stacked sheets of fine paper. An inner card (`surface-container-lowest`) should sit atop a section (`surface-container-low`) to create natural, soft hierarchy.

### Signature Textures & Glass
*   **Tonal Gradients:** For Hero cards or main CTAs, use a subtle linear transition from `primary` (#005440) to `primary_container` (#0f6e56). This adds "soul" and prevents the UI from feeling flat or "web 1.0."
*   **Glassmorphism:** For floating action buttons or sticky headers, use a semi-transparent `surface` color with a 16px-24px backdrop-blur. This integrates the element into the environment rather than making it feel "pasted on."

---

## 3. Typography: The Editorial Voice

We use **Manrope** (or the system sans-serif equivalent) to create a clear, authoritative hierarchy. The secret to our premium look is the high contrast between massive "Display" titles and tight, functional "Labels."

*   **Display (Large/Medium):** Used for account balances. These should feel monumental. 
*   **Headline (Small/Medium):** Used for page titles. Set these with generous top-margin to allow the page to "breathe."
*   **Body (Large/Medium):** All transactional data and descriptions. We prioritize `body-md` (0.875rem) for a modern, compact feel.
*   **Labels:** Use `label-sm` (0.6875rem) for metadata (dates, categories). These should be set in `on_surface_variant` to recede visually.

---

## 4. Elevation & Depth: Tonal Layering

We reject traditional drop shadows. We communicate "lift" through the **Layering Principle.**

*   **Tonal Stacking:** 
    1.  **Base:** `surface` (#f8faf8)
    2.  **Sections:** `surface-container-low` (#f2f4f2)
    3.  **Active Cards:** `surface-container-lowest` (#ffffff)
*   **Ambient Shadows:** If an element must float (like a bottom sheet), use an ultra-diffused shadow: `box-shadow: 0 12px 32px rgba(0, 84, 64, 0.06);`. Note the shadow color is a tinted version of our Primary green, not a neutral grey.
*   **The Ghost Border:** For accessibility on white cards, use a 0.5px border using `outline_variant` at 20% opacity. It should be felt, not seen.

---

## 5. Components: Intentional Primitives

### Buttons
*   **Primary:** A soft gradient from `primary` to `primary_container`. High roundedness (`xl` - 1.5rem).
*   **Secondary:** Ghost style. No fill, `primary` text, and the "Ghost Border" (0.5px, low opacity).
*   **States:** On press, the button should scale down slightly (0.98x) rather than just changing color.

### Cards & Lists
*   **The "No-Divider" Rule:** Never use horizontal lines to separate transactions. Use `16px` of vertical white space or alternate the background color of the list items very subtly.
*   **Category Chips:** Native emojis paired with `surface-container-high` backgrounds. 

### Input Fields
*   **Style:** Minimalist. No bottom line. Use a `surface-container-lowest` background with a `md` (0.75rem) corner radius.
*   **Focus:** Transition the "Ghost Border" from 20% to 100% opacity using the `primary` color.

### Financial Status Indicators
*   **Income:** Use `primary_container` text.
*   **Expense:** Use `error` text (#ba1a1a).
*   **Transfer:** Use `tertiary` text (#004b84).

---

## 6. Do's and Don'ts

### Do
*   **Use Asymmetry:** Place balances off-center or use wide margins on one side to create an editorial layout.
*   **Embrace White Space:** If a screen feels "empty," it’s likely working. Don't fill space for the sake of it.
*   **Use Native Emojis:** They add a layer of familiar, human warmth to the "Modern Hacienda" aesthetic.

### Don't
*   **Don't use 100% Black:** Use `on_surface` (#191c1b) for text to maintain the soft, organic feel.
*   **Don't use 1px Solid Borders:** They break the illusion of layered paper.
*   **Don't use Standard Shadows:** If it looks like a default "Card" from a library, it’s wrong. Soften the blur and tint the color.
# Design System Documentation

## 1. Overview & Creative North Star

### Creative North Star: The Editorial Wellness Journal
This design system moves away from the clinical, utility-heavy feel of traditional fitness trackers and towards a "High-End Editorial" experience. The goal is to make nutrition tracking feel less like data entry and more like interacting with a premium wellness magazine. 

We achieve this through **Intentional Asymmetry** and **Tonal Depth**. By breaking the rigid, boxed-in layouts of standard apps, we create a sense of breathing room. We prioritize bold typographic scales and overlapping elements to guide the user’s eye, ensuring that "Health" feels like an aspirational lifestyle, not a chore.

---

## 2. Colors

The palette is rooted in nature and vitality, utilizing a sophisticated Material Design tonal structure.

### Color Roles
- **Primary (`#006857`)**: Our "Vibrant Teal." Used for success states, progress completion, and primary action buttons.
- **Secondary (`#ae2f34`)**: Our "Coral Energy." Specifically reserved for energy expenditure (calories burned) and urgent notifications.
- **Tertiary (`#005bb3`)**: Our "Hydration Blue." Dedicated to water tracking and habit streaks.
- **Neutral Surface Hierarchy**: 
    - `surface`: Main background (`#f8fafb`).
    - `surface_container_low`: Used for secondary sections or background groupings.
    - `surface_container_lowest`: Pure white (`#ffffff`), used for elevated cards to create "lift."

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts. For example, a `surface_container_lowest` card should sit on a `surface` background to define its shape. 

### The "Glass & Gradient" Rule
To elevate the UI beyond flat design:
- **Hero Elements:** Use subtle linear gradients transitioning from `primary` (`#006857`) to `primary_container` (`#00846e`) for main progress rings or CTA backgrounds.
- **Floating Elements:** Use Glassmorphism for overlays. Apply `surface_container_lowest` with 80% opacity and a `20px` backdrop-blur to create a "frosted glass" effect that feels premium and integrated.

---

## 3. Typography

The typography strategy relies on the high-contrast pairing of an authoritative heading font and a highly legible body font.

### Headline & Display: Plus Jakarta Sans
Used for all major headers (e.g., 'Aujourd'hui').
- **Style:** Bold (700 or 800 weight) with tight letter spacing (-0.02em).
- **Purpose:** To act as a visual anchor. High-contrast sizing (using `display-lg` vs `title-sm`) creates an editorial hierarchy that feels intentional and curated.

### Body & Labels: Manrope
Used for all functional text, calorie counts, and descriptions.
- **Style:** Medium (500) for body text, Semi-Bold (600) for labels.
- **Purpose:** Manrope’s modern, geometric construction ensures legibility even at the `label-sm` (0.6875rem) size, which is critical for dense nutritional data.

---

## 4. Elevation & Depth

Hierarchy is achieved through **Tonal Layering** rather than traditional structural shadows.

### The Layering Principle
Depth is created by "stacking" surface tiers.
1. **Base Layer:** `surface` (`#f8fafb`)
2. **Section Layer:** `surface_container_low` (`#f2f4f5`) 
3. **Card Layer:** `surface_container_lowest` (`#ffffff`)

### Ambient Shadows
If a floating effect is required (e.g., a FAB or a modal):
- **Value:** Use a 32px blur, 0px offset.
- **Color:** Use `on_surface` at 6% opacity. This mimics natural light rather than a harsh digital drop shadow.

### The "Ghost Border" Fallback
If contrast ratios require a boundary for accessibility, use a "Ghost Border": the `outline_variant` token at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components

### Progress Rings (The Signature Element)
- **Stroke:** Use `primary` for the "consumed" arc and `surface_container_high` for the "remaining" track.
- **Detail:** Apply a slight outer glow (using a tinted `primary` shadow) to the active head of the progress arc to give it a "living" energy.

### Cards & Lists
- **Style:** Use `xl` (1.5rem) rounded corners for main dashboard cards.
- **Spacing:** Forbid dividers. Separate food items using `spacing-4` (1rem) of vertical whitespace.
- **Nesting:** Smaller info chips inside cards should use `surface_container` backgrounds to distinguish them from the card's `lowest` surface.

### Buttons
- **Primary:** `primary` background with `on_primary` text. Use `full` (9999px) rounding for a modern, friendly feel.
- **Tertiary/Ghost:** No background. Use `primary` text weight 600. Reserved for low-emphasis actions like "Détails" or "Plus."

### Input Fields
- **Background:** `surface_container_low`.
- **Active State:** Change background to `surface_container_lowest` and add a 1pt "Ghost Border" using `primary` at 20% opacity.

---

## 6. Do's and Don'ts

### Do
- **Do** use `display-lg` for large daily summaries to create an editorial "hero" moment.
- **Do** use the `xl` (1.5rem) corner radius for large containers to maintain the "Soft Minimalist" aesthetic.
- **Do** lean on `spacing-8` (2rem) and `spacing-10` (2.5rem) to provide extreme breathing room between different content sections (e.g., between Summary and Food Log).

### Don't
- **Don't** use black text. Use `on_surface` (`#191c1d`) for better tonal harmony.
- **Don't** use standard 1px dividers between list items; the visual clutter breaks the editorial flow.
- **Don't** use harsh, high-saturation red for errors. Use `secondary` (`#ae2f34`) which is more sophisticated and aligns with the "Coral" energy of the brand.
- **Don't** cram icons into every button. Let the typography and color do the heavy lifting.
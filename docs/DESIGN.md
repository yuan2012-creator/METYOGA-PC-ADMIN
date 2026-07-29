---
name: Serene Logic
colors:
  surface: '#faf9f7'
  surface-dim: '#dadad8'
  surface-bright: '#faf9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeec'
  surface-container-high: '#e9e8e6'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1b'
  on-surface-variant: '#4d4540'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#7e756f'
  outline-variant: '#cfc4bd'
  surface-tint: '#635d5a'
  primary: '#181512'
  on-primary: '#ffffff'
  primary-container: '#2d2926'
  on-primary-container: '#96908b'
  inverse-primary: '#cdc5c0'
  secondary: '#586153'
  on-secondary: '#ffffff'
  secondary-container: '#dae3d1'
  on-secondary-container: '#5c6557'
  tertiary: '#241100'
  on-tertiary: '#ffffff'
  tertiary-container: '#402300'
  on-tertiary-container: '#b6885a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9e1dc'
  primary-fixed-dim: '#cdc5c0'
  on-primary-fixed: '#1e1b18'
  on-primary-fixed-variant: '#4b4642'
  secondary-fixed: '#dce5d4'
  secondary-fixed-dim: '#c0c9b9'
  on-secondary-fixed: '#161e13'
  on-secondary-fixed-variant: '#41493c'
  tertiary-fixed: '#ffdcbd'
  tertiary-fixed-dim: '#f0bd8b'
  on-tertiary-fixed: '#2c1600'
  on-tertiary-fixed-variant: '#623f18'
  background: '#faf9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e3e2e0'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '300'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
    letterSpacing: 0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.1em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '400'
    lineHeight: '1.3'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-edge: 40px
  section-gap: 64px
---

## Brand & Style

The design system is anchored in the concept of "Quiet Authority." For a premium management system like MET YOGA, the UI must transition from a tool of utility to a medium of clarity. The brand personality is professional, restrained, and deeply architectural. It avoids the cluttered "dashboard" aesthetic in favor of an editorial layout that prioritizes spatial awareness and mental focus.

The design style is a blend of **Minimalism** and **Modern Corporate**, executed with an editorial eye. Every element exists to serve the "Evidence Chain"—a visual logic where data is presented not just as numbers, but as a clear, sequential narrative of business health. The emotional response should be one of "calm control," reducing the cognitive load of management through ample whitespace, delicate strokes, and a sophisticated, low-saturation palette.

## Colors

The color strategy utilizes a "Recessive Palette." Surfaces are composed of warm greys and off-whites to prevent eye strain and create a sense of physical space. 

- **Primary:** A deep, charcoal-ink black for high-contrast typography and essential interactive states.
- **Secondary (Sage):** Used for "Healthy" status indicators and subtle accents; it suggests growth without the urgency of bright green.
- **Tertiary (Dusty Terracotta/Amber):** Reserved for cautionary data and risks, maintaining a sophisticated, earthy tone.
- **Neutrals:** A range of parchment-inspired tones (`#F9F8F6`, `#F0EDE9`) provide the foundation for tiered content layering.
- **Accents:** High-density data visualizations use muted, low-saturation tones of the primary and secondary colors to ensure the "Evidence Chain" remains legible but unobtrusive.

## Typography

This design system uses **Manrope** exclusively to achieve a modern, refined, and balanced feel. The hierarchy is defined by generous tracking (letter spacing) and varied weights rather than excessive size changes.

Headlines should feel "light" and airy, using lower weights (300-400) even at larger sizes. Labels are always tracked out (0.1em) and often uppercase to provide a clear anchor for data points without demanding too much visual attention. Body text is optimized for readability with a 1.6 line-height, ensuring the "editorial" feel is maintained even in dense information displays.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** on desktop (1440px max width) to maintain the precision of an editorial spread. It utilizes a 12-column system with generous 40px outer margins to create a "frame" for the content.

- **The Breath:** Unlike traditional ERPs, this system mandates a "Section Gap" of 64px between major functional areas. 
- **Vertical Rhythm:** A strict 8px baseline grid ensures that structured lists and charts remain aligned, creating a subconscious sense of order.
- **Mobile Adaptivity:** On mobile devices, the 40px margin collapses to 20px, and the 12-column grid transitions to a single-column fluid stack, with the "Evidence Chain" components maintaining their internal padding to preserve legibility.

## Elevation & Depth

To maintain a high-end feel, depth is achieved through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows.

- **Surfaces:** Use subtle shifts in background color (e.g., a white card on a parchment background) to indicate hierarchy.
- **Borders:** Use 1px solid strokes in a very light grey (`#E5E5E5`). This creates "delicate order" without boxing in the content.
- **Shadows:** If used, they must be "Ambient Shadows"—extremely diffused (20-30px blur), very low opacity (3-5%), and tinted with the primary charcoal color to avoid a "dirty" look. 
- **The Evidence Chain:** Progressions or linked data points are connected by thin, 1px dotted lines rather than solid blocks, emphasizing a light, connective logic.

## Shapes

The shape language is **Soft (Level 1)**. Elements use a 0.25rem (4px) base radius. This creates a professional, sharp aesthetic that is slightly softened to feel approachable. 

- **Interactive Elements:** Buttons and input fields use the base 4px radius.
- **Cards & Containers:** Larger containers can scale up to 8px (`rounded-lg`) to differentiate them from smaller interface components.
- **Circular Elements:** Avatars and status "pips" remain fully circular to provide a geometric contrast to the rectilinear grid.

## Components

### Buttons
Primary buttons use the charcoal color with white text. Secondary buttons are ghost-style with 1px borders. Padding is generous horizontally to emphasize the "Manrope" tracking.

### Structured Lists (Evidence Chain)
Lists are the core of the system. They feature high information density but use high line-height and horizontal dividers. Data points within the list should align to a vertical sub-grid, allowing the eye to scan columns of figures effortlessly.

### Charts
Charts must be lightweight. Use thin stroke widths (1.5px) for line graphs and avoid fill gradients. The "Evidence Chain" logic dictates that charts should be annotated with "Key Events" (e.g., a dip in attendance) using the status colors and thin vertical dashed lines.

### Input Fields
Inputs are minimal: a bottom border only (editorial style) or a very light 1px wrap. The focus state uses a slightly thicker bottom border in the primary color—no heavy glow or color shifts.

### Cards
Cards are flat or use a very subtle "ambient shadow." They do not have headers with background colors; instead, they use the `label-sm` typography to identify the section, placed outside or at the very top of the card with no divider.
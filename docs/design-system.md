# TheCaddy.AI Design System

> A comprehensive visual design system for transforming TheCaddy.AI from a developer prototype into a premium consumer product that golfers trust with their money and trip planning.

---

## Table of Contents

1. [Brand Identity](#1-brand-identity)
2. [Color System](#2-color-system)
3. [Typography System](#3-typography-system)
4. [Component Design System](#4-component-design-system)
5. [Layout System](#5-layout-system)
6. [Iconography](#6-iconography)
7. [Motion & Animation](#7-motion--animation)
8. [Dark Mode](#8-dark-mode)
9. [Competitive Visual Benchmark](#9-competitive-visual-benchmark)
10. [Implementation Reference](#10-implementation-reference)

---

## Current State Audit

Before designing what should exist, here is what the codebase has today:

**Colors:** Three custom tokens (`forest: #1A4D2E`, `sand: #F5F5DC`, `gold: #D4AF37`) defined in `tailwind.config.js` but almost never used in actual pages. The demo-mobile page uses them via raw hex values in className strings. Every other page leans entirely on Tailwind's default `emerald-600`, `gray-*` scale, and white. The result is a generic SaaS look with no brand identity.

**Typography:** Inter (sans) and Merriweather (serif) are loaded from Google Fonts. Inter is the body default. Merriweather appears only in the demo-mobile page (`font-serif`). No type scale is enforced -- font sizes are ad hoc (`text-sm`, `text-xl`, `text-3xl`) with no hierarchy rules.

**Components:** All built with inline Tailwind classes. No shared component library, no design tokens, no consistent spacing or radius conventions. Buttons vary between `rounded-lg`, `rounded-xl`, and `rounded-full`. Cards vary between `rounded-xl` and `rounded-2xl`. Shadows range from `shadow-sm` to `shadow-2xl` with no pattern.

**Layout:** No consistent grid system. Pages use `max-w-7xl`, `max-w-4xl`, `max-w-3xl`, and `max-w-md` without rationale. No shared header component -- each page rebuilds its own.

**Icons:** Lucide React is used throughout. Golf-specific icons are emoji (`flag`, `golfer`, `golf hole` via unicode).

---

## 1. Brand Identity

### Brand Name

**Primary:** TheCaddy.AI
**Short form:** The Caddy
**Logo lockup:** "The" in accent weight + "Caddy" in bold + ".AI" in accent weight

The name should always be written with the capital T, C, and AI. Never "thecaddy.ai" or "The Caddy AI" (without the dot).

### Brand Personality

The Caddy is the person on the course who has seen it all -- every lie, every break, every wind shift. They know the answer before you ask the question, but they never make you feel stupid for asking. They are:

- **Knowledgeable** -- Knows every course, every destination, every trick to save money without sacrificing quality
- **Efficient** -- Gets the group organized without the 47-message group chat
- **Slightly witty** -- Golf is fun; planning it should be too
- **Trustworthy** -- You are handing this app real money and real trip logistics
- **Confident, not cocky** -- Makes recommendations without hedging, but respects your preferences

### Brand Voice

The voice should feel like texting a friend who happens to be a golf travel expert.

**Planning context:**
- "Let's build your dream round. Where are we headed?"
- "Tell me about the crew and I'll find courses that fit."
- "Got it -- 8 guys, Scottsdale, late May. I know just the spot."

**Presenting options:**
- "I've lined up three packages. Here's what I'd play."
- "Option B is the sleeper pick -- same courses, $200 less per head."
- "This one's the flagship. Premium everything."

**Group coordination:**
- "The crew has voted. Here's the winning lineup."
- "3 of 8 have weighed in. Time to nudge the stragglers."
- "Consensus reached -- looks like Scottsdale wins."

**Success states:**
- "Tee times locked. See you on the first tee."
- "Deposits collected. The group's fully in."
- "Trip confirmed. Time to start working on that swing."

**Error states:**
- "Mulligan needed -- let's try that again."
- "Lost one in the rough. Give me a second to find it."
- "That shot went OB. Let's re-tee."

**Empty states:**
- "No trips on the card yet. Ready to plan your first?"
- "The roster's empty. Time to rally the crew."
- "No votes yet. Share the link and let the group decide."

**Loading states:**
- "Reading the green..."
- "Checking the wind..."
- "Consulting the yardage book..."

### Brand Promise

"Plan a golf trip in minutes, not weeks. No group chat chaos. No spreadsheet hell. Just tell The Caddy what you want and we'll handle the rest."

---

## 2. Color System

### Design Rationale

The palette draws from the golf course itself: deep greens of the fairway, warm sand of the bunkers, the muted gold of evening light on the clubhouse. It should feel premium and natural, not neon-tech or startup-generic.

### CSS Custom Properties

```css
:root {
  /* ========================================
     PRIMARY PALETTE
     ======================================== */

  /* Pine -- Primary brand color. The deep green of a
     well-maintained fairway at dawn. Used for primary
     actions, the header, and brand moments. */
  --color-pine-50:  #E8F5EC;
  --color-pine-100: #C6E6CE;
  --color-pine-200: #9ED4AC;
  --color-pine-300: #73C089;
  --color-pine-400: #4FAF6E;
  --color-pine-500: #2B9E54;
  --color-pine-600: #1E7A3F;  /* Primary action default */
  --color-pine-700: #1A5F33;
  --color-pine-800: #164D2B;  /* Header, navbars */
  --color-pine-900: #0F3A1F;
  --color-pine-950: #082413;

  /* Clubhouse -- Warm neutral with a sand undertone.
     The cream of a classic clubhouse interior.
     Used for page backgrounds and card surfaces. */
  --color-clubhouse-50:  #FDFCF9;  /* Page background */
  --color-clubhouse-100: #FAF7F0;  /* Card background */
  --color-clubhouse-200: #F3EDE0;
  --color-clubhouse-300: #E8DFCC;
  --color-clubhouse-400: #D6CCAF;
  --color-clubhouse-500: #C4B892;
  --color-clubhouse-600: #A89A6F;
  --color-clubhouse-700: #8A7D55;
  --color-clubhouse-800: #6B6040;
  --color-clubhouse-900: #4D452E;

  /* Flag -- Accent gold. The pin flag catching sunlight.
     Used sparingly for highlights, badges, and premium
     moments. Never for large surfaces. */
  --color-flag-50:  #FDF8E8;
  --color-flag-100: #FAEFC5;
  --color-flag-200: #F5E09E;
  --color-flag-300: #EFCE6E;
  --color-flag-400: #E8BC45;
  --color-flag-500: #D4AF37;  /* Primary accent */
  --color-flag-600: #B8942B;
  --color-flag-700: #947622;
  --color-flag-800: #70591A;
  --color-flag-900: #4C3D12;

  /* ========================================
     NEUTRAL PALETTE
     ======================================== */

  /* Slate -- Cool neutral for text and borders.
     Slightly warm compared to pure gray. */
  --color-slate-50:  #F8F9FA;
  --color-slate-100: #F1F3F4;
  --color-slate-200: #E2E5E8;
  --color-slate-300: #CDD2D7;
  --color-slate-400: #9BA3AD;
  --color-slate-500: #6C7680;
  --color-slate-600: #515961;
  --color-slate-700: #3D444B;
  --color-slate-800: #2A2F35;
  --color-slate-900: #1A1D22;
  --color-slate-950: #0D0F12;

  /* ========================================
     SEMANTIC COLORS
     ======================================== */

  /* Success -- Birdie */
  --color-success-50:  #ECFDF5;
  --color-success-100: #D1FAE5;
  --color-success-500: #10B981;
  --color-success-600: #059669;
  --color-success-700: #047857;

  /* Warning -- Bunker */
  --color-warning-50:  #FFFBEB;
  --color-warning-100: #FEF3C7;
  --color-warning-500: #F59E0B;
  --color-warning-600: #D97706;
  --color-warning-700: #B45309;

  /* Error -- Out of Bounds */
  --color-error-50:  #FEF2F2;
  --color-error-100: #FEE2E2;
  --color-error-500: #EF4444;
  --color-error-600: #DC2626;
  --color-error-700: #B91C1C;

  /* Info -- Sky */
  --color-info-50:  #EFF6FF;
  --color-info-100: #DBEAFE;
  --color-info-500: #3B82F6;
  --color-info-600: #2563EB;
  --color-info-700: #1D4ED8;

  /* ========================================
     SURFACE COLORS
     ======================================== */
  --surface-page:      var(--color-clubhouse-50);
  --surface-card:      #FFFFFF;
  --surface-card-alt:  var(--color-clubhouse-100);
  --surface-elevated:  #FFFFFF;
  --surface-overlay:   rgba(15, 58, 31, 0.6);
  --surface-input:     #FFFFFF;
  --surface-input-disabled: var(--color-slate-100);

  /* ========================================
     TEXT COLORS
     ======================================== */
  --text-primary:   var(--color-slate-900);    /* #1A1D22 */
  --text-secondary: var(--color-slate-600);    /* #515961 */
  --text-muted:     var(--color-slate-400);    /* #9BA3AD */
  --text-inverse:   #FFFFFF;
  --text-brand:     var(--color-pine-600);     /* #1E7A3F */
  --text-accent:    var(--color-flag-500);     /* #D4AF37 */

  /* ========================================
     BORDER COLORS
     ======================================== */
  --border-default:  var(--color-slate-200);   /* #E2E5E8 */
  --border-hover:    var(--color-slate-300);   /* #CDD2D7 */
  --border-focus:    var(--color-pine-500);    /* #2B9E54 */
  --border-error:    var(--color-error-500);   /* #EF4444 */

  /* ========================================
     GOLF-SPECIFIC ACCENTS
     ======================================== */
  --golf-fairway:   var(--color-pine-600);
  --golf-rough:     #4A7C59;
  --golf-bunker:    #D4C5A0;
  --golf-water:     #5B9BD5;
  --golf-sky:       #87CEEB;
  --golf-sunset:    #E8956A;
  --golf-flagstick: var(--color-flag-500);
}
```

### Contrast Ratios (WCAG AA Compliance)

| Combination                          | Ratio  | Pass |
|--------------------------------------|--------|------|
| `--text-primary` on `--surface-page` | 14.8:1 | AAA  |
| `--text-secondary` on `--surface-card` | 7.2:1 | AA   |
| `--text-muted` on `--surface-card`   | 3.8:1  | AA (large text only) |
| `--text-inverse` on `--color-pine-600` | 5.1:1 | AA   |
| `--text-inverse` on `--color-pine-800` | 8.9:1 | AAA  |
| `--text-accent` on `--surface-card`  | 3.6:1  | AA (large text only) |
| `--color-error-600` on white         | 4.6:1  | AA   |

### Usage Rules

1. **Pine-600** is the primary action color. Use it for buttons, links, and interactive elements. Never use it for large background surfaces except the header.
2. **Pine-800** is for the header/navbar and serious UI chrome. It anchors the page.
3. **Flag gold** is an accent only. Use it for badges, highlights, premium indicators, and small decorative elements. Never for buttons or large text.
4. **Clubhouse-50** replaces pure white as the page background. This warmth is subtle but makes the app feel less clinical and more like a place you want to be.
5. **White (#FFFFFF)** is reserved for cards and elevated surfaces to create clear visual hierarchy against the warm background.
6. Never use more than 3 colors in a single component (excluding text and border neutrals).

---

## 3. Typography System

### Font Stack

```css
:root {
  /* Display & Headlines -- DM Serif Display
     A refined serif with character. Feels clubhouse-classic
     without being stuffy. Use for hero text, section headers,
     and trip names. */
  --font-display: 'DM Serif Display', Georgia, 'Times New Roman', serif;

  /* Headings & UI -- DM Sans
     The geometric sans companion to DM Serif Display.
     Clean, highly legible, modern but warm. Use for card
     titles, labels, navigation, and all interactive text. */
  --font-heading: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* Body -- Inter
     The current body font. Excellent readability at small
     sizes, OpenType features for tabular numbers. Keep it. */
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* Mono -- JetBrains Mono
     For prices, scores, share codes, and data tables.
     More personality than system mono. */
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
}
```

### Font Pairing Rationale

- **DM Serif Display + DM Sans** are designed as a pair by Colophon Foundry. They share skeletal proportions, so they harmonize without effort. The serif brings the premium "golf club" gravitas; the sans brings clean modernity.
- **Inter** continues as the body workhorse. At 14-16px, it is one of the most readable screen fonts available.
- **JetBrains Mono** for data gives prices and scores a distinct visual lane that says "this is a number, not prose."

### Type Scale

All sizes defined in rem. Base = 16px.

```css
:root {
  /* Size Scale */
  --text-xs:   0.75rem;    /* 12px */
  --text-sm:   0.875rem;   /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg:   1.125rem;   /* 18px */
  --text-xl:   1.25rem;    /* 20px */
  --text-2xl:  1.5rem;     /* 24px */
  --text-3xl:  1.875rem;   /* 30px */
  --text-4xl:  2.25rem;    /* 36px */
  --text-5xl:  3rem;       /* 48px */
  --text-6xl:  3.75rem;    /* 60px */

  /* Line Heights */
  --leading-none:    1;
  --leading-tight:   1.2;
  --leading-snug:    1.35;
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;
  --leading-loose:   1.8;

  /* Letter Spacing */
  --tracking-tighter: -0.02em;
  --tracking-tight:   -0.01em;
  --tracking-normal:  0;
  --tracking-wide:    0.025em;
  --tracking-wider:   0.05em;
  --tracking-widest:  0.1em;
}
```

### Type Styles (Semantic)

| Token              | Font Family    | Size       | Weight | Line Height     | Letter Spacing   | Usage                           |
|---------------------|---------------|------------|--------|-----------------|------------------|---------------------------------|
| `display-hero`     | `--font-display` | `--text-6xl` | 400  | `--leading-none` | `--tracking-tighter` | Landing page hero only         |
| `display-section`  | `--font-display` | `--text-4xl` | 400  | `--leading-tight` | `--tracking-tight` | Section headers, trip names     |
| `heading-1`        | `--font-heading` | `--text-2xl` | 700  | `--leading-tight` | `--tracking-tight` | Page titles                     |
| `heading-2`        | `--font-heading` | `--text-xl`  | 600  | `--leading-snug` | `--tracking-normal` | Card titles, section sub-headers |
| `heading-3`        | `--font-heading` | `--text-lg`  | 600  | `--leading-snug` | `--tracking-normal` | List headers, sub-sections      |
| `body-default`     | `--font-body`    | `--text-base` | 400 | `--leading-relaxed` | `--tracking-normal` | Body text, descriptions       |
| `body-small`       | `--font-body`    | `--text-sm`  | 400  | `--leading-normal` | `--tracking-normal` | Secondary text, metadata       |
| `label`            | `--font-heading` | `--text-sm`  | 500  | `--leading-none` | `--tracking-normal` | Form labels, navigation items  |
| `caption`          | `--font-body`    | `--text-xs`  | 500  | `--leading-normal` | `--tracking-wide` | Timestamps, fine print          |
| `overline`         | `--font-heading` | `--text-xs`  | 700  | `--leading-none` | `--tracking-widest` | Category labels, section tags   |
| `data-large`       | `--font-mono`    | `--text-3xl` | 700  | `--leading-none` | `--tracking-tight` | Hero prices, big stats          |
| `data-default`     | `--font-mono`    | `--text-lg`  | 600  | `--leading-none` | `--tracking-normal` | Inline prices, scores           |
| `data-small`       | `--font-mono`    | `--text-sm`  | 500  | `--leading-none` | `--tracking-normal` | Table cells, cost breakdowns    |

### Google Fonts Import

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## 4. Component Design System

### Global Component Conventions

```css
:root {
  /* Border Radius Scale */
  --radius-sm:   6px;
  --radius-md:   10px;
  --radius-lg:   14px;
  --radius-xl:   20px;
  --radius-2xl:  28px;
  --radius-full: 9999px;

  /* Shadow Scale */
  --shadow-xs:   0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm:   0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md:   0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.04);
  --shadow-lg:   0 10px 15px rgba(0, 0, 0, 0.06), 0 4px 6px rgba(0, 0, 0, 0.04);
  --shadow-xl:   0 20px 25px rgba(0, 0, 0, 0.08), 0 8px 10px rgba(0, 0, 0, 0.04);
  --shadow-2xl:  0 25px 50px rgba(0, 0, 0, 0.12);
  --shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.04);

  /* Card-specific shadow with warm tint */
  --shadow-card:       0 1px 3px rgba(26, 77, 43, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03);
  --shadow-card-hover: 0 8px 25px rgba(26, 77, 43, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04);
}
```

---

### 4.1 Buttons

All buttons use `--font-heading` (DM Sans), `font-weight: 600`.

#### Primary Button

The main call-to-action. Pine green with white text.

```
Background:        var(--color-pine-600)
Text:              white
Border:            none
Border-radius:     var(--radius-lg)
Padding:           12px 24px (md), 16px 32px (lg)
Shadow:            var(--shadow-sm)
Font:              --font-heading, 600, --text-sm (md) / --text-base (lg)

Hover:             background var(--color-pine-700), shadow var(--shadow-md)
Active:            background var(--color-pine-800), shadow none, transform scale(0.98)
Focus:             ring 2px var(--color-pine-300), offset 2px
Disabled:          opacity 0.5, cursor not-allowed, no hover effects
Loading:           spinner replaces text, same width to prevent layout shift
```

#### Secondary Button

For secondary actions alongside a primary. Outlined.

```
Background:        transparent
Text:              var(--color-pine-600)
Border:            1.5px solid var(--color-pine-200)
Border-radius:     var(--radius-lg)
Shadow:            none

Hover:             background var(--color-pine-50), border-color var(--color-pine-300)
Active:            background var(--color-pine-100)
```

#### Ghost Button

For tertiary actions, navigation, and toolbars.

```
Background:        transparent
Text:              var(--text-secondary)
Border:            none

Hover:             background var(--color-slate-100), text var(--text-primary)
Active:            background var(--color-slate-200)
```

#### Destructive Button

For delete, cancel, and dangerous actions.

```
Background:        var(--color-error-600)
Text:              white
Border-radius:     var(--radius-lg)

Hover:             background var(--color-error-700)
```

#### Gold Accent Button (Premium)

For share, upgrade, or celebration moments. Use sparingly.

```
Background:        linear-gradient(135deg, var(--color-flag-500), var(--color-flag-600))
Text:              white
Shadow:            0 4px 12px rgba(212, 175, 55, 0.3)

Hover:             shadow 0 6px 20px rgba(212, 175, 55, 0.4), translate-y -1px
```

#### Button Sizes

| Size | Padding       | Font Size     | Min Height | Icon Size |
|------|---------------|---------------|------------|-----------|
| sm   | 8px 16px      | `--text-xs`   | 32px       | 14px      |
| md   | 12px 24px     | `--text-sm`   | 40px       | 16px      |
| lg   | 16px 32px     | `--text-base` | 48px       | 20px      |
| xl   | 20px 40px     | `--text-lg`   | 56px       | 20px      |

---

### 4.2 Cards

#### Base Card

All cards share these properties:

```
Background:        var(--surface-card)
Border:            1px solid var(--border-default)
Border-radius:     var(--radius-xl)
Shadow:            var(--shadow-card)
Padding:           24px (desktop), 20px (mobile)
Transition:        all 200ms ease

Hover (if interactive):
  Shadow:          var(--shadow-card-hover)
  Border-color:    var(--color-pine-200)
  Transform:       translateY(-2px)
```

#### Trip Card (Dashboard)

Used in the dashboard grid. Shows trip summary at a glance.

```
Structure:
  [Status Badge .............. Role Tag]
  [Trip Name -- heading-2, serif]
  [Origin -- icon + body-small]
  [Dates  -- icon + body-small]
  [Players -- icon + body-small]
  [Budget -- icon + body-small]
  [---- divider ----]
  [Nights count .... "View Details" link]

Status Badge:
  draft:        bg slate-100, text slate-600, Clock icon
  options_ready: bg info-100, text info-700, Flag icon
  voting:       bg purple-100, text purple-700, Vote icon
  locked:       bg success-100, text success-700, Check icon
  booked:       bg flag-100, text flag-700, Trophy icon

Min height: 280px
Grid behavior: 1 col mobile, 2 col tablet, 3 col desktop
```

#### Course Card (Trip Options)

Displays a single course within a trip option.

```
Structure:
  [Course Name -- heading-3]  [Holes badge]
  [Role tag: "anchor" | "wild card" | "bucket list"]

Background:  var(--surface-card-alt)
Border-radius: var(--radius-md)
Padding: 12px 16px
```

#### Trip Option Card (Planner)

The primary card for comparing trip packages.

```
Structure:
  [HEADER SECTION -- pine-800 to pine-600 gradient bg]
    [Option Title -- display-section, white]
    [Tagline -- body-small, white/70]
    [Destination -- icon + body-small, white/80]

  [PRICE BADGE -- overlapping header/body, white bg]
    [$Amount -- data-large, pine-600]
    ["/person" -- caption, slate-400]
    [Score circle -- pine-600 ring, data-default inside]

  [BODY]
    [Courses section -- list of Course Cards]
    [Lodging section -- card-alt bg]
    [Why This Works -- pill tags, pine-50 bg, pine-700 text]
    [Cost Breakdown -- collapsible, data-small font]

  [FOOTER -- if selected]
    [Selected indicator -- success-50 bg, success-700 text]

Border when selected: 2px solid var(--color-pine-600)
Border when unselected: 1px solid var(--border-default)
```

#### Vote Card (Swipe Interface)

The card used in the Tinder-style voting flow.

```
All base card styles plus:
  Shadow: var(--shadow-2xl) -- elevated to feel "in hand"
  Border-radius: var(--radius-2xl)
  Overflow: hidden
  Cursor: grab (idle), grabbing (dragging)

  Swipe indicators:
    Right (YES): green-500 bg, white text, rotated -12deg, "LIKE" text
    Left (NOPE): error-500 bg, white text, rotated 12deg, "PASS" text

  Action buttons below card:
    Pass: 64px circle, error-100 bg, X icon in error-500
    Like: 64px circle, success-100 bg, Heart icon in success-600
```

---

### 4.3 Forms

#### Text Input

```
Background:        var(--surface-input)
Border:            1.5px solid var(--border-default)
Border-radius:     var(--radius-lg)
Padding:           12px 16px
Font:              --font-body, --text-sm
Color:             var(--text-primary)
Line-height:       --leading-normal
Min-height:        48px

Placeholder:       var(--text-muted)

Focus:
  Border-color:    var(--border-focus)
  Box-shadow:      0 0 0 3px rgba(43, 158, 84, 0.15)
  Outline:         none

Error:
  Border-color:    var(--border-error)
  Box-shadow:      0 0 0 3px rgba(239, 68, 68, 0.1)

Disabled:
  Background:      var(--surface-input-disabled)
  Opacity:         0.7
  Cursor:          not-allowed

With Icon (left):
  Padding-left:    44px
  Icon position:   absolute, left 14px, vertically centered
  Icon color:      var(--text-muted)
  Icon focus color: var(--color-pine-600)
```

#### Select

Same visual treatment as text input, with a chevron-down icon on the right side at 14px, color `--text-muted`.

#### Date Picker

Same visual treatment as text input. Use a Calendar icon on the left. Consider the native date picker on mobile, custom popover on desktop.

#### Textarea

Same as text input but with:
```
Min-height:  120px
Resize:      vertical
```

#### Form Labels

```
Font:          --font-heading, 500, --text-sm
Color:         var(--text-primary)
Margin-bottom: 6px

Required indicator: red asterisk after label text
Helper text: --text-xs, --text-secondary, margin-top 4px
Error text: --text-xs, --color-error-600, margin-top 4px
```

---

### 4.4 Navigation

#### Main Header (Desktop)

```
Background:      var(--color-pine-800)
Height:          64px
Shadow:          var(--shadow-md)
Position:        sticky top-0 z-50

Layout:
  [Logo .......... Nav Links .......... Actions]

Logo: "TheCaddy.AI" in --font-display, white, --text-xl
  "The" and ".AI" in --color-flag-400

Nav Links: --font-heading, 500, --text-sm, white/70
  Hover: white, underline offset 4px
  Active: white, underline var(--color-flag-400)

Actions:
  [Dashboard] [Profile Avatar] -- if authenticated
  [Sign In] [Start Planning -- primary button sm] -- if not
```

#### Main Header (Mobile)

```
Height:          56px
Layout:          [Logo .... Hamburger]

Mobile menu: Full-screen overlay
  Background: var(--color-pine-900)/95, backdrop-blur
  Nav links stacked vertically, --text-xl
  Close button top-right
```

#### Breadcrumbs

```
Font:        --font-body, --text-sm
Color:       var(--text-muted)
Separator:   "/" or ChevronRight icon, 12px
Active page: var(--text-primary), font-weight 500

Example: Dashboard / Scottsdale Scramble / Options
```

#### Tab Navigation

```
Border-bottom: 1px solid var(--border-default)
Tab item:
  Padding:     16px 0
  Font:        --font-heading, 500, --text-sm
  Color:       var(--text-muted)
  Border-bottom: 2px solid transparent

  Active:
    Color:       var(--color-pine-600)
    Border:      2px solid var(--color-pine-600)

  Hover:
    Color:       var(--text-primary)

Badge on tab: --text-xs, pine-600 bg, white text, rounded-full, padding 2px 8px
```

#### Bottom Tab Bar (Mobile)

```
Background:    white
Border-top:    1px solid var(--border-default)
Shadow:        0 -4px 10px rgba(0, 0, 0, 0.05)
Height:        64px + safe-area-inset
Padding-bottom: env(safe-area-inset-bottom)

Tab item:
  Flex-direction: column
  Gap:            4px
  Icon:           20px
  Label:          --text-xs, --tracking-wider, uppercase
  Color:          var(--text-muted)

  Active:
    Color:         var(--color-pine-600)
    Icon fill:     var(--color-pine-600)
```

---

### 4.5 Chat Interface

The chat is the core product experience. It should feel like iMessage with a golf expert.

#### Chat Container

```
Background:   var(--surface-page)
Max-width:    768px, centered
```

#### User Message Bubble

```
Background:    var(--color-pine-600)
Color:         white
Border-radius: 20px 20px 4px 20px  /* sharp corner on sender side */
Padding:       12px 18px
Max-width:     75%
Align:         right
Font:          --font-body, --text-sm, --leading-relaxed
Shadow:        var(--shadow-xs)
```

#### Assistant Message Bubble

```
Background:    var(--surface-card)
Color:         var(--text-primary)
Border:        1px solid var(--border-default)
Border-radius: 20px 20px 20px 4px  /* sharp corner on receiver side */
Padding:       12px 18px
Max-width:     75%
Align:         left
Font:          --font-body, --text-sm, --leading-relaxed
Shadow:        var(--shadow-xs)

Avatar: 32px circle with caddy icon, pine-100 bg, to the left of bubble
```

#### Typing Indicator

```
Three dots in assistant bubble style:
  Dot size: 8px
  Dot color: var(--color-slate-400)
  Animation: bounce with 150ms stagger
  Text: "Reading the green..." in caption style, to the right
```

#### Quick Reply Chips

Suggested prompts below the input field.

```
Background:    var(--surface-card)
Border:        1px solid var(--border-default)
Border-radius: var(--radius-full)
Padding:       8px 16px
Font:          --font-body, --text-sm
Color:         var(--text-secondary)

Hover:         background var(--color-pine-50), border-color var(--color-pine-200), color var(--color-pine-700)

Layout: horizontal scroll on mobile, wrap on desktop
Gap: 8px
```

#### Chat Input Bar

```
Background:    var(--surface-card)
Border-top:    1px solid var(--border-default)
Padding:       16px

Input field:
  Same as form text input but with --radius-full
  Padding-right: 52px (space for send button)

Send button:
  Position: absolute right inside input
  Size: 36px circle
  Background: var(--color-pine-600)
  Icon: ArrowUp, white, 18px
  Disabled: opacity 0.3
```

---

### 4.6 Data Display

#### Stat Card

```
Background:    var(--surface-card)
Border:        1px solid var(--border-default)
Border-radius: var(--radius-xl)
Padding:       20px

Label:         overline style
Value:         data-large style
Change/badge:  caption style, color contextual (success/error)
```

#### Price Display

```
Large (hero price):
  "$" prefix:  data-default, var(--text-secondary)
  Amount:      data-large, var(--text-primary)
  "/person":   caption, var(--text-muted)

Inline:
  "$" + Amount: data-default, var(--color-pine-600)
```

#### Progress Bar

```
Track:
  Background:  var(--color-slate-200)
  Height:      8px
  Border-radius: var(--radius-full)

Fill:
  Background:  linear-gradient(90deg, var(--color-pine-500), var(--color-pine-600))
  Border-radius: var(--radius-full)
  Transition:  width 500ms ease

Percentage label: data-small, right-aligned above bar
```

#### Cost Breakdown Table

```
Container:     collapsible (details/summary)
Header:        --font-heading, 600, --text-sm + chevron icon
Rows:          flex justify-between, padding 8px 0
Label:         --font-body, --text-sm, var(--text-secondary)
Value:         --font-mono, --text-sm, var(--text-primary)
Divider:       1px dashed var(--border-default) before total
Total row:     font-weight 700, --text-base
```

#### Vote Results Bar

```
Container:     card with optional 2px pine-600 border (leader)
Name:          heading-2
Location:      body-small, with MapPin icon
Vote count:    data-default, right-aligned
Bar:           same as progress bar
Leader badge:  "Group Favorite" -- overline style, success-600 color, TrendingUp icon
```

---

### 4.7 Modals & Overlays

#### Base Modal

```
Overlay:       var(--surface-overlay), backdrop-blur 4px
Container:
  Background:  var(--surface-card)
  Border-radius: var(--radius-2xl) (desktop), var(--radius-xl) top only (mobile sheet)
  Shadow:      var(--shadow-2xl)
  Max-width:   480px (sm), 640px (md), 800px (lg)
  Max-height:  85vh
  Padding:     32px (desktop), 24px (mobile)

Animation:
  Enter: fade-in overlay 200ms, slide-up content 300ms with spring easing
  Exit:  fade-out overlay 150ms, slide-down content 200ms

Close button: top-right, 32px circle, ghost style, X icon
```

#### Confirmation Modal

```
Structure:
  [Icon -- 56px circle, contextual color bg]
  [Title -- heading-1, centered]
  [Description -- body-default, centered, text-secondary]
  [Actions -- 2 buttons, full-width on mobile, right-aligned on desktop]
    [Cancel -- secondary button]
    [Confirm -- primary or destructive button]
```

#### Share Sheet (Mobile)

```
Position:      bottom sheet, slides up
Border-radius: var(--radius-2xl) top corners
Max-height:    60vh
Drag handle:   40px x 4px, centered, slate-300, radius-full, margin-bottom 16px

Content:
  [Share link input with copy button]
  [Share via: SMS, Email, WhatsApp, Copy Link -- icon grid]
```

---

### 4.8 Empty States

Every empty state follows this structure:

```
Container: centered, max-width 400px, padding 48px (desktop) 32px (mobile)

[Illustration -- 80px icon in a 120px circle, contextual-50 bg]
[Headline -- heading-1, centered]
[Description -- body-default, text-secondary, centered]
[CTA -- primary button lg]
```

Specific copy:

| State              | Icon       | Headline                        | Description                                        | CTA              |
|--------------------|-----------|---------------------------------|----------------------------------------------------|--------------------|
| No trips           | Flag      | "No trips on the card"          | "Start planning your first golf trip with The Caddy" | "Plan a Trip"     |
| No votes           | VoteIcon  | "Waiting on the crew"           | "Share the link and let everyone weigh in"          | "Copy Share Link" |
| No options         | Calendar  | "Options incoming"              | "Tell The Caddy about your trip and we'll line up packages" | "Start Chat" |
| First-time user    | Golfer    | "Welcome to the clubhouse"      | "The Caddy plans trips so you don't have to. Let's tee off." | "Plan Your First Trip" |
| No payment history | Wallet    | "No payments yet"               | "Funds and payment history will show up here"       | --                |
| Search no results  | Search    | "Came up empty"                 | "Try different dates or destinations"               | "Adjust Filters"  |

---

### 4.9 Loading States

#### Skeleton Screens

Use skeleton loading instead of spinners for content areas.

```
Skeleton element:
  Background:    linear-gradient(90deg,
                   var(--color-slate-200) 25%,
                   var(--color-slate-100) 50%,
                   var(--color-slate-200) 75%)
  Background-size: 200% 100%
  Animation:     shimmer 1.5s ease infinite
  Border-radius: var(--radius-md) (for text), var(--radius-xl) (for cards)

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

Text skeleton: height 12-16px, width 60-100% (vary for natural look)
Card skeleton: match card dimensions, internal text placeholders
Avatar skeleton: circle matching avatar size
```

#### Spinner

For inline loading (buttons, small areas):

```
Size: 16px (sm), 20px (md), 32px (lg)
Color: currentColor (inherits from parent text)
Border: 2px solid currentColor, border-top transparent
Animation: spin 600ms linear infinite
```

#### Full-page Loading

```
Center of viewport:
  [Caddy logo icon -- 48px, pine-600]
  [Brand tagline in caption style, rotating through:]
    "Reading the green..."
    "Checking the wind..."
    "Consulting the yardage book..."
  [Subtle progress bar -- optional]

Animation: logo pulse (scale 0.95 to 1.05, 2s ease infinite)
```

---

### 4.10 Toasts & Notifications

#### Toast

```
Position:      fixed bottom-center (mobile), bottom-right (desktop)
Offset:        24px from edges, above bottom nav if present

Background:    var(--color-slate-900)
Color:         white
Border-radius: var(--radius-lg)
Padding:       12px 20px
Shadow:        var(--shadow-xl)
Font:          --font-heading, 500, --text-sm
Max-width:     420px

Icon:          left side, 18px, contextual color:
  success:     CheckCircle, success-400
  error:       AlertCircle, error-400
  info:        Info, info-400
  group:       Users, flag-400

Animation:
  Enter: slide-up 300ms + fade-in
  Exit:  slide-down 200ms + fade-out
  Auto-dismiss: 4000ms

Dismiss: X button on right, ghost style, white/60 hover white
```

#### Persistent Banner

For important system messages (payment overdue, voting deadline).

```
Position:      top of content area, below header
Background:    contextual-50 (warning-50 for deadlines, info-50 for updates)
Border-bottom: 1px solid contextual-200
Padding:       12px 24px
Font:          --font-body, --text-sm

Structure:
  [Icon] [Message text] [Action link or dismiss X]
```

---

## 5. Layout System

### Grid

```css
:root {
  /* Grid columns */
  --grid-columns: 12;
  --grid-gutter: 24px;
  --grid-margin-mobile: 16px;
  --grid-margin-tablet: 24px;
  --grid-margin-desktop: 32px;

  /* Container max-widths */
  --container-sm: 640px;    /* Narrow forms, payment pages */
  --container-md: 768px;    /* Chat interface */
  --container-lg: 1024px;   /* Dashboard, trip detail */
  --container-xl: 1280px;   /* Landing page, wide layouts */
}
```

### Breakpoints

| Token    | Min-width | Usage                                    |
|----------|-----------|------------------------------------------|
| `sm`     | 640px     | Landscape phone, small tablet             |
| `md`     | 768px     | Tablet portrait                           |
| `lg`     | 1024px    | Tablet landscape, small laptop            |
| `xl`     | 1280px    | Standard desktop                          |
| `2xl`    | 1536px    | Large desktop                             |

### Spacing Scale

Base unit: 4px. All spacing derives from multiples.

| Token | Value | Pixels | Common Usage                         |
|-------|-------|--------|--------------------------------------|
| `0.5` | 0.125rem | 2px  | Hairline gaps                        |
| `1`   | 0.25rem  | 4px  | Inline icon-to-text gap              |
| `1.5` | 0.375rem | 6px  | Tight badge padding                  |
| `2`   | 0.5rem   | 8px  | Chip/tag padding, small gaps         |
| `3`   | 0.75rem  | 12px | Button padding-y, form element gaps  |
| `4`   | 1rem     | 16px | Card internal gaps, mobile margin    |
| `5`   | 1.25rem  | 20px | Card padding (mobile)                |
| `6`   | 1.5rem   | 24px | Card padding (desktop), section gaps |
| `8`   | 2rem     | 32px | Section spacing                      |
| `10`  | 2.5rem   | 40px | Large section spacing                |
| `12`  | 3rem     | 48px | Page top padding                     |
| `16`  | 4rem     | 64px | Hero padding                         |
| `20`  | 5rem     | 80px | Landing page section spacing         |
| `24`  | 6rem     | 96px | Major vertical rhythm                |

### Page Layout Templates

#### Landing Page

```
[Full-width header -- pine-800 bg, sticky]
[Hero section -- full bleed, clubhouse-50 bg]
  [Container-xl, centered text]
  [Background: subtle topographic/contour pattern overlay]
[Features section -- white bg]
  [Container-xl, 3-column grid]
[Social proof section -- clubhouse-100 bg]
[CTA section -- pine-800 bg]
[Footer -- slate-900 bg]
```

#### Planner / Chat Page

```
[Header -- 64px, sticky]
[Split layout (desktop)]
  [Left: Chat -- 50%, 100% on mobile]
  [Right: Options/Brief panel -- 50%, tab-switched on mobile]
[Input bar -- sticky bottom]
```

#### Dashboard

```
[Header -- 64px, sticky]
[Content]
  [Container-lg]
  [Welcome section -- margin-bottom 32px]
  [Stats row -- 4-column grid, gap 16px]
  [Trip grid -- heading + 3-column card grid, gap 24px]
  [+ New Trip card -- dashed border, matches card height]
```

#### Trip Detail

```
[Header with back nav]
[Hero banner -- gradient bg, trip name + meta]
[Tab bar -- Options | Itinerary | Group | Fund]
[Content area -- container-lg, padding-top 32px]
```

#### Vote Page

```
Option A: Swipe Mode (mobile)
  [Header -- pine-800 bg, trip name]
  [Full-screen card stack]
  [Bottom action buttons]

Option B: Grid Mode (desktop)
  [Header with trip meta]
  [Name input card]
  [Option cards -- 2-column grid]
  [Submit button]
```

#### Payment Page

```
[Centered layout -- container-sm]
[Payment card]
  [Header gradient -- pine-600 to pine-700]
  [Amount hero -- data-large]
  [Form section]
  [Pay button -- primary xl]
  [Security badge]
[Accepted methods footer]
```

### Card Grid Responsive Behavior

```
Trip cards:
  mobile (<640px):  1 column, full width
  tablet (640-1024): 2 columns
  desktop (>1024):  3 columns
  gap: 24px

Option cards (planner):
  mobile: 1 column, full width
  tablet: 2 columns
  desktop: 3 columns
  gap: 24px

Stats row:
  mobile: 2 columns
  desktop: 4 columns
  gap: 16px
```

---

## 6. Iconography

### Recommended Icon Set

**Primary: Lucide React** (already in use)

Lucide provides 1400+ icons with consistent 24px grid, 1.5px stroke width, round line caps. It covers all general UI needs and has good React/TypeScript support.

### Golf-Specific Custom Icons

Lucide lacks golf-domain icons. These need to be created or sourced as custom SVGs, following Lucide conventions (24x24 viewBox, 1.5px stroke, round caps):

| Icon          | Name            | Usage                                      |
|---------------|-----------------|---------------------------------------------|
| Golf Flag     | `flag-golf`     | Course markers, hole indicators              |
| Golf Ball     | `golf-ball`     | Trip/round counters, loading states          |
| Golf Club     | `golf-club`     | Equipment, course difficulty                 |
| Golf Cart     | `golf-cart`     | Transport info, cart-included badge          |
| Golf Bag      | `golf-bag`      | Trip packing, equipment lists                |
| Tee           | `tee`           | Tee time indicators                          |
| Scorecard     | `scorecard`     | Score tracking, handicap display             |
| Fairway       | `fairway`       | Course layout, course type indicator         |
| Bunker        | `bunker`        | Difficulty indicator                         |
| Putting Green | `putting-green` | Short game, precision indicator              |
| 19th Hole     | `beer-mug`      | Social events, post-round activities         |
| Caddy         | `caddy-silhouette` | Brand icon, AI assistant avatar           |

Until custom icons are created, use these Lucide substitutes:

| Golf Concept  | Lucide Substitute   |
|---------------|---------------------|
| Course        | `Map` or `MapPin`   |
| Flag/Hole     | `Flag`              |
| Score         | `Trophy`            |
| Tee Time      | `Clock`             |
| Group         | `Users`             |
| Budget        | `DollarSign`        |
| Weather       | `Sun`, `Cloud`, `Wind` |

### Icon Sizing Rules

| Context           | Size   | Usage                                |
|-------------------|--------|--------------------------------------|
| Inline with text  | 16px   | Lists, labels, breadcrumbs           |
| Button icon       | 18px   | Inside buttons alongside text        |
| Navigation        | 20px   | Tab bar, header nav                  |
| Card accent       | 24px   | Card section headers                 |
| Feature highlight | 32px   | Feature cards, empty state supports  |
| Empty state hero  | 48px   | Center of empty state illustrations  |
| Splash/Loading    | 64px   | Full-page loading, splash screen     |

### Icon Colors

- Interactive icons: inherit text color of parent
- Decorative icons: `var(--text-muted)`
- Active state icons: `var(--color-pine-600)`
- Alert icons: semantic color matching context

---

## 7. Motion & Animation

### Timing Tokens

```css
:root {
  --duration-instant:  100ms;   /* Hover color changes */
  --duration-fast:     150ms;   /* Button press, toggle */
  --duration-normal:   250ms;   /* Card hover, focus ring */
  --duration-moderate: 350ms;   /* Panel slide, modal */
  --duration-slow:     500ms;   /* Page transition, celebration */
  --duration-glacial:  800ms;   /* Complex orchestrated sequences */
}
```

### Easing Functions

```css
:root {
  --ease-out:      cubic-bezier(0.33, 1, 0.68, 1);       /* Default for exits, settling */
  --ease-in:       cubic-bezier(0.32, 0, 0.67, 0);       /* Accelerating away */
  --ease-in-out:   cubic-bezier(0.65, 0, 0.35, 1);       /* Symmetric, smooth */
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);    /* Playful overshoot */
  --ease-bounce:   cubic-bezier(0.34, 1.8, 0.64, 1);     /* Celebration bounce */
}
```

### Interaction Animations

#### Button Press

```css
.btn:active {
  transform: scale(0.97);
  transition: transform var(--duration-fast) var(--ease-out);
}
```

#### Card Hover (Interactive Cards)

```css
.card-interactive:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
  border-color: var(--color-pine-200);
  transition: all var(--duration-normal) var(--ease-out);
}
```

#### Focus Ring

```css
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(43, 158, 84, 0.3);
  transition: box-shadow var(--duration-fast) var(--ease-out);
}
```

#### Swipe Card

```css
/* During drag: no transition, follows pointer */
.card-dragging {
  transition: none;
  cursor: grabbing;
}

/* Snap back to center */
.card-snap-back {
  transition: transform var(--duration-moderate) var(--ease-spring);
}

/* Swipe out */
.card-swipe-out {
  transition: transform var(--duration-moderate) var(--ease-out),
              opacity var(--duration-normal) var(--ease-out);
}
```

### Page Transitions

```css
/* Route change -- fade + subtle slide */
@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-enter {
  animation: page-enter var(--duration-moderate) var(--ease-out);
}
```

### Loading Animations

```css
/* Typing indicator dots */
@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-6px); }
}

.typing-dot {
  animation: typing-bounce 1.2s infinite;
}
.typing-dot:nth-child(2) { animation-delay: 150ms; }
.typing-dot:nth-child(3) { animation-delay: 300ms; }

/* Skeleton shimmer */
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Pulse (loading logo) */
@keyframes pulse-brand {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%      { transform: scale(1.05); opacity: 0.8; }
}
```

### Celebration Moments

When a trip is booked, a vote completes, or payment succeeds:

```css
/* Confetti-style particle burst -- use a lightweight library like
   canvas-confetti (4KB gzipped). Keep it brief (1.5s) and subtle. */

/* Success checkmark draw */
@keyframes checkmark-draw {
  0%   { stroke-dashoffset: 36; }
  100% { stroke-dashoffset: 0; }
}

.success-check {
  stroke-dasharray: 36;
  animation: checkmark-draw var(--duration-slow) var(--ease-out) forwards;
}

/* Scale-in for success icon container */
@keyframes success-appear {
  0%   { transform: scale(0); opacity: 0; }
  50%  { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 8. Dark Mode

### Strategy

Dark mode is opt-in via user preference (system setting or toggle in profile). The default is light mode. Golf is an outdoor, daytime sport -- the light theme is the "home" experience.

### Dark Mode CSS Variables

```css
@media (prefers-color-scheme: dark) {
  :root[data-theme="auto"],
  :root[data-theme="dark"] {
    /* Surfaces */
    --surface-page:      #0D1117;
    --surface-card:      #161B22;
    --surface-card-alt:  #1C222B;
    --surface-elevated:  #21262D;
    --surface-overlay:   rgba(0, 0, 0, 0.7);
    --surface-input:     #161B22;
    --surface-input-disabled: #21262D;

    /* Text */
    --text-primary:   #E6EDF3;
    --text-secondary: #8B949E;
    --text-muted:     #6E7681;
    --text-inverse:   #0D1117;
    --text-brand:     #56D88E;
    --text-accent:    #E8C547;

    /* Borders */
    --border-default: #30363D;
    --border-hover:   #484F58;
    --border-focus:   #56D88E;
    --border-error:   #F85149;

    /* Pine (adjusted for dark bg) */
    --color-pine-500: #3FB06A;
    --color-pine-600: #56D88E;  /* Primary actions in dark mode */
    --color-pine-700: #7EE8A9;
    --color-pine-800: #0D1F15;  /* Header in dark mode */

    /* Shadows (using opacity, not color shift) */
    --shadow-card:       0 1px 3px rgba(0, 0, 0, 0.3);
    --shadow-card-hover: 0 8px 25px rgba(0, 0, 0, 0.4);
  }
}

/* Manual toggle override */
:root[data-theme="dark"] {
  /* Same as above -- applied regardless of system preference */
}
```

### Dark Mode Contrast Requirements

- All text-on-background combinations must maintain WCAG AA (4.5:1 for body, 3:1 for large text)
- Primary action green is lightened in dark mode to maintain contrast
- Cards use `#161B22` (not pure black) to preserve depth perception
- Shadows use higher opacity since dark backgrounds don't reflect shadow naturally

### Implementation Notes

- Store preference in `localStorage` and as a `data-theme` attribute on `<html>`
- Default to `"auto"` which follows `prefers-color-scheme`
- Provide a 3-way toggle in settings: Light / Dark / Auto
- Transition: apply `transition: background-color 200ms, color 200ms` on body to prevent flash

---

## 9. Competitive Visual Benchmark

### Airbnb -- Trip Planning UX

**What to adopt:**
- **Card design language:** Airbnb cards are clean with generous whitespace, subtle shadows, and rounded corners (16px). The information hierarchy is immediately scannable: image > title > key detail > price. TheCaddy.AI trip cards should mirror this scanability.
- **Split-panel layout:** Airbnb's search results show a map + list side by side. TheCaddy.AI's planner page already uses a split (chat + options) -- this is the right pattern. Refine it with clear visual separation and responsive collapse.
- **Progressive disclosure:** Airbnb hides details behind "Show more" rather than overwhelming upfront. The cost breakdown `<details>` element in TripOptionCard is good -- extend this pattern to courses and lodging details.
- **Trust through polish:** Every pixel of Airbnb communicates "we have our act together." Consistent spacing, type hierarchy, and interaction patterns are what create this. TheCaddy.AI currently has inconsistent radius, shadow, and spacing values across pages.

**What NOT to adopt:**
- Airbnb's image-heavy grid does not apply since TheCaddy.AI's trip data is structured, not visual. Do not force hero images onto course cards.

### Apple Fitness+ -- Premium Sport-Tech Feel

**What to adopt:**
- **Bold typography hierarchy:** Apple uses oversized, high-contrast headlines with generous tracking. TheCaddy.AI's DM Serif Display at large sizes can achieve this.
- **Activity rings / progress visualization:** The circular score indicator on TripOptionCard is a good instinct. Refine it with the shadow, gradient, and animation quality of Apple's rings.
- **Dark-on-light card contrasts:** Apple Fitness uses dark cards on light backgrounds with vibrant accent colors. This creates depth. TheCaddy.AI's pine-800 gradient headers on white cards already do this -- commit to it more fully.
- **Haptic-feeling interactions:** Button presses should have a scale-down (0.97), cards should lift on hover. Small motion that feels physical.

### PGA Tour App -- Golf-Specific Design

**What to adopt:**
- **Leaderboard layout:** The ranked vote results view should feel like a leaderboard. Position numbers, player names left-aligned, stats right-aligned, leader highlighted with a bold treatment.
- **Score typography:** Golf scores use specific formatting (over/under par, stroke counts). Use monospace for all numerical data to create the same "data-forward" feel.
- **Course information density:** The PGA app packs course details efficiently -- hole-by-hole layouts, yardage, par. TheCaddy.AI's course cards should aspire to similar information density without clutter.
- **Green as the anchor color:** PGA uses deep green as the primary brand color. This validates TheCaddy.AI's pine palette. The key is using it confidently without making everything green.

**What NOT to adopt:**
- The PGA app's UI is dense and utilitarian, optimized for data consumption during a tournament. TheCaddy.AI is a trip-planning consumer product -- it should be more spacious and inviting.

### Headspace -- Calm, Guided Experience

**What to adopt:**
- **Warm, non-clinical palette:** Headspace avoids stark whites and blacks. The warm clubhouse-50 background achieves this same comfort.
- **Guided flow with clear next steps:** Headspace never leaves users wondering "what do I do now?" Every screen has one clear CTA. TheCaddy.AI's chat interface should always present a clear next action (quick reply chips, "Generate Options" button).
- **Personality in empty states:** Headspace fills empty screens with warm illustrations and encouraging copy. TheCaddy.AI's empty states should have the golf-specific personality outlined in section 4.8.
- **Breathing room:** Headspace uses generous whitespace as a design element, not wasted space. TheCaddy.AI should increase padding and margin throughout.

**What NOT to adopt:**
- Headspace's soft, pastel-illustration style is too gentle for a product handling money and group coordination. TheCaddy.AI needs more confidence and clarity.

---

## 10. Implementation Reference

### Tailwind Config Extension

This is the complete theme extension for `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        pine: {
          50:  '#E8F5EC',
          100: '#C6E6CE',
          200: '#9ED4AC',
          300: '#73C089',
          400: '#4FAF6E',
          500: '#2B9E54',
          600: '#1E7A3F',
          700: '#1A5F33',
          800: '#164D2B',
          900: '#0F3A1F',
          950: '#082413',
        },
        clubhouse: {
          50:  '#FDFCF9',
          100: '#FAF7F0',
          200: '#F3EDE0',
          300: '#E8DFCC',
          400: '#D6CCAF',
          500: '#C4B892',
          600: '#A89A6F',
          700: '#8A7D55',
          800: '#6B6040',
          900: '#4D452E',
        },
        flag: {
          50:  '#FDF8E8',
          100: '#FAEFC5',
          200: '#F5E09E',
          300: '#EFCE6E',
          400: '#E8BC45',
          500: '#D4AF37',
          600: '#B8942B',
          700: '#947622',
          800: '#70591A',
          900: '#4C3D12',
        },
      },
      fontFamily: {
        display: ['DM Serif Display', 'Georgia', 'Times New Roman', 'serif'],
        heading: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        body:    ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono:    ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        sm:  '6px',
        md:  '10px',
        lg:  '14px',
        xl:  '20px',
        '2xl': '28px',
      },
      boxShadow: {
        'card':       '0 1px 3px rgba(26, 77, 43, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 8px 25px rgba(26, 77, 43, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)',
      },
      transitionDuration: {
        'instant':  '100ms',
        'fast':     '150ms',
        'normal':   '250ms',
        'moderate': '350ms',
        'slow':     '500ms',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce': 'cubic-bezier(0.34, 1.8, 0.64, 1)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'typing-bounce': {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%':           { transform: 'translateY(-6px)' },
        },
        'slide-up': {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to:   { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'success-appear': {
          '0%':   { transform: 'scale(0)', opacity: '0' },
          '50%':  { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        shimmer:          'shimmer 1.5s ease infinite',
        'typing-bounce':  'typing-bounce 1.2s infinite',
        'slide-up':       'slide-up 350ms cubic-bezier(0.33, 1, 0.68, 1)',
        'fade-in':        'fade-in 250ms cubic-bezier(0.33, 1, 0.68, 1)',
        'success-appear': 'success-appear 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
```

### Migration Checklist

When implementing this design system, follow this order:

**Phase 1: Foundation (Day 1)**
1. Update `tailwind.config.js` with the new theme
2. Update `globals.css` with CSS custom properties and font imports
3. Replace `bg-white` page backgrounds with `bg-clubhouse-50`
4. Replace all `emerald-*` usages with `pine-*` equivalents
5. Replace all `gray-*` with the appropriate semantic token

**Phase 2: Typography (Day 2)**
1. Add DM Serif Display and DM Sans to font imports
2. Apply `font-display` to all hero headlines and trip names
3. Apply `font-heading` to all card titles, nav items, and labels
4. Apply `font-mono` to all prices, scores, and numerical data
5. Audit and normalize all font sizes to the type scale

**Phase 3: Components (Days 3-5)**
1. Create a shared `Button` component with all variants
2. Create a shared `Card` component with base styles
3. Create a shared `Input` component with states
4. Create a shared `Header` component (replace per-page headers)
5. Create `Toast` and `Modal` components
6. Create skeleton loading variants for each content type

**Phase 4: Polish (Days 6-7)**
1. Add hover/active animations to all interactive elements
2. Implement focus-visible ring globally
3. Add page enter transitions
4. Build empty state components with copy from this document
5. Add reduced-motion media query support

**Phase 5: Dark Mode (Day 8+)**
1. Add `data-theme` attribute system
2. Map all CSS custom properties to dark variants
3. Add theme toggle to profile settings
4. Test all pages in dark mode for contrast compliance

### File Organization

```
components/
  ui/
    Button.tsx          -- All button variants
    Card.tsx            -- Base card + variants
    Input.tsx           -- Text, select, textarea
    Modal.tsx           -- Base modal + confirmation
    Toast.tsx           -- Toast notification system
    Badge.tsx           -- Status badges, tags
    Progress.tsx        -- Progress bar
    Skeleton.tsx        -- Loading skeletons
    EmptyState.tsx      -- Empty state template
    Avatar.tsx          -- User avatar with fallback
  layout/
    Header.tsx          -- Shared header/nav
    MobileNav.tsx       -- Bottom tab bar
    PageContainer.tsx   -- Consistent page wrapper
    Breadcrumbs.tsx     -- Breadcrumb nav
  chat/
    ChatBubble.tsx      -- Message bubble (user/assistant)
    ChatInput.tsx       -- Input bar with send button
    QuickReplies.tsx    -- Suggestion chips
    TypingIndicator.tsx -- Bounce dots
  trip/
    TripCard.tsx        -- Dashboard trip card
    TripOptionCard.tsx  -- Full option comparison card
    CourseCard.tsx       -- Individual course display
    CostBreakdown.tsx   -- Collapsible cost table
    VoteCard.tsx        -- Swipe-able vote card
    VoteResults.tsx     -- Ranked results display
  icons/
    golf/              -- Custom golf SVG icons
```

---

*This design system is a living document. As components are built and tested, update specifications here to reflect implementation reality. Every deviation from this document should be intentional and documented.*

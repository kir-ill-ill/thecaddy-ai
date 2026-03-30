# TheCaddy.ai — Brand Kit

## Brand Identity

| Attribute     | Value                                                                          |
| ------------- | ------------------------------------------------------------------------------ |
| **Name**      | TheCaddy.ai (short form: "The Caddy")                                         |
| **Positioning** | AI caddy for trip planning — not just a booking tool                         |
| **Personality** | Knowledgeable, efficient, slightly witty — like a great caddy who knows the course |
| **Tone**      | Confident but not cocky, helpful, golf-literate                                |
| **Tagline**   | "I planned a legendary golf weekend in 12 minutes"                             |

---

## Color Palette

### Primary

| Name            | Hex       | RGB             | Usage                                    |
| --------------- | --------- | --------------- | ---------------------------------------- |
| Masters Green   | `#006747` | 0, 103, 71      | Primary brand, headers, nav, key UI      |
| Championship Gold | `#C5A55A` | 197, 165, 90   | Secondary accents, premium elements, CTAs on dark |

### Supporting

| Name            | Hex       | RGB             | Usage                                    |
| --------------- | --------- | --------------- | ---------------------------------------- |
| Sky Blue        | `#87CEEB` | 135, 206, 235   | CTAs, interactive elements, links, hover states |
| Rich Black      | `#1A1A2E` | 26, 26, 46      | Body text, dark backgrounds, footers     |
| Fairway Cream   | `#F5F1E6` | 245, 241, 230   | Light backgrounds, cards, content areas  |

### Extended Palette

| Name            | Hex       | Usage                                    |
| --------------- | --------- | ---------------------------------------- |
| Deep Green      | `#004D35` | Gradient endpoint, hover states          |
| Soft Gold       | `#D4BC7C` | Lighter gold for backgrounds, highlights |
| Mist Gray       | `#E8E4DA` | Borders, dividers, subtle backgrounds    |
| Birdie Red      | `#C0392B` | Error states, alerts, negative feedback  |
| Eagle Blue      | `#2980B9` | Links on light backgrounds, info states  |

### Gradient Definitions

```css
/* Primary gradient — headers, hero sections */
--gradient-green: linear-gradient(135deg, #006747 0%, #004D35 100%);

/* Gold accent gradient — premium badges, highlights */
--gradient-gold: linear-gradient(135deg, #C5A55A 0%, #D4BC7C 100%);

/* Subtle background gradient */
--gradient-cream: linear-gradient(180deg, #FFFFFF 0%, #F5F1E6 100%);
```

---

## Typography

### Font Stack

| Role        | Font             | Weight          | Fallback              | Usage                          |
| ----------- | ---------------- | --------------- | --------------------- | ------------------------------ |
| Headings    | Montserrat       | 600 (SemiBold), 700 (Bold) | system-ui, sans-serif | Page titles, section headers   |
| Body        | Inter            | 400, 500        | system-ui, sans-serif | Paragraphs, descriptions, UI  |
| Monospace   | JetBrains Mono   | 400, 500        | monospace             | Scores, times, technical data  |

### Type Scale

| Element  | Size   | Weight   | Line Height | Letter Spacing |
| -------- | ------ | -------- | ----------- | -------------- |
| H1       | 48px   | 700 Bold | 1.1         | -0.02em        |
| H2       | 36px   | 600 Semi | 1.2         | -0.01em        |
| H3       | 24px   | 600 Semi | 1.3         | 0              |
| H4       | 20px   | 600 Semi | 1.4         | 0              |
| Body L   | 18px   | 400      | 1.6         | 0              |
| Body     | 16px   | 400      | 1.5         | 0              |
| Body S   | 14px   | 400      | 1.5         | 0              |
| Caption  | 12px   | 500      | 1.4         | 0.02em         |
| Mono     | 14px   | 400      | 1.5         | 0.05em         |

### Font Loading (Next.js)

```tsx
import { Montserrat, Inter, JetBrains_Mono } from 'next/font/google';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});
```

---

## Visual Elements

### Brand Mark

- **Primary:** Golf flag icon — simple, recognizable silhouette that works at all sizes
- **Construction:** Flag on pin, angled slightly right, conveying forward motion
- **Minimum size:** 24px height for digital, 10mm for print
- **Clear space:** 1x flag height on all sides

### Logo Lockups

| Variant        | Description                                                      |
| -------------- | ---------------------------------------------------------------- |
| **Full**       | Flag icon + "TheCaddy" in Montserrat Bold + ".ai" in Championship Gold |
| **Mark only**  | Golf flag in Masters Green circle                                |
| **Wordmark**   | "TheCaddy.ai" text only, no icon                                |
| **Dark mode**  | White wordmark on Rich Black, flag in Championship Gold          |
| **Monochrome** | All white or all black for single-color applications             |

### Patterns & Textures

- **Topographic lines:** Subtle contour line patterns inspired by course elevation maps
- **Usage:** Background textures, section dividers, hero overlays at 5-10% opacity
- **Grid:** 8px base grid for all UI spacing

### UI Components

- **Trip cards:** Scorecard-inspired layout — clean rows, course name prominent, key stats in monospace
- **Itinerary blocks:** Timeline-style with green accent line, time in monospace
- **CTAs:** Rounded corners (8px), Sky Blue fill, white text, subtle shadow
- **Badges:** Pill-shaped, Championship Gold for premium, Masters Green for standard

### Iconography

- Style: Outlined, 2px stroke weight
- Size: 20px default, 16px compact, 24px feature
- Set: Golf-themed where appropriate (flag, tee, course, scorecard, group)
- Fallback: Lucide or Heroicons for generic UI icons

---

## Voice & Tone

### Personality Attributes

| Trait          | Description                                              |
| -------------- | -------------------------------------------------------- |
| Knowledgeable  | Knows courses, knows logistics, has the answer ready     |
| Efficient      | Gets to the point, respects the user's time              |
| Witty          | Light humor, never forced — a nod, not a punchline       |
| Confident      | Recommends with conviction, doesn't hedge unnecessarily  |
| Inclusive       | Golf for everyone, not just country club exclusivity     |

### Do Say

- "Your tee time is locked in"
- "Three options, zero stress"
- "The group has spoken"
- "Fairway-ready in under 15 minutes"
- "Let's get this round on the books"
- "Your caddy has a few ideas"

### Don't Say

- "Please select your preferred option from the list below"
- "We offer a comprehensive suite of planning tools"
- "Dear valued user" or any corporate greeting
- "Synergy", "leverage", "optimize your experience"
- Don't overexplain — the caddy knows what you need

### Golf Terminology — Use Freely

These terms add authenticity and personality:

| Term           | Context                                                  |
| -------------- | -------------------------------------------------------- |
| Drive          | "Let's drive this trip forward"                          |
| Approach       | "Here's our approach for Saturday"                       |
| Green          | "You're on the green — just confirm and go"              |
| Pin placement  | "Pin placement for your group: 3 courses, 2 days"        |
| Tee time       | Literal usage for scheduling                             |
| Birdie         | Something went better than expected                      |
| Bogey          | A hiccup or issue to address                             |
| Mulligan       | "Need a mulligan? Regenerate your itinerary"             |

### Tone by Context

| Context           | Tone                                    | Example                                          |
| ----------------- | --------------------------------------- | ------------------------------------------------ |
| Onboarding        | Warm, encouraging                       | "Welcome to the clubhouse. Let's plan something epic." |
| Trip planning     | Efficient, confident                    | "Got it. Three courses, two days. Here's what I'd play." |
| Error / empty     | Calm, helpful                           | "Looks like that course isn't in the system yet. Try another?" |
| Success           | Celebratory but brief                   | "Booked. Your crew is going to love this."       |
| Premium upsell    | Aspirational, not pushy                 | "Go Pro for unlimited trips and real-time tee times." |
| Group comms       | Direct, action-oriented                 | "Poll's in. Pebble Beach wins by 2 votes."       |

---

## CSS Custom Properties

```css
:root {
  /* Colors */
  --color-primary: #006747;
  --color-primary-dark: #004D35;
  --color-secondary: #C5A55A;
  --color-secondary-light: #D4BC7C;
  --color-accent: #87CEEB;
  --color-text: #1A1A2E;
  --color-background: #F5F1E6;
  --color-surface: #FFFFFF;
  --color-border: #E8E4DA;
  --color-error: #C0392B;
  --color-info: #2980B9;

  /* Typography */
  --font-heading: var(--font-montserrat, 'Montserrat', system-ui, sans-serif);
  --font-body: var(--font-inter, 'Inter', system-ui, sans-serif);
  --font-mono: var(--font-jetbrains-mono, 'JetBrains Mono', monospace);

  /* Spacing (8px grid) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(26, 26, 46, 0.05);
  --shadow-md: 0 4px 6px rgba(26, 26, 46, 0.07);
  --shadow-lg: 0 10px 25px rgba(26, 26, 46, 0.1);
}
```

---

## Tailwind Configuration

```js
// tailwind.config.js (relevant extensions)
module.exports = {
  theme: {
    extend: {
      colors: {
        caddy: {
          green: '#006747',
          'green-dark': '#004D35',
          gold: '#C5A55A',
          'gold-light': '#D4BC7C',
          sky: '#87CEEB',
          black: '#1A1A2E',
          cream: '#F5F1E6',
          mist: '#E8E4DA',
          red: '#C0392B',
          blue: '#2980B9',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
};
```

---

## Asset Checklist

- [ ] Logo — full lockup (SVG, PNG @1x @2x)
- [ ] Logo — mark only (SVG, PNG @1x @2x)
- [ ] Logo — dark mode variants
- [ ] Logo — monochrome variants
- [ ] Favicon (ICO, 32x32 PNG, 180x180 Apple Touch)
- [ ] OG image template (1200x630)
- [ ] Topographic pattern tile (SVG)
- [ ] Icon set — golf-themed (SVG)
- [ ] Email header template
- [ ] Social media profile images (round, 400x400)

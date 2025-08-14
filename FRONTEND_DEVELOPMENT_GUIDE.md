# Frontend Development Guide

This guide covers how to create new pages, sections, and UI elements in our frontend application, along with theming guidelines and maintenance practices.

## Table of Contents

- [Creating a New Page](#creating-a-new-page)
- [Theming System](#theming-system)
- [Creating New Sections](#creating-new-sections)
- [Creating New UI Elements](#creating-new-ui-elements)
- [Spacing and Layout Rules](#spacing-and-layout-rules)
- [Naming Conventions](#naming-conventions)
- [Maintenance Guidelines](#maintenance-guidelines)
- [LLM Instructions](#llm-instructions)

## Creating a New Page

### Step 1: Create the Page File

Create a new page in `src/app/(frontend)/` following the Next.js App Router convention:

```tsx
// src/app/(frontend)/about/page.tsx
import {
  Hero,
  Features,
  Testimonials,
  FinalCTA,
} from '../components/sections'

export default function AboutPage() {
  return (
    <>
      <Hero />
      <Features bg="muted" />
      <Testimonials />
      <FinalCTA />
    </>
  )
}
```

### Step 2: Import Required Sections

Import sections from the centralized export file:

```tsx
import {
  Hero,
  SocialProof,
  Features,
  Alternating,
  Testimonials,
  Pricing,
  FAQ,
  FinalCTA,
} from '../components/sections'
```

### Step 3: Compose the Page Layout

Follow these composition rules:
- Start with a `Hero` section for landing pages
- Use `SocialProof` early to build credibility
- Alternate between `bg="background"` and `bg="muted"` for visual rhythm
- End with `FinalCTA` for conversion
- Use `bg="gradient"` sparingly for hero sections only

## Theming System

### Design Tokens

Our theming system uses CSS custom properties defined in `src/app/(frontend)/styles.css`:

```css
:root {
  /* Brand colors */
  --brand: 222 90% 56%;
  --brand-foreground: 0 0% 100%;

  /* Core colors */
  --background: 0 0% 100%;
  --foreground: 222 15% 12%;
  --muted: 220 14% 96%;
  --muted-foreground: 220 9% 35%;

  /* Component colors */
  --card: 0 0% 100%;
  --card-foreground: 222 15% 12%;
  --popover: 0 0% 100%;
  --popover-foreground: 222 15% 12%;

  /* Interactive colors */
  --border: 220 13% 91%;
  --input: 220 13% 91%;
  --ring: 222 90% 56%;

  /* Design tokens */
  --radius: 14px;
  --shadow-soft: 0 2px 10px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.04);
  --shadow-lift: 0 10px 30px rgba(0,0,0,.08);
}
```

### Dark Mode

Dark mode tokens are automatically applied when the `.dark` class is present:

```css
.dark {
  --background: 222 15% 9%;
  --foreground: 0 0% 100%;
  --muted: 222 15% 12%;
  --muted-foreground: 222 10% 70%;
  /* ... other dark mode overrides */
}
```

### Typography Scale

Use semantic typography classes:

```css
.heading-1 { @apply text-5xl md:text-7xl font-bold tracking-tight; }
.heading-2 { @apply text-4xl md:text-5xl font-bold tracking-tight; }
.heading-3 { @apply text-2xl md:text-3xl font-semibold; }
.body-lg   { @apply text-lg text-muted-foreground; }
```

### Background Variants

Available background styles for sections:

- `background` - Default white/theme background
- `muted` - Subtle gray background for contrast
- `gradient` - Brand gradient with radial glow
- `grid` - Subtle grid pattern with vignette

## Creating New Sections

### Section Structure

Every section should follow this pattern:

```tsx
// src/app/(frontend)/components/sections/NewSection.tsx
'use client'
import { SectionWrapper } from '../layout/section'
import { Button } from '@/components/ui/button'
import { m, useFadeInUpVariants, viewport, hoverPop } from '@/lib/motion'

export default function NewSection() {
  const title = useFadeInUpVariants({ distance: 16, duration: 0.32 })
  const sub = useFadeInUpVariants({ distance: 10, duration: 0.3, delay: 0.05 })

  return (
    <SectionWrapper bg="background" padding="default">
      <div className="mx-auto max-w-[1200px] px-6">
        <m.h2
          className="heading-2"
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={title}
        >
          Section Title
        </m.h2>

        <m.p
          className="mt-6 body-lg max-w-prose"
          initial="hidden"
          whileInView="show"
          viewport={viewport}
          variants={sub}
        >
          Section description goes here.
        </m.p>

        {/* Section content */}
      </div>
    </SectionWrapper>
  )
}
```

### SectionWrapper Props

```tsx
interface SectionWrapperProps {
  children: React.ReactNode
  className?: string
  fullWidth?: boolean        // When true, content spans full width
  bg?: 'background' | 'muted' | 'gradient' | 'grid'
  padding?: 'tight' | 'default' | 'loose'
  edgeTop?: boolean          // Soft gradient fade at top
  edgeBottom?: boolean       // Soft gradient fade at bottom
}
```

### Animation Patterns

Use consistent animation patterns:

```tsx
// For titles
const title = useFadeInUpVariants({ distance: 16, duration: 0.32 })

// For subtitles
const sub = useFadeInUpVariants({ distance: 10, duration: 0.3, delay: 0.05 })

// For staggered content
const container = makeStaggerContainer({ delayChildren: 0.1, staggerChildren: 0.08 })

// For interactive elements
<m.div {...hoverPop}>
  <Button>Click me</Button>
</m.div>
```

### Export the Section

Add your new section to the index file:

```tsx
// src/app/(frontend)/components/sections/index.ts
export { default as NewSection } from "./NewSection";
```

## Creating New UI Elements

### Component Structure

Follow this pattern for new UI components:

```tsx
// src/app/(frontend)/components/ui/new-component.tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const newComponentVariants = cva(
  'base-styles-here',
  {
    variants: {
      variant: {
        default: 'default-variant-styles',
        secondary: 'secondary-variant-styles',
      },
      size: {
        default: 'default-size-styles',
        sm: 'small-size-styles',
        lg: 'large-size-styles',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface NewComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof newComponentVariants> {
  // Add custom props here
}

const NewComponent = React.forwardRef<HTMLDivElement, NewComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        className={cn(newComponentVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
NewComponent.displayName = 'NewComponent'

export { NewComponent, newComponentVariants }
```

### Styling Guidelines

- Use `class-variance-authority` for variant management
- Apply design tokens via Tailwind classes
- Use semantic color names (`bg-brand`, `text-muted-foreground`)
- Include focus states and accessibility features
- Add hover and active states for interactive elements

### Export the Component

Add to the UI components index:

```tsx
// src/app/(frontend)/components/ui/index.ts
export { NewComponent } from './new-component'
```

## Spacing and Layout Rules

### Vertical Spacing

Use consistent padding scales:

- `padding="tight"` - `py-16 md:py-20` (64px/80px)
- `padding="default"` - `py-20 md:py-28` (80px/112px)
- `padding="loose"` - `py-28 md:py-36` (112px/144px)

### Horizontal Spacing

- Container max-width: `max-w-[1200px]`
- Container padding: `px-6`
- Content max-width for text: `max-w-prose` (65ch)

### Component Spacing

- Between sections: Use `SectionWrapper` padding
- Within sections: Use Tailwind spacing scale
- Common gaps: `gap-4`, `gap-6`, `gap-8`
- Common margins: `mt-6`, `mt-8`, `mt-12`

## Naming Conventions

### Files and Directories

- **Pages**: `kebab-case` (e.g., `about-us/page.tsx`)
- **Sections**: `PascalCase` (e.g., `Hero.tsx`, `FeatureGrid.tsx`)
- **UI Components**: `kebab-case` (e.g., `button.tsx`, `card.tsx`)
- **Layout Components**: `camelCase` (e.g., `section.tsx`, `nav.tsx`)

### Components and Functions

- **React Components**: `PascalCase` (e.g., `Hero`, `FeatureCard`)
- **Hooks**: `camelCase` with `use` prefix (e.g., `useFadeInUpVariants`)
- **Utilities**: `camelCase` (e.g., `makeStaggerContainer`)

### CSS Classes

- **Utility classes**: Use Tailwind conventions
- **Custom classes**: `kebab-case` (e.g., `heading-1`, `body-lg`)
- **Component variants**: Use semantic names (`default`, `outline`, `ghost`)

## Maintenance Guidelines

### Code Organization

1. **Keep sections focused**: Each section should have a single responsibility
2. **Reuse components**: Use existing UI components before creating new ones
3. **Consistent imports**: Use centralized export files
4. **Type safety**: Use TypeScript interfaces for all props

### Performance

1. **Lazy loading**: Use `'use client'` only when necessary
2. **Animation optimization**: Use `viewport` prop for scroll-triggered animations
3. **Bundle size**: Import only what you need from libraries

### Accessibility

1. **Semantic HTML**: Use appropriate tags (`<section>`, `<article>`, etc.)
2. **Focus management**: Include focus states for interactive elements
3. **Reduced motion**: Respect user preferences with `useReducedMotion`
4. **ARIA labels**: Add appropriate ARIA attributes when needed

### Testing

1. **Component testing**: Test individual components in isolation
2. **Integration testing**: Test page compositions
3. **Visual regression**: Ensure consistent styling across changes

## LLM Instructions

When asking an LLM to generate new sections or UI components, use these instructions:

### For New Sections

```
Create a new React section component following these specifications:

1. File location: src/app/(frontend)/components/sections/[SectionName].tsx
2. Use the SectionWrapper component with appropriate bg and padding props
3. Include framer-motion animations using useFadeInUpVariants for titles and content
4. Use semantic typography classes (heading-1, heading-2, body-lg)
5. Follow the existing color system (brand, muted, background variants)
6. Include proper TypeScript types and React.forwardRef if needed
7. Add the component to the sections index file
8. Use consistent spacing patterns (mt-6, gap-4, etc.)
9. Include hover states for interactive elements using hoverPop
10. Ensure accessibility with proper semantic HTML and focus states

Requirements:
- [Specific requirements for this section]
- [Content structure needed]
- [Interactive elements required]
- [Animation preferences]
```

### For New UI Components

```
Create a new React UI component following these specifications:

1. File location: src/app/(frontend)/components/ui/[component-name].tsx
2. Use class-variance-authority for variant management
3. Include TypeScript interfaces extending appropriate HTML attributes
4. Use React.forwardRef for proper ref forwarding
5. Apply design tokens via Tailwind classes (bg-brand, text-muted-foreground, etc.)
6. Include focus states and accessibility features
7. Add hover and active states for interactive elements
8. Use semantic color names from the design system
9. Include proper displayName for debugging
10. Export both the component and its variants

Component requirements:
- [Specific functionality needed]
- [Variant options required]
- [Size options needed]
- [Interactive states required]
- [Accessibility considerations]
```

### For Page Creation

```
Create a new page following these specifications:

1. File location: src/app/(frontend)/[page-name]/page.tsx
2. Import sections from the centralized sections index
3. Compose the page using appropriate section combinations
4. Follow the visual rhythm pattern (alternate bg="background" and bg="muted")
5. Start with Hero section for landing pages
6. End with FinalCTA for conversion
7. Use appropriate padding and spacing
8. Ensure proper semantic structure

Page requirements:
- [Page purpose and content]
- [Required sections]
- [Special layout needs]
- [Interactive features]
- [SEO considerations]
```

### For Theming Changes

```
Update the theming system following these specifications:

1. Modify design tokens in src/app/(frontend)/styles.css
2. Update both light and dark mode variants
3. Ensure color contrast meets accessibility standards
4. Test changes across all component variants
5. Update any hardcoded color references
6. Document changes in this guide

Theming requirements:
- [Color palette changes]
- [Typography updates]
- [Spacing adjustments]
- [Component-specific theming]
- [Dark mode considerations]
```

---

This guide should be updated whenever new patterns emerge or existing conventions change. Always refer to the current codebase for the most up-to-date examples and patterns.

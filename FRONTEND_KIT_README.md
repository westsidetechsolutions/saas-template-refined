# Frontend Kit - Complete Component Library & Design System

This is a comprehensive frontend development kit built with Next.js, React, TypeScript, Tailwind CSS, and Framer Motion. It provides everything needed to create beautiful, modern webpages with consistent design, smooth animations, and excellent user experience.

## 🎨 Design System

### Color Palette
- **Brand Colors**: Primary brand color with foreground variants
- **Semantic Colors**: Background, foreground, muted, card, popover, border, input, ring
- **Dark Mode**: Automatic dark mode support with `.dark` class
- **Accessibility**: WCAG compliant color contrast ratios

### Typography Scale
```css
.heading-1 { text-5xl md:text-7xl font-bold tracking-tight; }
.heading-2 { text-4xl md:text-5xl font-bold tracking-tight; }
.heading-3 { text-2xl md:text-3xl font-semibold; }
.body-lg   { text-lg text-muted-foreground; }
```

### Design Tokens
- **Border Radius**: `--radius: 14px` with semantic variants (sm, md, lg, xl)
- **Shadows**: Soft shadows (`--shadow-soft`) and lift shadows (`--shadow-lift`)
- **Spacing**: Consistent spacing scale with Tailwind utilities

## 🏗️ Layout System

### Section Wrapper Component
The core layout component that provides consistent spacing, backgrounds, and structure:

```tsx
<SectionWrapper 
  bg="background" | "muted" | "gradient" | "grid"
  padding="tight" | "default" | "loose"
  fullWidth={boolean}
  edgeTop={boolean}
  edgeBottom={boolean}
>
  {/* Content */}
</SectionWrapper>
```

### Background Variants
- **`background`**: Default white/theme background
- **`muted`**: Subtle gray background for visual separation
- **`gradient`**: Brand gradient with radial glow effect
- **`grid`**: Subtle grid pattern with top vignette

### Padding Scales
- **`tight`**: `py-16 md:py-20` (64px/80px)
- **`default`**: `py-20 md:py-28` (80px/112px)
- **`loose`**: `py-28 md:py-36` (112px/144px)

### Container System
- **Max Width**: `max-w-[1200px]`
- **Horizontal Padding**: `px-6`
- **Content Width**: `max-w-prose` (65ch) for readable text

## 🎭 Animation System

### Framer Motion Integration
All animations are built with Framer Motion and respect user motion preferences:

```tsx
import { m, useFadeInUpVariants, viewport, hoverPop } from '@/lib/motion'
```

### Animation Patterns
- **Fade In Up**: `useFadeInUpVariants({ distance, duration, delay })`
- **Stagger Container**: `makeStaggerContainer({ delayChildren, staggerChildren })`
- **Simple Fade**: `makeFade({ duration, delay })`
- **Hover Effects**: `hoverPop` and `hoverLift` for interactive elements

### Scroll-Triggered Animations
```tsx
<m.div
  initial="hidden"
  whileInView="show"
  viewport={viewport}
  variants={animationVariants}
>
```

### Motion-Safe Animations
Automatically respects `prefers-reduced-motion` user preference for accessibility.

## 🧩 Pre-Built Sections

### Available Section Components
1. **Hero** - Landing page hero with title, subtitle, and CTAs
2. **SocialProof** - Customer logos, testimonials, or social validation
3. **Features** - Feature grid with icons, titles, and descriptions
4. **Alternating** - Alternating content layout for features/stories
5. **Testimonials** - Customer testimonial carousel or grid
6. **Pricing** - Pricing table with plans and features
7. **FAQ** - Frequently asked questions with accordion
8. **FinalCTA** - Final call-to-action section

### Section Usage
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
} from './components/sections'

// Compose page
<>
  <Hero />
  <SocialProof />
  <Features bg="muted" />
  <Alternating />
  <Testimonials />
  <Pricing />
  <FAQ />
  <FinalCTA />
</>
```

## 🎨 UI Component Library

### Core UI Components
All components use `class-variance-authority` for variant management:

1. **Button** - Multiple variants (default, outline, ghost) and sizes (sm, default, lg, icon)
2. **Card** - Content containers with shadows and hover effects
3. **Input** - Form inputs with focus states
4. **Dialog** - Modal dialogs with backdrop
5. **Dropdown Menu** - Context menus and navigation
6. **Accordion** - Collapsible content sections
7. **Tabs** - Tabbed content navigation
8. **Avatar** - User profile images
9. **Badge** - Status indicators and labels
10. **Select** - Dropdown select components
11. **Checkbox** - Form checkboxes
12. **Radio Group** - Radio button groups
13. **Switch** - Toggle switches
14. **Textarea** - Multi-line text inputs
15. **Tooltip** - Hover information displays
16. **Sheet** - Slide-out panels
17. **Navigation Menu** - Complex navigation structures
18. **Label** - Form labels
19. **Theme Toggle** - Dark/light mode switcher
20. **Edge Fade** - Gradient fade effects for section separation

### Component Variants
Each component supports multiple variants and sizes:
```tsx
<Button variant="default" | "outline" | "ghost" size="sm" | "default" | "lg" | "icon">
```

### Styling System
- **Design Tokens**: All colors use semantic names (`bg-brand`, `text-muted-foreground`)
- **Focus States**: Consistent focus rings for accessibility
- **Hover Effects**: Smooth transitions and visual feedback
- **Active States**: Press feedback for interactive elements

## 🎯 Layout Components

### Specialized Layout Components
1. **Section** - Main section wrapper with backgrounds and spacing
2. **Grid** - CSS Grid layouts with responsive breakpoints
3. **Stack** - Vertical stacking with consistent spacing
4. **Cluster** - Horizontal clustering with wrapping
5. **Nav** - Navigation bar with responsive design
6. **Footer** - Page footer with links and branding
7. **Skip Link** - Accessibility skip navigation

## 🎨 Visual Effects

### Background Effects
- **Radial Gradient**: `.bg-radial-brand` - Soft brand glow from top
- **Grid Pattern**: `.bg-grid-muted` - Subtle grid with vignette
- **Edge Fades**: Gradient fades for section separation

### Shadow System
- **Soft Shadows**: `shadow-soft` for subtle depth
- **Lift Shadows**: `shadow-lift` for hover effects
- **Consistent Elevation**: Standardized shadow hierarchy

## 🔧 Utility Functions

### Motion Utilities
```tsx
// Fade in up with customizable parameters
const title = useFadeInUpVariants({ distance: 16, duration: 0.32 })

// Stagger children animations
const container = makeStaggerContainer({ delayChildren: 0.1, staggerChildren: 0.08 })

// Hover micro-interactions
<m.div {...hoverPop}>
  <Button>Interactive Button</Button>
</m.div>
```

### CSS Utilities
- **`cn()`**: Class name merging utility
- **`max-w-prose`**: Optimal reading width (65ch)
- **Focus utilities**: Consistent focus ring management

## 🎨 Theming Capabilities

### Custom Theming
- **CSS Custom Properties**: Easy color scheme modification
- **Dark Mode**: Automatic dark mode with `.dark` class
- **Semantic Colors**: Meaningful color names for easy theming
- **Component Variants**: Consistent theming across all components

### Color System
```css
:root {
  --brand: 222 90% 56%;
  --background: 0 0% 100%;
  --foreground: 222 15% 12%;
  --muted: 220 14% 96%;
  /* ... more semantic colors */
}
```

## 🚀 Page Creation Workflow

### 1. Create Page Structure
```tsx
// src/app/(frontend)/[page-name]/page.tsx
import { Hero, Features, Testimonials, FinalCTA } from '../components/sections'

export default function PageName() {
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

### 2. Section Composition Rules
- **Start with Hero** for landing pages
- **Use SocialProof early** for credibility
- **Alternate backgrounds** (`background` ↔ `muted`) for rhythm
- **End with FinalCTA** for conversion
- **Use gradient sparingly** (hero sections only)

### 3. Responsive Design
- **Mobile-first**: All components are mobile-optimized
- **Breakpoint system**: `sm:`, `md:`, `lg:`, `xl:` prefixes
- **Flexible layouts**: Components adapt to screen sizes

## 🎨 Custom Component Creation

### Creating New Sections
```tsx
// src/app/(frontend)/components/sections/NewSection.tsx
'use client'
import { SectionWrapper } from '../layout/section'
import { Button } from '@/components/ui/button'
import { m, useFadeInUpVariants, viewport, hoverPop } from '@/lib/motion'

export default function NewSection() {
  const title = useFadeInUpVariants({ distance: 16, duration: 0.32 })
  
  return (
    <SectionWrapper bg="background" padding="default">
      <div className="mx-auto max-w-[1200px] px-6">
        <m.h2 className="heading-2" variants={title}>
          Section Title
        </m.h2>
        {/* Content */}
      </div>
    </SectionWrapper>
  )
}
```

### Creating New UI Components
```tsx
// src/app/(frontend)/components/ui/new-component.tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const componentVariants = cva(
  'base-styles',
  {
    variants: {
      variant: { default: 'default-styles', secondary: 'secondary-styles' },
      size: { sm: 'small', default: 'default', lg: 'large' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {}

const Component = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        className={cn(componentVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Component.displayName = 'Component'

export { Component, componentVariants }
```

## ♿ Accessibility Features

### Built-in Accessibility
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Focus Management**: Visible focus indicators
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and descriptions
- **Reduced Motion**: Respects user motion preferences
- **Color Contrast**: WCAG compliant color ratios
- **Skip Links**: Keyboard navigation shortcuts

## 📱 Responsive Design

### Breakpoint System
- **Mobile**: Default styles (320px+)
- **Small**: `sm:` prefix (640px+)
- **Medium**: `md:` prefix (768px+)
- **Large**: `lg:` prefix (1024px+)
- **Extra Large**: `xl:` prefix (1280px+)

### Responsive Patterns
- **Mobile-first**: Base styles for mobile, enhancements for larger screens
- **Flexible grids**: CSS Grid and Flexbox for adaptive layouts
- **Responsive typography**: Font sizes that scale with screen size
- **Touch-friendly**: Appropriate touch targets for mobile

## 🎯 Performance Optimizations

### Built-in Optimizations
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component integration
- **Font Optimization**: System font stack with fallbacks
- **Animation Performance**: Hardware-accelerated animations
- **Bundle Optimization**: Tree-shaking and minimal imports

## 🔧 Development Tools

### Available Scripts
- **Development**: `npm run dev` - Start development server
- **Build**: `npm run build` - Production build
- **Lint**: `npm run lint` - Code linting
- **Type Check**: `npm run type-check` - TypeScript validation

### File Structure
```
src/app/(frontend)/
├── components/
│   ├── sections/     # Page sections
│   ├── layout/       # Layout components
│   └── ui/          # UI components
├── styles.css       # Global styles and tokens
└── page.tsx         # Page components
```

## 🎨 Design Principles

### Visual Hierarchy
- **Typography Scale**: Clear heading hierarchy
- **Spacing System**: Consistent vertical rhythm
- **Color Hierarchy**: Semantic color usage
- **Component Hierarchy**: Logical component relationships

### User Experience
- **Progressive Enhancement**: Works without JavaScript
- **Loading States**: Smooth loading experiences
- **Error Handling**: Graceful error states
- **Feedback**: Visual feedback for all interactions

### Consistency
- **Design Tokens**: Centralized design values
- **Component API**: Consistent prop patterns
- **Animation Timing**: Standardized animation durations
- **Spacing Scale**: Consistent spacing values

---

This kit provides everything needed to create beautiful, modern webpages with excellent user experience, accessibility, and performance. All components are designed to work together seamlessly while maintaining flexibility for customization.

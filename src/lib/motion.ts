// src/lib/motion.ts
import { motion, useReducedMotion } from 'framer-motion'

/**
 * Export framer's motion as `m` for ergonomic JSX:
 *   import { m } from "@/lib/motion";
 *   <m.div ... />
 */
export { motion as m }

/** Viewport defaults for scroll-reveals */
export const viewport = { once: true, amount: 0.2 } as const

/** Make a fade-in-up variant (tunable distance/duration) */
export function makeFadeInUp({ distance = 16, duration = 0.28, delay = 0 } = {}) {
  return {
    hidden: { opacity: 0, y: distance },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration, delay, ease: 'easeOut' },
    },
  }
}

/** Stagger container for lists/grids (stagger children in) */
export function makeStaggerContainer({ delayChildren = 0, staggerChildren = 0.08 } = {}) {
  return {
    hidden: {},
    show: {
      transition: { delayChildren, staggerChildren },
    },
  }
}

/** Simple fade (no Y movement) */
export function makeFade({ duration = 0.25, delay = 0 } = {}) {
  return {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration, delay, ease: 'easeOut' } },
  }
}

/**
 * Motion-safe helpers:
 * Returns duration 0 + no movement when user prefers reduced motion.
 */
export function useMotionSafeDuration(base = 0.28) {
  const reduced = useReducedMotion()
  return reduced ? 0 : base
}

export function useFadeInUpVariants(opts?: {
  distance?: number
  duration?: number
  delay?: number
}) {
  const reduced = useReducedMotion()
  if (reduced) {
    return makeFade({ duration: 0 }) // no slide, instant fade
  }
  const duration = useMotionSafeDuration(opts?.duration ?? 0.28)
  return makeFadeInUp({ ...opts, duration })
}

/** Hover/tap micro-interactions for cards & buttons */
export const hoverLift = {
  whileHover: { y: -2, boxShadow: 'var(--shadow-lift)' },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.15 },
} as const

export const hoverPop = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.12 },
} as const

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only run on desktop devices
    if (typeof window === 'undefined' || window.matchMedia('(hover: none)').matches) {
      return
    }

    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
      if (!isVisible) setIsVisible(true)

      // Check if hovering over interactive elements
      const target = e.target
      const isInteractive = target.closest(
        'a, button, input, [role="button"], [data-cursor-expand], .link-bracket, .directional-item'
      )
      setIsExpanded(!!isInteractive)
    }

    const onMouseLeave = () => setIsVisible(false)
    const onMouseEnter = () => setIsVisible(true)

    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[9999] mix-blend-difference hidden md:block"
      animate={{
        x: position.x - (isExpanded ? 18 : 6),
        y: position.y - (isExpanded ? 18 : 6),
        width: isExpanded ? 36 : 12,
        height: isExpanded ? 36 : 12,
        borderRadius: isExpanded ? '50%' : '2px',
        backgroundColor: isExpanded ? 'rgba(197, 160, 89, 0.45)' : '#c5a059',
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 28,
        mass: 0.5,
      }}
    />
  )
}

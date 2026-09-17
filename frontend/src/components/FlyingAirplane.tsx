'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface FlyingAirplaneProps {
  delay?: number
  yOffset?: number
  size?: number
}

export default function FlyingAirplane({ delay = 0, yOffset = 0, size = 60 }: FlyingAirplaneProps) {
  const [position, setPosition] = useState({ y: Math.random() * 80 + 10 + yOffset })
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const changePosition = () => {
      const newY = Math.random() * 80 + 10 + yOffset // Random Y between 10% and 90%
      const newRotation = (Math.random() - 0.5) * 10 // Random rotation between -5 and 5 degrees
      setPosition({ y: newY })
      setRotation(newRotation)
    }

    // Initial position
    changePosition()

    // Change position periodically
    const interval = setInterval(() => {
      changePosition()
    }, 10000 + Math.random() * 5000) // Random interval between 10-15 seconds

    return () => clearInterval(interval)
  }, [yOffset])

  return (
    <motion.div
      initial={{ x: -100, rotate: rotation }}
      animate={{ x: '110vw', rotate: rotation }}
      transition={{
        duration: 20 + Math.random() * 15, // Random duration between 20-35 seconds
        ease: 'linear',
        repeat: Infinity,
        repeatType: 'loop',
        delay: delay,
      }}
      className="fixed pointer-events-none z-0 opacity-20"
      style={{
        top: `${position.y}%`,
        left: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
        style={{ transform: 'rotate(90deg)' }}
      >
        <path
          d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
          fill="currentColor"
        />
      </svg>
    </motion.div>
  )
}

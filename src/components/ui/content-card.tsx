"use client"

import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface ContentCardProps {
  title: string
  subtitle?: string
  description?: string
  image: string
  badge?: string
  footer?: ReactNode
  className?: string
  onClick?: () => void
}

export function ContentCard({
  title,
  subtitle,
  description,
  image,
  badge,
  footer,
  className,
  onClick,
}: ContentCardProps) {
  const shouldReduceMotion = useReducedMotion()

  const containerVariants = {
    rest: { scale: 1, y: 0 },
    hover: !shouldReduceMotion ? {
      scale: 1.02,
      y: -4,
      transition: { type: "spring", stiffness: 400, damping: 28, mass: 0.6 }
    } : {},
  }

  const imageVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.08 },
  }

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      variants={containerVariants}
      onClick={onClick}
      className={cn(
        "relative rounded-2xl border border-border/20 text-card-foreground overflow-hidden shadow-lg shadow-black/10 cursor-pointer group",
        className
      )}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <motion.img
          src={image}
          alt={title}
          variants={imageVariants}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        {badge && (
          <span className="absolute top-3 left-3 text-xs font-medium bg-primary/90 text-primary-foreground px-2.5 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2 bg-card">
        <h3 className="font-display font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        )}
        {footer && (
          <div className="pt-2 border-t border-border">
            {footer}
          </div>
        )}
      </div>
    </motion.div>
  )
}

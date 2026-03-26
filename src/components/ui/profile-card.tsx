"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Check, Users, UserCheck } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ProfileCardProps {
  name?: string
  description?: string
  image?: string
  isVerified?: boolean
  followers?: number
  following?: number
  enableAnimations?: boolean
  className?: string
  onFollow?: () => void
  isFollowing?: boolean
}

export function ProfileCard({
  name = "Sophie Bennett",
  description = "Product Designer who focuses on simplicity & usability.",
  image = "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=800&h=800&fit=crop&auto=format&q=80",
  isVerified = true,
  followers = 312,
  following = 48,
  enableAnimations = true,
  className,
  onFollow = () => {},
  isFollowing = false,
}: ProfileCardProps) {
  const [hovered, setHovered] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const shouldAnimate = enableAnimations && !shouldReduceMotion

  const containerVariants = {
    rest: { scale: 1, y: 0 },
    hover: shouldAnimate ? { 
      scale: 1.02, y: -4,
      transition: { type: "spring" as const, stiffness: 400, damping: 28, mass: 0.6 }
    } : {},
  }

  const imageVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
  }

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, y: 0,
      transition: { type: "spring" as const, stiffness: 400, damping: 28, mass: 0.6, staggerChildren: 0.08, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    visible: { 
      opacity: 1, y: 0, scale: 1,
      transition: { type: "spring" as const, stiffness: 400, damping: 25, mass: 0.5 },
    },
  }

  const letterVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, scale: 1,
      transition: { type: "spring" as const, damping: 8, stiffness: 200, mass: 0.8 },
    },
  }

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial="rest"
      whileHover="hover"
      variants={containerVariants}
      className={cn(
        "relative w-full h-96 rounded-3xl border border-border/20 text-card-foreground overflow-hidden shadow-xl shadow-black/5 cursor-pointer group backdrop-blur-sm",
        className
      )}
    >
      {/* Full Cover Image */}
      <motion.img
        src={image}
        alt={name}
        variants={imageVariants}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Blur Overlay layers */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 backdrop-blur-[2px]" style={{ maskImage: "linear-gradient(to top, black 30%, transparent)" }} />

      {/* Content */}
      <motion.div
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        className="absolute bottom-0 left-0 right-0 p-5 space-y-3"
      >
        {/* Name and Verification */}
        <motion.div variants={itemVariants} className="flex items-center gap-2">
          <h3 className="text-lg font-display font-bold text-white">
            {name.split("").map((letter, index) => (
              <motion.span key={index} variants={letterVariants} className="inline-block">
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </h3>
          {isVerified && (
            <motion.div variants={itemVariants} className="flex items-center justify-center w-5 h-5 rounded-full bg-primary">
              <Check className="w-3 h-3 text-primary-foreground" />
            </motion.div>
          )}
        </motion.div>

        {/* Description */}
        <motion.p variants={itemVariants} className="text-sm text-white/70 line-clamp-2">
          {description}
        </motion.p>

        {/* Stats */}
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-white/80">
            <Users className="w-3.5 h-3.5" />
            <span className="text-sm font-medium">{followers}</span>
            <span className="text-xs text-white/50">followers</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/80">
            <UserCheck className="w-3.5 h-3.5" />
            <span className="text-sm font-medium">{following}</span>
            <span className="text-xs text-white/50">following</span>
          </div>
        </motion.div>

        {/* Follow Button */}
        <motion.button
          variants={itemVariants}
          onClick={(e) => { e.stopPropagation(); onFollow(); }}
          className={cn(
            "w-full py-2 rounded-xl text-sm font-medium transition-all",
            isFollowing
              ? "bg-white/10 text-white border border-white/20"
              : "gold-gradient text-primary-foreground"
          )}
        >
          {isFollowing ? "Following" : "Follow +"}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

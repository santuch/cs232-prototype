import React, { useEffect, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'

// Interface for grid configuration structure
interface GridConfig {
    numCards: number // Total number of cards to display
    cols: number // Number of columns in the grid
    xBase: number // Base x-coordinate for positioning
    yBase: number // Base y-coordinate for positioning
    xStep: number // Horizontal step between cards
    yStep: number // Vertical step between cards
}

const AnimatedLoadingSkeleton = () => {
    const [windowWidth, setWindowWidth] = useState(0) // State to store window width for responsiveness
    const controls = useAnimation() // Controls for Framer Motion animations

    // Dynamically calculates grid configuration based on window width
    const getGridConfig = (width: number): GridConfig => {
        const numCards = 12 // Match the itemsPerPage in the main component
        const cols = width >= 1024 ? 3 : width >= 640 ? 2 : 1 // Set columns based on screen width
        return {
            numCards,
            cols,
            xBase: 40, // Starting x-coordinate
            yBase: 60, // Starting y-coordinate
            xStep: 210, // Horizontal spacing
            yStep: 230 // Vertical spacing
        }
    }

    // Generates random animation paths for the search icon
    const generateSearchPath = (config: GridConfig) => {
        const { numCards, cols, xBase, yBase, xStep, yStep } = config
        const rows = Math.ceil(numCards / cols) // Calculate rows based on cards and columns
        const allPositions = []

        // Generate grid positions for cards
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if ((row * cols + col) < numCards) {
                    allPositions.push({
                        x: xBase + (col * xStep),
                        y: yBase + (row * yStep)
                    })
                }
            }
        }

        // Shuffle positions to create random animations
        const numRandomCards = 4
        const shuffledPositions = allPositions
            .sort(() => Math.random() - 0.5)
            .slice(0, numRandomCards)

        // Ensure loop completion by adding the starting position
        shuffledPositions.push(shuffledPositions[0])

        return {
            x: shuffledPositions.map(pos => pos.x),
            y: shuffledPositions.map(pos => pos.y),
            scale: Array(shuffledPositions.length).fill(1.2),
            transition: {
                duration: shuffledPositions.length * 2,
                repeat: Infinity, // Loop animation infinitely
                ease: [0.4, 0, 0.2, 1], // Ease function for smooth animation
                times: shuffledPositions.map((_, i) => i / (shuffledPositions.length - 1))
            }
        }
    }

    // Handles window resize events and updates the window width
    useEffect(() => {
        setWindowWidth(window.innerWidth)
        const handleResize = () => setWindowWidth(window.innerWidth)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Updates animation path whenever the window width changes
    useEffect(() => {
        const config = getGridConfig(windowWidth)
        controls.start(generateSearchPath(config))
    }, [windowWidth, controls])

    // Variants for frame animations
    const frameVariants = {
        hidden: { opacity: 0, scale: 0.95 }, // Initial state (hidden)
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } } // Transition to visible state
    }

    // Variants for individual card animations
    const cardVariants = {
        hidden: { y: 20, opacity: 0 }, // Initial state (off-screen)
        visible: (i: number) => ({ // Animate based on card index
            y: 0,
            opacity: 1,
            transition: { delay: i * 0.1, duration: 0.4 } // Staggered animation
        })
    }

    // Glow effect variants for the search icon
    const glowVariants = {
        animate: {
            boxShadow: [
                "0 0 20px rgba(20, 184, 166, 0.2)", // Teal color to match the site theme
                "0 0 35px rgba(20, 184, 166, 0.4)",
                "0 0 20px rgba(20, 184, 166, 0.2)"
            ],
            scale: [1, 1.1, 1], // Pulsating effect
            transition: {
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut" // Smooth pulsation
            }
        }
    }

    const config = getGridConfig(windowWidth) // Get current grid configuration

    return (
        <div className="w-full py-8">
            <motion.div
                className="w-full mx-auto"
                variants={frameVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="relative">
                    {/* Search icon with animation */}
                    <motion.div
                        className="absolute z-10 pointer-events-none"
                        animate={controls}
                        style={{ left: 20, top: 20 }}
                    >
                        <motion.div
                            className="bg-teal-500/20 p-4 rounded-full backdrop-blur-sm shadow-lg"
                            variants={glowVariants}
                            animate="animate"
                        >
                            <svg
                                className="w-20 h-20 text-teal-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </motion.div>
                    </motion.div>

                    {/* Grid of animated cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                        {[...Array(config.numCards)].map((_, i) => (
                            <motion.div
                                key={i}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                custom={i} // Index-based animation delay
                                whileHover={{ scale: 1.02 }} // Slight scale on hover
                                className="bg-white rounded-lg shadow-md overflow-hidden"
                            >
                                {/* Card placeholders */}
                                <motion.div
                                    className="h-48 bg-gray-200"
                                    animate={{
                                        background: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                                <div className="p-4 space-y-3">
                                    <motion.div
                                        className="h-5 w-3/4 bg-gray-200 rounded"
                                        animate={{
                                            background: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
                                        }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                    <motion.div
                                        className="h-4 w-1/2 bg-gray-200 rounded"
                                        animate={{
                                            background: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
                                        }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
                                    />
                                    <div className="flex justify-between items-center pt-2">
                                        <motion.div
                                            className="h-4 w-20 bg-gray-200 rounded"
                                            animate={{
                                                background: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
                                            }}
                                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                                        />
                                        <motion.div
                                            className="h-8 w-8 rounded-full bg-gray-200"
                                            animate={{
                                                background: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
                                            }}
                                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
            <div className="flex justify-center mt-8">
                <div className="flex items-center justify-center space-x-2">
                    <motion.div 
                        className="h-8 w-8 rounded-full bg-gray-200"
                        animate={{
                            background: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div 
                        className="h-8 w-8 rounded-full bg-teal-500"
                        animate={{
                            opacity: [0.7, 1, 0.7],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div 
                        className="h-8 w-8 rounded-full bg-gray-200"
                        animate={{
                            background: ["#f3f4f6", "#e5e7eb", "#f3f4f6"],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    />
                </div>
            </div>
        </div>
    )
}

export default AnimatedLoadingSkeleton

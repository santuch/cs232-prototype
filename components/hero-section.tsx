"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { ThailandGlobe } from "@/components/ui/thailand-globe";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

interface HeroSectionProps {
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    searchQuery: string;
}

export function HeroSection({ onSearchChange, searchQuery }: HeroSectionProps) {
    // Animation controls for the globe search icon and glove
    const controls = useAnimation();
    const gloveControls = useAnimation();
    // Client-side only flag to prevent hydration mismatch
    const [isMounted, setIsMounted] = useState(false);
    
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
    };
    
    // Mark component as mounted on client-side to prevent hydration mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    // Set up animations only after client-side mount
    useEffect(() => {
        if (!isMounted) return;
        
        // Animation starts from center of globe and moves outward
        controls.start({
            x: [0, 100, 150, 100, -50, -100, -50, 0, 50, 0],
            y: [0, -50, -100, -150, -100, 0, 100, 150, 100, 0],
            scale: [0.5, 1, 1.2, 1, 0.8, 1, 1.2, 1, 0.8, 0.5],
            transition: {
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
            }
        });

        // Set up animation for the glove - now starts automatically
        const sequence = async () => {
            // Initial delay before starting the animation
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Start the animation loop
            while (true) {
                await gloveControls.start({
                    rotate: [0, 15, 0, -15, 0],
                    scale: [1, 1.1, 1],
                    transition: {
                        duration: 4,
                        ease: "easeInOut"
                    }
                });
                
                // Wait a bit before starting the next animation
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        };
        
        sequence();
        
    }, [controls, gloveControls, isMounted]);
    
    // Function to scroll to search section
    const scrollToSearch = () => {
        const searchSection = document.getElementById("search");
        if (searchSection) {
            searchSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-teal-50 via-teal-100/40 to-white py-20 md:py-32">
            {/* Background decorative elements */}
            <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-teal-200/20 blur-3xl" />
            <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-blue-200/20 blur-3xl" />

            <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-16 md:grid-cols-2 md:gap-20 lg:gap-24 items-center">
                    <div className="flex flex-col justify-center space-y-8">
                        <div className="space-y-4">
                            <Badge className="inline-flex bg-teal-100 text-teal-800 hover:bg-teal-200 px-4 py-1.5 text-sm">
                                ศูนย์ข้อมูลบุคคลสูญหาย
                            </Badge>
                            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl xl:text-7xl">
                                Missing
                                <span className="text-teal-600">
                                    Hub
                                </span>
                            </h1>
                            <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl lg:text-2xl">
                                ช่วยกันค้นหาและแจ้งเบาะแสบุคคลสูญหาย
                                เพื่อส่งคนที่คุณรักกลับบ้าน
                            </p>
                        </div>

                        <div className="flex flex-col space-y-6">
                            <div className="relative max-w-xl">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        value={searchQuery}
                                        onChange={onSearchChange}
                                        placeholder="ค้นหาด้วยชื่อ หรือรายละเอียด..."
                                        className="pl-12 pr-16 py-7 text-base shadow-lg border-teal-100/50 focus-visible:ring-teal-500 rounded-xl"
                                    />
                                    <Button
                                        size="sm"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-teal-600 hover:bg-teal-700 px-6"
                                        onClick={scrollToSearch}
                                    >
                                        ค้นหา
                                    </Button>
                                </div>
                                <p className="mt-3 text-sm text-muted-foreground">
                                    ตัวอย่างการค้นหา: ชื่อ, อายุ, สถานที่หาย,
                                    หรือลักษณะเฉพาะ
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    asChild
                                    className="text-base"
                                >
                                    <Link href="#report">
                                        แจ้งคนหาย/ แจ้งเบาะแส
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="relative hidden md:flex items-center justify-center">
                        <div className="relative h-[500px] w-[500px] lg:h-[600px] lg:w-[600px]">
                            {/* Interactive globe component */}
                            <div className="absolute inset-0 z-10 overflow-hidden rounded-3xl shadow-xl bg-gradient-to-br from-teal-50 to-blue-50">
                                <ThailandGlobe className="top-0" />
                            </div>
                            
                            {/* Animated Glove near the globe - only shown after client-side mount */}
                            {isMounted && (
                                <motion.div
                                    className="absolute z-20 cursor-pointer"
                                    style={{ right: 40, bottom: 80 }}
                                    animate={gloveControls}
                                    whileHover={{ scale: 1.1 }}
                                >
                                <motion.div 
                                    className="relative"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ 
                                        opacity: 1, 
                                        y: 0,
                                        transition: { delay: 0.5, duration: 0.8 }
                                    }}
                                >
                                    <div className="relative">
                                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <motion.path 
                                                d="M11.5 16.5C11.5 16.5 10 14.5 10 13C10 11.5 11 10.5 12 10.5C13 10.5 14 11.5 14 13C14 14.5 12.5 16.5 12.5 16.5" 
                                                stroke="#0D9488" 
                                                strokeWidth="1.5" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 1, delay: 0.8 }}
                                            />
                                            <motion.path 
                                                d="M19.5 12.5C19.5 16.6421 16.1421 20 12 20C7.85786 20 4.5 16.6421 4.5 12.5C4.5 8.35786 7.85786 5 12 5C16.1421 5 19.5 8.35786 19.5 12.5Z" 
                                                stroke="#0D9488" 
                                                strokeWidth="1.5" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                            />
                                            <motion.path 
                                                d="M12 2V4" 
                                                stroke="#0D9488" 
                                                strokeWidth="1.5" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.5, delay: 1 }}
                                            />
                                            <motion.path 
                                                d="M12 21V23" 
                                                stroke="#0D9488" 
                                                strokeWidth="1.5" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.5, delay: 1.1 }}
                                            />
                                            <motion.path 
                                                d="M22 12.5L20 12.5" 
                                                stroke="#0D9488" 
                                                strokeWidth="1.5" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.5, delay: 1.2 }}
                                            />
                                            <motion.path 
                                                d="M4 12.5L2 12.5" 
                                                stroke="#0D9488" 
                                                strokeWidth="1.5" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.5, delay: 1.3 }}
                                            />
                                        </svg>
                                        <motion.div 
                                            className="absolute -top-1 -right-1 bg-teal-500/20 rounded-full p-1.5 backdrop-blur-sm"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 1.5, type: "spring" }}
                                        >
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M20 14.66V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V6C2 5.46957 2.21071 4.96086 2.58579 4.58579C2.96086 4.21071 3.46957 4 4 4H9.34" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M18 2L22 6L12 16H8V12L18 2Z" fill="#0D9488"/>
                                            </svg>
                                        </motion.div>
                                    </div>
                                    
                                    <motion.div 
                                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-md text-xs font-medium text-teal-700 whitespace-nowrap"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.8, duration: 0.5 }}
                                    >
                                        ค้นหาทั่วประเทศ
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                            )}
                            
                            {/* Search icon with animation - starts from center of globe - only shown after client-side mount */}
                            {isMounted && (
                                <motion.div
                                    className="absolute z-10 pointer-events-none"
                                    animate={controls}
                                    style={{ left: "30%", top: "30%", x: "-50%", y: "-50%" }}
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
                            )}
                            {/* Decorative elements */}
                            <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full border-8 border-white bg-teal-100" />
                            <div className="absolute -top-8 -left-8 h-32 w-32 rounded-full border-8 border-white bg-blue-100" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

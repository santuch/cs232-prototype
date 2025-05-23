"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { ThailandGlobe } from "@/components/ui/thailand-globe";

interface HeroSectionProps {
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    searchQuery: string;
}

export function HeroSection({ onSearchChange, searchQuery }: HeroSectionProps) {
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
                                ช่วยค้นหา
                                <span className="text-teal-600">
                                    คนที่คุณรัก
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

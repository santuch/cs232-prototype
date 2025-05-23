"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X, Search, Bell, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItem {
    label: string;
    href: string;
    active?: boolean;
}

interface NavbarProps {
    className?: string;
}

export function Navbar({ className }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);

    const navItems: NavItem[] = [
        { label: "หน้าหลัก", href: "/", active: true },
        { label: "ค้นหา", href: "#search" },
        { label: "แจ้งคนหาย", href: "#report" },
        { label: "ข้อมูลติดต่อ", href: "#contact" },
        { label: "เกี่ยวกับเรา", href: "#about" },
    ];

    return (
        <header
            className={cn(
                "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
                className
            )}
        >
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative flex h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-teal-400 to-blue-500">
                            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                                ศบ
                            </div>
                        </div>
                        <span className="hidden font-bold text-xl sm:inline-block">
                            ศูนย์ค้นหาบุคคลสูญหาย
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                item.active
                                    ? "text-primary"
                                    : "text-muted-foreground"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex"
                    >
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Search</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden md:flex"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="sr-only">Notifications</span>
                    </Button>
                    <div className="hidden md:block">
                        <Button variant="outline" size="sm">
                            <User className="mr-2 h-4 w-4" />
                            เข้าสู่ระบบ
                        </Button>
                    </div>

                    {/* Mobile Menu */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-[80%] sm:w-[350px]"
                        >
                            <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between border-b pb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-teal-400 to-blue-500">
                                            <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                                                ศบ
                                            </div>
                                        </div>
                                        <span className="font-bold">
                                            ศูนย์ค้นหาบุคคลสูญหาย
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <X className="h-5 w-5" />
                                        <span className="sr-only">Close</span>
                                    </Button>
                                </div>
                                <nav className="flex flex-col gap-4 py-6">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center py-2 text-base font-medium transition-colors hover:text-primary",
                                                item.active
                                                    ? "text-primary"
                                                    : "text-muted-foreground"
                                            )}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </nav>
                                <div className="mt-auto border-t pt-4">
                                    <Button className="w-full" size="sm">
                                        <User className="mr-2 h-4 w-4" />
                                        เข้าสู่ระบบ
                                    </Button>
                                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                                        <span>
                                            © 2025 ศูนย์ค้นหาบุคคลสูญหาย
                                        </span>
                                        <span>สายด่วน: 1300</span>
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}

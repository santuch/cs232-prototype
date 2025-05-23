"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useMissingPersons } from "@/context/MissingPersonsContext";
import {
    MissingPerson,
    extractAge,
    extractLocation,
    extractLastSeen,
} from "@/lib/api";
import React, { use } from "react";
import { cn } from "@/lib/utils";

export default function PersonDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    // Unwrap params using React.use() and type it correctly
    const unwrappedParams = use(params) as { id: string };
    const { missingPersons, loading, error } = useMissingPersons();
    const [person, setPerson] = useState<MissingPerson | null>(null);
    const [imgSrc, setImgSrc] = useState<string>("");
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [isImageError, setIsImageError] = useState(false);

    useEffect(() => {
        if (missingPersons.length > 0 && unwrappedParams.id) {
            const foundPerson = missingPersons.find(
                (p) => p.case_id.toString() === unwrappedParams.id
            );
            setPerson(foundPerson || null);
            if (foundPerson) {
                setImgSrc(foundPerson.picture || "/placeholder.svg");
                setIsImageLoading(true);
                setIsImageError(false);
            }
        }
    }, [missingPersons, unwrappedParams.id]);

    const handleImageError = () => {
        setIsImageError(true);
        setImgSrc("/placeholder.svg");
    };

    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="mb-8 hover:bg-teal-50 transition-colors group"
                    >
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4 group-hover:text-teal-600" />
                            กลับไปหน้าหลัก
                        </Link>
                    </Button>

                    {loading ? (
                        <div className="space-y-8">
                            <Skeleton className="h-12 w-1/3" />
                            <div className="grid gap-12 md:grid-cols-2">
                                <Skeleton className="aspect-square h-full w-full rounded-2xl" />
                                <div className="space-y-6">
                                    <Skeleton className="h-8 w-1/2" />
                                    <Skeleton className="h-6 w-full" />
                                    <Skeleton className="h-6 w-full" />
                                    <Skeleton className="h-6 w-3/4" />
                                </div>
                            </div>
                        </div>
                    ) : error ? (
                        <Card className="border-red-100 bg-red-50/50">
                            <CardContent className="p-8 text-center">
                                <h2 className="text-2xl font-bold text-red-600 mb-2">
                                    เกิดข้อผิดพลาดในการโหลดข้อมูล
                                </h2>
                                <p className="text-red-600/80">
                                    กรุณาลองใหม่อีกครั้งในภายหลัง
                                </p>
                            </CardContent>
                        </Card>
                    ) : !person ? (
                        <Card className="border-amber-100 bg-amber-50/50">
                            <CardContent className="p-8 text-center">
                                <h2 className="text-2xl font-bold text-amber-600 mb-2">
                                    ไม่พบข้อมูลบุคคลสูญหาย
                                </h2>
                                <p className="text-amber-600/80 mb-6">
                                    ไม่พบข้อมูลบุคคลสูญหายที่ตรงกับรหัส{" "}
                                    {unwrappedParams.id}
                                </p>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="bg-white hover:bg-amber-50"
                                >
                                    <Link href="/">กลับไปหน้าหลัก</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="mb-8 space-y-4">
                                <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                                    {person.name}
                                </h1>
                                <p className="text-lg text-muted-foreground">
                                    รหัสเคส: #{person.case_id}
                                </p>
                            </div>

                            <div className="grid gap-12 md:grid-cols-2">
                                <div className="space-y-6">
                                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border bg-gray-50 shadow-lg">
                                        {isImageLoading && !isImageError && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                                                <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
                                            </div>
                                        )}
                                        <Image
                                            src={imgSrc}
                                            alt={person.name}
                                            fill
                                            className={cn(
                                                "object-cover transition-transform duration-300 hover:scale-105",
                                                isImageLoading && !isImageError
                                                    ? "opacity-0"
                                                    : "opacity-100"
                                            )}
                                            priority
                                            onLoadingComplete={() =>
                                                setIsImageLoading(false)
                                            }
                                            onError={handleImageError}
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Badge
                                            variant="outline"
                                            className="px-4 py-1.5 text-base bg-white shadow-sm"
                                        >
                                            {extractAge(person.description) ||
                                                "ไม่ระบุ"}{" "}
                                            ปี
                                        </Badge>
                                        {person.platform && (
                                            <Badge
                                                variant="secondary"
                                                className="px-4 py-1.5"
                                            >
                                                แหล่งข้อมูล: {person.platform}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <Card className="overflow-hidden border-teal-100">
                                        <CardContent className="grid gap-6 p-6">
                                            <div className="flex items-center gap-4 rounded-lg bg-teal-50/50 p-4">
                                                <div className="rounded-full bg-teal-100 p-2.5">
                                                    <MapPin className="h-6 w-6 text-teal-700" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm text-muted-foreground">
                                                        สถานที่หายตัว
                                                    </p>
                                                    <p className="text-lg font-medium">
                                                        {extractLocation(
                                                            person.description
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 rounded-lg bg-blue-50/50 p-4">
                                                <div className="rounded-full bg-blue-100 p-2.5">
                                                    <Calendar className="h-6 w-6 text-blue-700" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm text-muted-foreground">
                                                        หายตัววันที่
                                                    </p>
                                                    <p className="text-lg font-medium">
                                                        {extractLastSeen(
                                                            person.description
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="overflow-hidden border-teal-100">
                                        <CardContent className="p-6">
                                            <h3 className="text-xl font-semibold mb-4">
                                                รายละเอียด
                                            </h3>
                                            <div className="rounded-lg bg-gray-50/50 p-4">
                                                <p className="whitespace-pre-wrap text-gray-600 leading-relaxed">
                                                    {person.description ||
                                                        "ไม่มีรายละเอียดเพิ่มเติม"}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold">
                                            แหล่งข้อมูลเพิ่มเติม
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            {person.url && (
                                                <Button
                                                    size="lg"
                                                    className="w-full bg-teal-600 hover:bg-teal-700 text-lg h-14"
                                                    asChild
                                                >
                                                    <Link
                                                        href={person.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <ExternalLink className="mr-2 h-5 w-5" />
                                                        ดูข้อมูลต้นฉบับ
                                                    </Link>
                                                </Button>
                                            )}

                                            {person.alternativeUrls &&
                                                person.alternativeUrls.map(
                                                    (url, index) =>
                                                        url !== person.url && (
                                                            <Button
                                                                key={index}
                                                                variant="outline"
                                                                size="lg"
                                                                className="bg-white hover:bg-gray-50/80"
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <ExternalLink className="mr-2 h-5 w-5" />
                                                                    แหล่งข้อมูลที่{" "}
                                                                    {index + 1}
                                                                </Link>
                                                            </Button>
                                                        )
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <footer className="border-t bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        © 2025 Santuch Lapsuwannawong.
                        ข้อมูลบางส่วนอ้างอิงจากมูลนิธิกระจกเงา
                        และศูนย์ข้อมูลคนหายไทย (
                        <a
                            href="https://www.thaimissing.go.th"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            thaimissing.go.th)
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    );
}

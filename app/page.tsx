"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Globe,
    Facebook,
    ClipboardCheck,
    AlertCircle,
    Wallet,
    Shield,
    Bell,
    CheckCircle2,
    Phone,
    Mail,
    Clock,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

import MissingPersonCard from "@/components/missingpersoncard";
import { HeroSection } from "@/components/hero-section";
import { useMissingPersons } from "@/context/MissingPersonsContext";
import {
    MissingPerson,
    extractAge,
    extractLocation,
    extractLastSeen,
    extractShortDescription,
    getRecentMissingPersons,
    filterMissingPersons,
    deduplicateMissingPersons,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface ProcessedMissingPerson extends MissingPerson {
    processedAge: number | null;
    processedLocation: string;
    processedLastSeen: string;
    processedDescription: string;
}

// Helper function to process a missing person
const processMissingPerson = (
    person: MissingPerson
): ProcessedMissingPerson => ({
    ...person,
    processedAge: extractAge(person.description),
    processedLocation: extractLocation(person.description),
    processedLastSeen: extractLastSeen(person.description),
    processedDescription: extractShortDescription(person.description),
});

// Pagination component
const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    tab,
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number, tab: string) => void;
    tab: string;
}) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push("...");
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push("...");
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push("...");
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center space-x-2 mt-8">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1, tab)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {getPageNumbers().map((page, index) =>
                page === "..." ? (
                    <span
                        key={`${tab}-ellipsis-${index}`}
                        className="px-2 text-muted-foreground"
                    >
                        ...
                    </span>
                ) : (
                    <Button
                        key={`${tab}-page-${page}`}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(page as number, tab)}
                        className="h-8 w-8 p-0"
                    >
                        {page}
                    </Button>
                )
            )}

            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1, tab)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
};

// Add this near the error state rendering
const ErrorState = ({
    error,
    onRetry,
}: {
    error: string;
    onRetry: () => void;
}) => (
    <div className="col-span-3 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="text-red-500">{error}</div>
        <Button onClick={onRetry} variant="outline">
            ลองใหม่อีกครั้ง
        </Button>
    </div>
);

// Minimal loading state with text
const LoadingState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
        <div className="flex flex-col items-center space-y-4">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-teal-200 opacity-25"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-teal-500 animate-spin"></div>
            </div>
            <h3 className="text-xl font-medium text-teal-700">กำลังโหลดข้อมูล</h3>
            <p className="text-muted-foreground">โปรดรอสักครู่...</p>
        </div>
    </div>
);

// Minimal fetching indicator component that shows when data is being revalidated
const FetchingIndicator = ({ fetching }: { fetching: boolean }) => {
    if (!fetching) return null;
    
    return (
        <div className="fixed bottom-4 right-4 bg-white shadow-md rounded-full px-4 py-2 flex items-center space-x-2 animate-in fade-in-0 slide-in-from-bottom-4 z-50">
            <div className="relative w-4 h-4">
                <div className="absolute inset-0 rounded-full border-2 border-teal-200 opacity-25"></div>
                <div className="absolute inset-0 rounded-full border-2 border-t-teal-500 animate-spin"></div>
            </div>
            <span className="text-sm font-medium text-teal-700">กำลังโหลดข้อมูล</span>
        </div>
    );
};

export default function Home() {
    // Get data from context
    const { missingPersons, loading, fetching, error, refetch } = useMissingPersons();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [activeTab, setActiveTab] = useState<string>("missing");
    const [currentPages, setCurrentPages] = useState({
        missing: 1,
        recent: 1,
        search: 1,
    });
    const itemsPerPage = 12;

    // Process and memoize all missing persons data
    const allMissingPersons = useMemo<ProcessedMissingPerson[]>(
        () =>
            missingPersons
                ? deduplicateMissingPersons(missingPersons).map(
                      processMissingPerson
                  )
                : [],
        [missingPersons]
    );

    // Get recent missing persons (last 30 days)
    const recentPersons = useMemo<ProcessedMissingPerson[]>(() => {
        const recentRaw = getRecentMissingPersons(missingPersons || []);
        return recentRaw.map(processMissingPerson);
    }, [missingPersons]);

    // Search functionality
    const searchResults = useMemo<ProcessedMissingPerson[]>(() => {
        if (!searchQuery.trim()) return [];
        const rawResults = filterMissingPersons(
            missingPersons || [],
            searchQuery
        );
        return rawResults.map(processMissingPerson);
    }, [missingPersons, searchQuery]);

    // Handle search input
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        // If there are search results, switch to search tab
        if (query.trim()) {
            setActiveTab("search");
        } else {
            // If search is cleared, go back to "missing" tab
            setActiveTab("missing");
        }
    };

    // Handle tab change
    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    // Handle page change for specific tab
    const handlePageChange = (page: number, tab: string) => {
        setCurrentPages((prev) => ({
            ...prev,
            [tab]: page,
        }));
    };

    // Render missing person card
    const renderMissingPersonCard = (person: ProcessedMissingPerson) => (
        <MissingPersonCard
            key={person.case_id}
            name={person.name}
            age={person.processedAge || 0}
            location={person.processedLocation}
            lastSeen={person.processedLastSeen}
            description={person.processedDescription}
            imageUrl={person.picture || "/placeholder.svg"}
            url={person.url}
            caseId={person.case_id}
            found={false}
        />
    );

    return (
        <div className="flex min-h-screen flex-col">
            {/* Fetching indicator for data revalidation */}
            <FetchingIndicator fetching={fetching} />
            
            <main className="flex-1">
                <HeroSection
                    searchQuery={searchQuery}
                    onSearchChange={handleSearch}
                />

                <section className="py-12 md:py-16 lg:py-20" id="search">
                    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {/* Enhanced Search Header with Magic UI styling */}
                        <div className="text-center mb-12">
                            {/* Search bar moved outside tabs */}
                            <div className="mb-8 max-w-2xl mx-auto">
                                {searchQuery && (
                                    <p className="mt-2 text-xs text-center text-muted-foreground">
                                        พบ {searchResults.length}{" "}
                                        รายการที่ตรงกับคำค้นหา &ldquo;
                                        {searchQuery}&rdquo;
                                    </p>
                                )}
                            </div>

                            <div className="relative inline-block">
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-teal-500 via-teal-700 to-teal-500 bg-clip-text text-transparent">
                                    รายชื่อบุคคลสูญหาย
                                </h2>
                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-teal-500 to-teal-700 rounded-full"></div>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    placeholder="ค้นหาเพิ่มเติมด้วยชื่อ หรือรายละเอียด..."
                                    className="pl-10 pr-14 py-6 text-base shadow-md border-teal-100/50 focus-visible:ring-teal-500 bg-white/80 backdrop-blur-sm"
                                />
                                <Button
                                    size="sm"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-teal-600 hover:bg-teal-700"
                                >
                                    ค้นหา
                                </Button>
                            </div>
                            <p className="text-muted-foreground mt-4 text-lg">
                                {searchQuery && searchResults.length > 0 && (
                                    <span className="inline-flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        พบ{" "}
                                        <span className="font-semibold text-green-600">
                                            {searchResults.length}
                                        </span>{" "}
                                        รายการสำหรับ &ldquo;{searchQuery}&rdquo;
                                    </span>
                                )}
                                {searchQuery && searchResults.length === 0 && (
                                    <span className="inline-flex items-center gap-2">
                                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                        ไม่พบข้อมูลสำหรับ &ldquo;{searchQuery}
                                        &rdquo;
                                    </span>
                                )}
                                {!searchQuery && loading ? (
                                    <span className="inline-flex items-center gap-2">
                                        <span className="relative w-4 h-4">
                                            <span className="absolute inset-0 rounded-full border-2 border-teal-200 opacity-25"></span>
                                            <span className="absolute inset-0 rounded-full border-2 border-t-teal-500 animate-spin"></span>
                                        </span>
                                        <span className="font-medium text-teal-700">
                                            กำลังโหลดข้อมูล
                                        </span>
                                    </span>
                                ) : !searchQuery && (
                                    <span className="inline-flex items-center gap-2">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                        พบ{" "}
                                        <span className="font-semibold text-blue-600">
                                            {allMissingPersons.length}
                                        </span>{" "}
                                        รายการทั้งหมด
                                    </span>
                                )}
                            </p>
                        </div>

                        <Tabs
                            value={activeTab}
                            onValueChange={handleTabChange}
                            className="w-full"
                        >
                            {/* Enhanced Tab Navigation */}
                            <div className="flex justify-center mb-8">
                                <TabsList className="bg-background/50 backdrop-blur-sm border border-border/50 shadow-lg rounded-xl p-1">
                                    <TabsTrigger
                                        value="missing"
                                        className="data-[state=active]:bg-teal-500 data-[state=active]:text-teal-100 data-[state=active]:shadow-md transition-all duration-300 rounded-lg px-6 py-2"
                                    >
                                        <span className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-current rounded-full"></div>
                                            ทั้งหมด
                                        </span>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="recent"
                                        className="data-[state=active]:bg-teal-500 data-[state=active]:text-teal-100 data-[state=active]:shadow-md transition-all duration-300 rounded-lg px-6 py-2"
                                    >
                                        <span className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                                            ล่าสุด
                                        </span>
                                    </TabsTrigger>
                                    {searchResults.length > 0 && (
                                        <TabsTrigger
                                            value="search"
                                            className="data-[state=active]:bg-teal-500 data-[state=active]:text-teal-100 data-[state=active]:shadow-md transition-all duration-300 rounded-lg px-6 py-2"
                                        >
                                            <span className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                ผลการค้นหา
                                            </span>
                                        </TabsTrigger>
                                    )}
                                </TabsList>
                            </div>
                            <TabsContent value="missing" className="mt-6">
                                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                                    {loading ? (
                                        <LoadingState />
                                    ) : error ? (
                                        <ErrorState
                                            error={error}
                                            onRetry={refetch}
                                        />
                                    ) : allMissingPersons.length === 0 ? (
                                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                                            <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                                <Search className="w-12 h-12 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">
                                                ไม่พบข้อมูลบุคคลสูญหาย
                                            </h3>
                                            <p className="text-muted-foreground">
                                                ลองค้นหาด้วยคำค้นอื่น
                                                หรือลองใหม่อีกครั้ง
                                            </p>
                                        </div>
                                    ) : (
                                        allMissingPersons
                                            .slice(
                                                (currentPages.missing - 1) *
                                                    itemsPerPage,
                                                currentPages.missing *
                                                    itemsPerPage
                                            )
                                            .map((person, index) => (
                                                <div
                                                    key={
                                                        person.case_id ||
                                                        `${person.name}-${index}`
                                                    }
                                                    className="animate-in fade-in-0 slide-in-from-bottom-4"
                                                    style={{
                                                        animationDelay: `${
                                                            index * 100
                                                        }ms`,
                                                    }}
                                                >
                                                    {renderMissingPersonCard(
                                                        person
                                                    )}
                                                </div>
                                            ))
                                    )}
                                </div>
                                {allMissingPersons.length > 0 && (
                                    <Pagination
                                        currentPage={currentPages.missing}
                                        totalPages={Math.ceil(
                                            allMissingPersons.length /
                                                itemsPerPage
                                        )}
                                        onPageChange={(page) =>
                                            handlePageChange(page, "missing")
                                        }
                                        tab="missing"
                                    />
                                )}
                            </TabsContent>
                            <TabsContent value="recent" className="mt-6">
                                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                                    {loading ? (
                                        Array(8)
                                            .fill(0)
                                            .map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="space-y-4 animate-pulse"
                                                >
                                                    <div className="h-56 w-full bg-muted/50 rounded-xl" />
                                                    <div className="space-y-2 p-4">
                                                        <div className="h-4 bg-muted/50 rounded w-3/4" />
                                                        <div className="h-3 bg-muted/50 rounded w-full" />
                                                        <div className="h-3 bg-muted/50 rounded w-2/3" />
                                                    </div>
                                                </div>
                                            ))
                                    ) : recentPersons.length === 0 ? (
                                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                                            <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                                <Clock className="w-12 h-12 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">
                                                ไม่มีข้อมูลล่าสุด
                                            </h3>
                                            <p className="text-muted-foreground">
                                                ยังไม่มีข้อมูลบุคคลสูญหายล่าสุด
                                            </p>
                                        </div>
                                    ) : (
                                        recentPersons
                                            .slice(
                                                (currentPages.recent - 1) *
                                                    itemsPerPage,
                                                currentPages.recent *
                                                    itemsPerPage
                                            )
                                            .map((person, index) => (
                                                <div
                                                    key={
                                                        person.case_id ||
                                                        `recent-${person.name}-${index}`
                                                    }
                                                    className="animate-in fade-in-0 slide-in-from-bottom-4"
                                                    style={{
                                                        animationDelay: `${
                                                            index * 150
                                                        }ms`,
                                                    }}
                                                >
                                                    {renderMissingPersonCard(
                                                        person
                                                    )}
                                                </div>
                                            ))
                                    )}
                                </div>
                                {recentPersons.length > 0 && (
                                    <Pagination
                                        currentPage={currentPages.recent}
                                        totalPages={Math.ceil(
                                            recentPersons.length / itemsPerPage
                                        )}
                                        onPageChange={(page) =>
                                            handlePageChange(page, "recent")
                                        }
                                        tab="recent"
                                    />
                                )}
                            </TabsContent>
                            {searchResults.length > 0 && (
                                <TabsContent value="search" className="mt-6">
                                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                                        {searchResults
                                            .slice(
                                                (currentPages.search - 1) *
                                                    itemsPerPage,
                                                currentPages.search *
                                                    itemsPerPage
                                            )
                                            .map((person, index) => (
                                                <div
                                                    key={
                                                        person.case_id ||
                                                        `search-${person.name}-${index}`
                                                    }
                                                    className="animate-in fade-in-0 slide-in-from-bottom-4"
                                                    style={{
                                                        animationDelay: `${
                                                            index * 100
                                                        }ms`,
                                                    }}
                                                >
                                                    {renderMissingPersonCard(
                                                        person
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                    {searchResults.length > 0 && (
                                        <Pagination
                                            currentPage={currentPages.search}
                                            totalPages={Math.ceil(
                                                searchResults.length /
                                                    itemsPerPage
                                            )}
                                            onPageChange={(page) =>
                                                handlePageChange(page, "search")
                                            }
                                            tab="search"
                                        />
                                    )}
                                </TabsContent>
                            )}
                        </Tabs>
                    </div>
                </section>

                <section
                    className="py-16 md:py-24 bg-gradient-to-b from-gray-50 via-gray-50/50 to-white"
                    id="report"
                >
                    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-3xl text-center mb-16">
                            <Badge className="mb-6 bg-teal-100 text-teal-800 hover:bg-teal-200">
                                มูลนิธิกระจกเงา (The Mirror Foundation)
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                                แจ้งคนหายกับมูลนิธิกระจกเงา
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                &ldquo;ช่วยกันค้นหา คนหายให้กลับบ้าน&rdquo;
                            </p>
                        </div>

                        <div className="grid gap-12 lg:gap-16">
                            {/* Contact Channels */}
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                <Card className="group h-full bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                                    <CardContent className="p-6 text-center flex flex-col h-full justify-between">
                                        <div>
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <Facebook className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <h4 className="text-lg font-semibold mb-2">
                                                Facebook
                                            </h4>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                ตอบเร็วที่สุด
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="w-full hover:bg-blue-100/50"
                                        >
                                            <Link
                                                href="https://www.facebook.com/thaimissing"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                facebook.com/thaimissing
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card className="group h-full bg-gradient-to-br from-teal-50 to-teal-100/50 border-teal-200 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                                    <CardContent className="p-6 text-center flex flex-col h-full justify-between">
                                        <div>
                                            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <Phone className="w-6 h-6 text-teal-600" />
                                            </div>
                                            <h4 className="text-lg font-semibold mb-2">
                                                โทรศัพท์
                                            </h4>
                                            <p className="text-2xl font-bold text-teal-700 mb-2">
                                                080-775-2673
                                            </p>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            โทรได้ตลอดเวลา
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="group h-full bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                                    <CardContent className="p-6 text-center flex flex-col h-full justify-between">
                                        <div>
                                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <Globe className="w-6 h-6 text-purple-600" />
                                            </div>
                                            <h4 className="text-lg font-semibold mb-2">
                                                เว็บไซต์
                                            </h4>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="w-full hover:bg-purple-100/50"
                                        >
                                            <Link
                                                href="https://www.mirror.or.th"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                www.mirror.or.th
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card className="group h-full bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                                    <CardContent className="p-6 text-center flex flex-col h-full justify-between">
                                        <div>
                                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <Mail className="w-6 h-6 text-orange-600" />
                                            </div>
                                            <h4 className="text-lg font-semibold mb-2">
                                                อีเมล
                                            </h4>
                                        </div>
                                        <p className="text-sm break-all text-muted-foreground">
                                            missingperson@mirror.or.th
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Required Information */}
                            <div className="bg-white rounded-2xl border border-teal-100 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                <div className="p-8 lg:p-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="flex-none rounded-full bg-teal-50 p-3 transition-transform duration-300 hover:scale-110">
                                            <ClipboardCheck className="w-6 h-6 text-teal-600" />
                                        </div>
                                        <h3 className="text-2xl font-semibold">
                                            สิ่งที่ควรเตรียมก่อนแจ้ง
                                        </h3>
                                    </div>
                                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                        <div className="space-y-4">
                                            <h4 className="font-medium text-lg mb-4 text-teal-700">
                                                ข้อมูลพื้นฐาน
                                            </h4>
                                            <ul className="space-y-3 text-sm text-muted-foreground">
                                                <li className="flex items-start gap-3 group">
                                                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-none group-hover:scale-110 transition-transform duration-300">
                                                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                                                    </div>
                                                    <span>
                                                        ชื่อ-นามสกุลของผู้หาย
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-3 group">
                                                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-none group-hover:scale-110 transition-transform duration-300">
                                                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                                                    </div>
                                                    <span>อายุ / วันเกิด</span>
                                                </li>
                                                <li className="flex items-start gap-3 group">
                                                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-none group-hover:scale-110 transition-transform duration-300">
                                                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                                                    </div>
                                                    <span>
                                                        วัน เวลา
                                                        และสถานที่ที่หาย
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="font-medium text-lg mb-4 text-teal-700">
                                                ลักษณะภายนอก
                                            </h4>
                                            <ul className="space-y-3 text-sm text-muted-foreground">
                                                <li className="flex items-start gap-3 group">
                                                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-none group-hover:scale-110 transition-transform duration-300">
                                                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                                                    </div>
                                                    <span>
                                                        ส่วนสูง และน้ำหนัก
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-3 group">
                                                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-none group-hover:scale-110 transition-transform duration-300">
                                                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                                                    </div>
                                                    <span>
                                                        การแต่งกายครั้งสุดท้าย
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-3 group">
                                                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-none group-hover:scale-110 transition-transform duration-300">
                                                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                                                    </div>
                                                    <span>
                                                        ลักษณะพิเศษที่สังเกตได้
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="space-y-4 sm:col-span-2 lg:col-span-1">
                                            <h4 className="font-medium text-lg mb-4 text-teal-700">
                                                เอกสารที่ต้องใช้
                                            </h4>
                                            <ul className="space-y-3 text-sm text-muted-foreground">
                                                <li className="flex items-start gap-3 group">
                                                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-none group-hover:scale-110 transition-transform duration-300">
                                                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                                                    </div>
                                                    <span>รูปถ่ายล่าสุด</span>
                                                </li>
                                                <li className="flex items-start gap-3 group">
                                                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-none group-hover:scale-110 transition-transform duration-300">
                                                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                                                    </div>
                                                    <span>
                                                        ข้อมูลติดต่อของผู้แจ้ง
                                                    </span>
                                                </li>
                                                <li className="flex items-start gap-3 group">
                                                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-none group-hover:scale-110 transition-transform duration-300">
                                                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                                                    </div>
                                                    <span>
                                                        สำเนาบัตรประชาชน (ถ้ามี)
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Steps */}
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                <div className="relative">
                                    <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                                        1
                                    </div>
                                    <Card className="pl-6 h-full group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                                        <CardContent className="pt-6 pb-8 flex flex-col h-full justify-between">
                                            <div>
                                                <h4 className="font-semibold text-lg mb-3 text-teal-700">
                                                    ติดต่อผ่านช่องทางที่สะดวก
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    เลือกติดต่อผ่าน Facebook
                                                    หรือโทรศัพท์
                                                    เพื่อความรวดเร็วในการประสานงาน
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                                        2
                                    </div>
                                    <Card className="pl-6 h-full group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                                        <CardContent className="pt-6 pb-8 flex flex-col h-full justify-between">
                                            <div>
                                                <h4 className="font-semibold text-lg mb-3 text-teal-700">
                                                    ส่งข้อมูลและรูปถ่าย
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    แจ้งข้อมูลตามรายการที่เตรียมไว้
                                                    พร้อมส่งรูปถ่ายล่าสุดของผู้สูญหาย
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                                        3
                                    </div>
                                    <Card className="pl-6 h-full group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                                        <CardContent className="pt-6 pb-8 flex flex-col h-full justify-between">
                                            <div>
                                                <h4 className="font-semibold text-lg mb-3 text-teal-700">
                                                    รอการตรวจสอบ
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    เจ้าหน้าที่จะตรวจสอบข้อมูลและติดต่อกลับเพื่อยืนยันรายละเอียดเพิ่มเติม
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                                        4
                                    </div>
                                    <Card className="pl-6 h-full group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                                        <CardContent className="pt-6 pb-8 flex flex-col h-full justify-between">
                                            <div>
                                                <h4 className="font-semibold text-lg mb-3 text-teal-700">
                                                    เผยแพร่ประกาศ
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    หากข้อมูลครบถ้วน
                                                    มูลนิธิจะเผยแพร่ประกาศผ่านเพจเพื่อช่วยตามหา
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Important Notes */}
                            <div className="rounded-2xl bg-gradient-to-r from-teal-500 to-blue-500 p-8 md:p-10 text-white hover:shadow-xl transition-shadow duration-300">
                                <h3 className="text-2xl font-bold mb-8 text-center">
                                    ข้อควรทราบ
                                </h3>
                                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="flex items-start gap-4 group">
                                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-none group-hover:scale-110 transition-transform duration-300">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-lg mb-2">
                                                ไม่ต้องรอ 24 ชั่วโมง
                                            </p>
                                            <p className="text-sm text-teal-50">
                                                แจ้งได้ทันทีเมื่อสงสัยว่าคนหาย
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 group">
                                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-none group-hover:scale-110 transition-transform duration-300">
                                            <Wallet className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-lg mb-2">
                                                ไม่มีค่าใช้จ่าย
                                            </p>
                                            <p className="text-sm text-teal-50">
                                                บริการนี้ไม่มีค่าใช้จ่ายใดๆ
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 group">
                                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-none group-hover:scale-110 transition-transform duration-300">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-lg mb-2">
                                                ข้อมูลปลอดภัย
                                            </p>
                                            <p className="text-sm text-teal-50">
                                                ข้อมูลจะถูกเก็บเป็นความลับ
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 group">
                                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-none group-hover:scale-110 transition-transform duration-300">
                                            <Bell className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-lg mb-2">
                                                แจ้งเมื่อพบตัว
                                            </p>
                                            <p className="text-sm text-teal-50">
                                                กรุณาแจ้งเจ้าหน้าที่เพื่ออัปเดตสถานะ
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Call to Action */}
                            <div className="text-center space-y-6 max-w-3xl mx-auto">
                                <div className="inline-flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-full">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">
                                        หากพบเห็นผู้ที่อาจเป็นบุคคลสูญหาย
                                        โปรดแจ้งทันที
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-4 justify-center">
                                    <Button
                                        size="lg"
                                        asChild
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Link
                                            href="https://www.facebook.com/thaimissing"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Facebook className="mr-2 h-5 w-5" />
                                            ติดต่อผ่าน Facebook
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="outline">
                                        <Phone className="mr-2 h-5 w-5" />
                                        080-775-2673
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

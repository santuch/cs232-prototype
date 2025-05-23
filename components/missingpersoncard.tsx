import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
    MapPin,
    Eye,
    Clock,
    AlertCircle,
    Share2,
    Link2,
    Check,
} from "lucide-react";
import { memo, forwardRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { motion } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface MissingPersonCardProps {
    name: string;
    age: number;
    location: string;
    lastSeen: string;
    description: string;
    imageUrl: string;
    found?: boolean;
    url?: string;
    caseId?: number;
    priority?: boolean;
}

// Shimmer effect component
const Shimmer = () => (
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
);

// Info Item Component
const InfoItem = memo(
    ({
        icon: Icon,
        label,
        value,
        color,
    }: {
        icon: React.ElementType;
        label: string;
        value: string;
        color: string;
    }) => (
        <div className="flex items-center gap-3 text-sm">
            <div
                className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-300",
                    `bg-${color}-100 dark:bg-${color}-900/30`
                )}
            >
                <Icon
                    className={cn(
                        "h-4 w-4",
                        `text-${color}-600 dark:text-${color}-400`
                    )}
                />
            </div>
            <div className="flex-1">
                <p className="font-medium text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    )
);

InfoItem.displayName = "InfoItem";

// Action Button Component
const ActionButton = memo(
    forwardRef<
        HTMLButtonElement,
        React.ButtonHTMLAttributes<HTMLButtonElement> & {
            icon: React.ElementType;
            variant?: "default" | "outline";
            asChild?: boolean;
        }
    >(
        (
            {
                icon: Icon,
                children,
                variant = "outline",
                asChild = false,
                className,
                disabled,
                ...props
            },
            ref
        ) => {
            const Comp = asChild ? Slot : "button";

            const content = (
                <>
                    <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    <span className="relative">
                        {children}
                        <Shimmer />
                    </span>
                </>
            );

            return (
                <Comp
                    ref={ref}
                    className={cn(
                        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-300",
                        "hover:shadow-lg hover:scale-105 active:scale-95",
                        variant === "outline"
                            ? "border-border/50 bg-background hover:bg-primary/5"
                            : "bg-primary text-primary-foreground hover:bg-primary/90",
                        disabled &&
                            "opacity-50 cursor-not-allowed hover:scale-100",
                        className
                    )}
                    {...props}
                >
                    {asChild ? children : content}
                </Comp>
            );
        }
    )
);

ActionButton.displayName = "ActionButton";

// Status Badge Component
const StatusBadge = memo(({ found, age }: { found?: boolean; age: number }) => (
    <Badge
        variant={found ? "default" : "secondary"}
        className={cn(
            "backdrop-blur-sm border-0 shadow-lg transition-all duration-300",
            found
                ? "bg-green-500/90 text-white hover:bg-green-600/90"
                : "bg-white/90 text-gray-900 hover:bg-white/95"
        )}
    >
        {found ? "✓ พบแล้ว" : `${age} ปี`}
    </Badge>
));

StatusBadge.displayName = "StatusBadge";

// Share Menu Component
const ShareMenu = memo(
    ({
        name,
        caseId,
        url,
    }: {
        name: string;
        caseId?: number;
        url?: string;
    }) => {
        const [copied, setCopied] = useState(false);
        const { toast } = useToast();

        const shareUrl = caseId
            ? `${window.location.origin}/person/${caseId}`
            : url || window.location.href;

        const shareText = `ช่วยกันค้นหา: ${name}`;

        const handleCopyLink = async () => {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                toast({
                    title: "คัดลอกลิงก์แล้ว",
                    description: "คุณสามารถแชร์ลิงก์นี้ได้แล้ว",
                });
                setTimeout(() => setCopied(false), 2000);
            } catch {
                toast({
                    variant: "destructive",
                    title: "ไม่สามารถคัดลอกลิงก์ได้",
                    description: "กรุณาลองใหม่อีกครั้ง",
                });
            }
        };

        const handleNativeShare = async () => {
            if (!navigator.share) return;

            try {
                await navigator.share({
                    title: shareText,
                    text: shareText,
                    url: shareUrl,
                });
                toast({
                    title: "แชร์สำเร็จ",
                    description: "ขอบคุณที่ช่วยแชร์ข้อมูล",
                });
            } catch (error) {
                if ((error as Error).name !== "AbortError") {
                    toast({
                        variant: "destructive",
                        title: "ไม่สามารถแชร์ได้",
                        description: "กรุณาลองใหม่อีกครั้ง",
                    });
                }
            }
        };

        return (
            <TooltipProvider>
                <Tooltip>
                    <DropdownMenu>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                                >
                                    <Share2 className="h-4 w-4 text-white" />
                                    <span className="sr-only">แชร์</span>
                                </Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>แชร์ข้อมูล</p>
                        </TooltipContent>
                        <DropdownMenuContent align="end" className="w-56">
                            {typeof navigator !== "undefined" &&
                                "share" in navigator && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={handleNativeShare}
                                            className="gap-2"
                                        >
                                            <Share2 className="h-4 w-4" />
                                            <span>แชร์</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                            <DropdownMenuItem
                                onClick={handleCopyLink}
                                className="gap-2"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-4 w-4 text-green-600" />
                                        <span>คัดลอกลิงก์แล้ว</span>
                                    </>
                                ) : (
                                    <>
                                        <Link2 className="h-4 w-4" />
                                        <span>คัดลอกลิงก์</span>
                                    </>
                                )}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </Tooltip>
            </TooltipProvider>
        );
    }
);

ShareMenu.displayName = "ShareMenu";

// Main Card Component
const MissingPersonCard = memo(function MissingPersonCard({
    name,
    age,
    location,
    lastSeen,
    description,
    imageUrl,
    found = false,
    url,
    caseId,
    priority = false,
}: MissingPersonCardProps) {
    const [imgSrc, setImgSrc] = useState(imageUrl);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        setImgSrc(imageUrl);
        setIsLoading(true);
        setIsError(false);
    }, [imageUrl]);

    const handleImageError = () => {
        setIsError(true);
        setImgSrc("/placeholder.svg");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
                "group relative overflow-hidden rounded-xl transition-all duration-300",
                found
                    ? "border-green-500/50"
                    : priority
                    ? "border-amber-500/50"
                    : "border-border/50",
                "hover:shadow-xl hover:shadow-primary/10"
            )}
        >
            <Card className="bg-background/50 backdrop-blur-sm border-0">
                {/* Image Container */}
                <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                    {isLoading && !isError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
                        </div>
                    )}
                    <Image
                        src={imgSrc}
                        alt={name}
                        fill
                        className={cn(
                            "object-cover transition-transform duration-500 group-hover:scale-105",
                            isLoading && !isError ? "opacity-0" : "opacity-100"
                        )}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                        quality={85}
                        onLoadingComplete={() => setIsLoading(false)}
                        onError={handleImageError}
                    />
                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                    {priority && (
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-transparent" />
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 flex gap-2">
                        <StatusBadge found={found} age={age} />
                        {priority && (
                            <Badge
                                variant="destructive"
                                className="animate-pulse"
                            >
                                <AlertCircle className="w-3 h-3 mr-1" />
                                ด่วน
                            </Badge>
                        )}
                    </div>

                    {/* Found Overlay */}
                    {found && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green-500/80 backdrop-blur-sm transition-opacity duration-300">
                            <div className="text-center scale-150 animate-in zoom-in-50 duration-300">
                                <div className="text-4xl font-bold text-white mb-2">
                                    ✓
                                </div>
                                <span className="text-xl font-bold text-white">
                                    พบแล้ว
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Name and Quick Actions */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end">
                        <h3 className="text-xl font-bold text-white drop-shadow-lg">
                            {name}
                        </h3>
                        <div className="flex gap-2">
                            <ShareMenu name={name} caseId={caseId} url={url} />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <CardContent className="p-5 space-y-4">
                    {/* Info Items */}
                    <div className="space-y-3">
                        <InfoItem
                            icon={MapPin}
                            label="สถานที่"
                            value={location}
                            color="blue"
                        />
                        <InfoItem
                            icon={Clock}
                            label="หายตัวครั้งสุดท้าย"
                            value={lastSeen}
                            color="orange"
                        />
                    </div>

                    {/* Description */}
                    <div className="pt-2">
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {description || "ไม่มีรายละเอียดเพิ่มเติม"}
                        </p>
                    </div>
                </CardContent>

                {/* Actions */}
                <CardFooter className="p-5 pt-0 flex gap-3">
                    <ActionButton
                        icon={Eye}
                        variant="outline"
                        asChild={Boolean(caseId || url)}
                        disabled={!caseId && !url}
                        className="flex-1"
                    >
                        {caseId || url ? (
                            <Link
                                href={caseId ? `/person/${caseId}` : url!}
                                target={url ? "_blank" : undefined}
                                rel={url ? "noopener noreferrer" : undefined}
                                className="inline-flex items-center justify-center gap-2"
                            >
                                <Eye className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                                <span className="relative">
                                    ดูรายละเอียด
                                    <Shimmer />
                                </span>
                            </Link>
                        ) : (
                            <>
                                <Eye className="h-4 w-4" />
                                <span>ดูรายละเอียด</span>
                            </>
                        )}
                    </ActionButton>
                </CardFooter>
            </Card>
        </motion.div>
    );
});

MissingPersonCard.displayName = "MissingPersonCard";

export default MissingPersonCard;

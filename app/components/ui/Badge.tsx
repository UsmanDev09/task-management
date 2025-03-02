// import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'outline';
    className?: string;
    onClick?: () => void;
}

export function Badge({ children, onClick }: BadgeProps) {
    return (
        <span
            className={
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors bg-primary text-primary-foreground"
            }
            onClick={onClick}
        >
            {children}
        </span>
    );
} 
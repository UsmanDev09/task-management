interface TooltipProps {
    children: React.ReactNode;
    text: string;
}

export function Tooltip({ children, text }: TooltipProps) {
    return (
        <div className="group relative inline-block">
            {children}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {text}
            </div>
        </div>
    );
} 
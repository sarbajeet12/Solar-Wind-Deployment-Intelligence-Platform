import { ArrowLeft } from "lucide-react";
import Button from "./Button";

/** Contextual in-app navigation; it deliberately does not modify browser history. */
export default function PageBackButton({ label, onClick, className = "" }) {
    return (
        <Button
            variant="ghost"
            onClick={onClick}
            className={`-ml-2 min-h-11 px-3 text-sm sm:text-base ${className}`}
            icon={<ArrowLeft size={18} aria-hidden="true" />}
        >
            {label}
        </Button>
    );
}

import React from "react";

interface AvatarProps {
    src?: string;
    alt?: string;
    size?: number;
    fallback?: React.ReactNode;
    className?: string;
}

const getInitials = (alt?: string) => {
    if (!alt) return "";
    const names = alt.split(" ");
    const initials = names.map((n) => n[0]?.toUpperCase()).join("");
    return initials.slice(0, 2);
};

export const Avatar: React.FC<AvatarProps> = ({
    src,
    alt,
    size = 40,
    fallback,
    className = "",
}) => {
    const [imgError, setImgError] = React.useState(false);

    return (
        <span
            className={`inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium overflow-hidden ${className}`}
            style={{ width: size, height: size, fontSize: size * 0.4 }}
            aria-label={alt}
        >
            {src && !imgError ? (
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                />
            ) : fallback ? (
                fallback
            ) : (
                <span>{getInitials(alt)}</span>
            )}
        </span>
    );
};
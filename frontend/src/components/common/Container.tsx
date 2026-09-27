import type { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({children, className}: ContainerProps) {
    return (
        <div className={`mx-auto w-[calc(100%-2rem)] max-w-295 sm:w-[calc(100%-3rem)] ${className}`}
>
            {children}
        </div>
    )
}
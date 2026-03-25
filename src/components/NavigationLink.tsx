import React from 'react';

interface NavigationLinkProps {
  href: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
  label?: string | React.ReactNode;
  children?: React.ReactNode;
}

export const NavigationLink: React.FC<NavigationLinkProps> = ({
  href,
  onClick,
  className = '',
  label,
  children,
}) => (
  <a
    href={href}
    onClick={(e) => {
      // Respect Ctrl/Cmd/Shift+Click for native browser behavior (new tab)
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        onClick?.(e);
      }
    }}
    className={className}
  >
    {children || label}
  </a>
);

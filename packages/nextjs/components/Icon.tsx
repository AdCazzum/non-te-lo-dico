import React from "react";

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

/**
 * Icon component using Font Awesome solid icons
 * All icons are from Font Awesome Free Solid set
 */
export const Icon: React.FC<IconProps> = ({ name, size = 18, className = "" }) => {
  // Map icon names to Font Awesome classes
  const iconMap: Record<string, string> = {
    upload: "fa-solid fa-upload",
    download: "fa-solid fa-download",
    lock: "fa-solid fa-lock",
    unlock: "fa-solid fa-lock-open",
    search: "fa-solid fa-magnifying-glass",
    file: "fa-solid fa-file",
    share: "fa-solid fa-share-nodes",
    check: "fa-solid fa-check",
    x: "fa-solid fa-xmark",
    alert: "fa-solid fa-triangle-exclamation",
    info: "fa-solid fa-circle-info",
    loading: "fa-solid fa-spinner fa-spin",
    copy: "fa-solid fa-copy",
    key: "fa-solid fa-key",
    shield: "fa-solid fa-shield-halved",
    user: "fa-solid fa-user",
    arrowRight: "fa-solid fa-chevron-right",
    home: "fa-solid fa-house",
    vault: "fa-solid fa-vault",
  };

  const iconClass = iconMap[name] || "fa-solid fa-circle";
  
  return (
    <i 
      className={`${iconClass} ${className}`} 
      style={{ fontSize: `${size}px` }}
      aria-hidden="true"
    />
  );
};

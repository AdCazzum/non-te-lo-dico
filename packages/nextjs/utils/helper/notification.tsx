import React from "react";
import { Toast, ToastPosition, toast } from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/20/solid";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";

type NotificationProps = {
  content: React.ReactNode;
  status: "success" | "info" | "loading" | "error" | "warning";
  duration?: number;
  icon?: string;
  position?: ToastPosition;
};

type NotificationOptions = {
  duration?: number;
  icon?: string;
  position?: ToastPosition;
};

const ENUM_STATUSES = {
  success: <CheckCircleIcon className="w-7" style={{ color: "#4ade80" }} />,
  loading: <div className="w-7 h-7 border-4 border-t-transparent border-[#f5c842] rounded-full animate-spin" />,
  error: <ExclamationCircleIcon className="w-7" style={{ color: "#f87171" }} />,
  info: <InformationCircleIcon className="w-7" style={{ color: "#60a5fa" }} />,
  warning: <ExclamationTriangleIcon className="w-7" style={{ color: "#fb923c" }} />,
};

const DEFAULT_DURATION = 3000;
const DEFAULT_POSITION: ToastPosition = "bottom-right";

/**
 * Custom Notification
 */
const Notification = ({
  content,
  status,
  duration = DEFAULT_DURATION,
  icon,
  position = DEFAULT_POSITION,
}: NotificationProps) => {
  const getBorderColor = () => {
    switch (status) {
      case "success":
        return "#4ade80";
      case "error":
        return "#f87171";
      case "warning":
        return "#fb923c";
      case "info":
        return "#60a5fa";
      case "loading":
        return "#f5c842";
      default:
        return "#3a3a3a";
    }
  };

  return toast.custom(
    (t: Toast) => (
      <div
        style={{
          background: "#1a1a1a",
          color: "#e5e5e5",
          border: `2px solid ${getBorderColor()}`,
          padding: "16px 18px",
          borderRadius: "0.75rem",
          fontSize: "0.9375rem",
          fontWeight: "500",
          maxWidth: "420px",
          minWidth: "320px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          position: "relative",
          transform: t.visible
            ? "translateY(0)"
            : position.substring(0, 6) === "bottom"
              ? "translateY(100px)"
              : "translateY(-100px)",
          transition: "all 0.3s ease-in-out",
          opacity: t.visible ? 1 : 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          {icon ? icon : ENUM_STATUSES[status]}
        </div>
        <div
          style={{
            flex: 1,
            overflowX: "hidden",
            wordBreak: "break-word",
            whiteSpace: "pre-line",
            lineHeight: "1.5",
          }}
        >
          {content}
        </div>
        <div
          style={{
            cursor: "pointer",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
          }}
          onClick={() => toast.dismiss(t.id)}
        >
          <XMarkIcon className="w-5 h-5" style={{ color: "#a3a3a3" }} />
        </div>
      </div>
    ),
    {
      duration: status === "loading" ? Infinity : duration,
      position,
    },
  );
};

export const notification = {
  success: (content: React.ReactNode, options?: NotificationOptions) => {
    return Notification({ content, status: "success", ...options });
  },
  info: (content: React.ReactNode, options?: NotificationOptions) => {
    return Notification({ content, status: "info", ...options });
  },
  warning: (content: React.ReactNode, options?: NotificationOptions) => {
    return Notification({ content, status: "warning", ...options });
  },
  error: (content: React.ReactNode, options?: NotificationOptions) => {
    return Notification({ content, status: "error", ...options });
  },
  loading: (content: React.ReactNode, options?: NotificationOptions) => {
    return Notification({ content, status: "loading", ...options });
  },
  remove: (toastId: string) => {
    toast.remove(toastId);
  },
};

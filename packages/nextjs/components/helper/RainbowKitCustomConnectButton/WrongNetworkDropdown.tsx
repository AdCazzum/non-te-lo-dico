import { useRef, useState } from "react";
import { NetworkOptions } from "./NetworkOptions";
import { useDisconnect } from "wagmi";
import { Icon } from "~~/components/Icon";
import { useOutsideClick } from "~~/hooks/helper";

export const WrongNetworkDropdown = () => {
  const { disconnect } = useDisconnect();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOutsideClick(dropdownRef, () => setIsOpen(false));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
        type="button"
      >
        <Icon name="alert" size={18} />
        <span>Wrong Network</span>
        <Icon name="arrowRight" size={16} className={`transform transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg overflow-hidden z-50">
          <div className="py-1">
            <NetworkOptions hidden={false} />
            <button
              className="w-full px-4 py-3 text-left text-sm hover:bg-red-900/20 text-red-400 flex items-center gap-3 transition-colors border-t border-[var(--color-border)]"
              type="button"
              onClick={() => {
                disconnect();
                setIsOpen(false);
              }}
            >
              <Icon name="x" size={16} />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

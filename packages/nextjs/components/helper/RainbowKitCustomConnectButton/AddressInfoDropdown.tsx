import { useRef, useState } from "react";
import { NetworkOptions } from "./NetworkOptions";
import { Address, getAddress } from "viem";
import { useDisconnect } from "wagmi";
import { BlockieAvatar } from "~~/components/helper";
import { useOutsideClick } from "~~/hooks/helper";
import { getTargetNetworks } from "~~/utils/helper";
import { Icon } from "~~/components/Icon";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  displayName: string;
  ensAvatar?: string;
  blockExplorerAddressLink?: string;
};

export const AddressInfoDropdown = ({ address, ensAvatar, displayName }: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const checkSumAddress = getAddress(address);

  const [selectingNetwork, setSelectingNetwork] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeDropdown = () => {
    setSelectingNetwork(false);
    setIsOpen(false);
  };

  useOutsideClick(dropdownRef, closeDropdown);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-outline flex items-center gap-2 pl-2 pr-3"
        type="button"
      >
        <BlockieAvatar address={checkSumAddress} size={24} ensImage={ensAvatar} />
        <span className="text-sm font-medium">{displayName}</span>
        <Icon name="arrowRight" size={16} className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-[var(--color-border)] rounded-lg shadow-lg overflow-hidden z-50">
          {selectingNetwork ? (
            <NetworkOptions hidden={false} />
          ) : (
            <div className="py-1">
              {allowedNetworks.length > 1 && (
                <button
                  className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--color-secondary)] flex items-center gap-3 transition-colors"
                  type="button"
                  onClick={() => setSelectingNetwork(true)}
                >
                  <Icon name="arrowRight" size={16} />
                  <span>Switch Network</span>
                </button>
              )}
              <button
                className="w-full px-4 py-3 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-3 transition-colors"
                type="button"
                onClick={() => {
                  disconnect();
                  closeDropdown();
                }}
              >
                <Icon name="x" size={16} />
                <span>Disconnect</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import { useAccount, useSwitchChain } from "wagmi";
import { Icon } from "~~/components/Icon";
import { getTargetNetworks } from "~~/utils/helper";

const allowedNetworks = getTargetNetworks();

type NetworkOptionsProps = {
  hidden?: boolean;
};

export const NetworkOptions = ({ hidden = false }: NetworkOptionsProps) => {
  const { switchChain } = useSwitchChain();
  const { chain } = useAccount();

  if (hidden) return null;

  return (
    <div className="py-1">
      {allowedNetworks
        .filter(allowedNetwork => allowedNetwork.id !== chain?.id)
        .map(allowedNetwork => (
          <button
            key={allowedNetwork.id}
            className="w-full px-4 py-3 text-left text-sm hover:bg-[var(--color-surface-hover)] flex items-center gap-3 transition-colors text-[var(--color-foreground)]"
            type="button"
            onClick={() => {
              switchChain?.({ chainId: allowedNetwork.id });
            }}
          >
            <Icon name="arrowRight" size={16} />
            <span>Switch to {allowedNetwork.name}</span>
          </button>
        ))}
    </div>
  );
};

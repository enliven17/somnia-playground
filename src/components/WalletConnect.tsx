'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useDisconnect } from 'wagmi';
import { WalletIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function WalletConnect() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  return (
    <div className="flex items-center space-x-4">
      {isConnected ? (
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-somnia-500/20 px-3 py-2 rounded-lg border border-somnia-500/30">
            <WalletIcon className="h-4 w-4 text-somnia-400" />
            <span className="text-sm text-white font-medium">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </div>
          <button
            onClick={() => disconnect()}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Disconnect Wallet"
          >
            <ArrowRightOnRectangleIcon className="h-4 w-4" />
            <span>Disconnect</span>
          </button>
        </div>
      ) : (
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === 'authenticated');

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  'style': {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        type="button"
                        className="btn-primary flex items-center space-x-2"
                      >
                        <WalletIcon className="h-4 w-4" />
                        <span>Connect Wallet</span>
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Wrong network
                      </button>
                    );
                  }

                  return (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={openChainModal}
                        className="flex items-center space-x-2 bg-green-500/20 px-3 py-2 rounded-lg border border-green-500/30"
                        type="button"
                      >
                        {chain.hasIcon && (
                          <div
                            style={{
                              background: chain.iconBackground,
                              width: 16,
                              height: 16,
                              borderRadius: 999,
                              overflow: 'hidden',
                              marginRight: 4,
                            }}
                          >
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                style={{ width: 16, height: 16 }}
                              />
                            )}
                          </div>
                        )}
                        <span className="text-sm text-green-400 font-medium">
                          {chain.name}
                        </span>
                      </button>

                      <button
                        onClick={openAccountModal}
                        type="button"
                        className="flex items-center space-x-2 bg-somnia-500/20 px-3 py-2 rounded-lg border border-somnia-500/30 hover:bg-somnia-500/30 transition-colors"
                      >
                        <WalletIcon className="h-4 w-4 text-somnia-400" />
                        <span className="text-sm text-white font-medium">
                          {account.displayName}
                        </span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      )}
    </div>
  );
}
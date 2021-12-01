import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { injected } from "./Connector";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";

export interface IERC20 {
  symbol: string,
  address: string,
  decimals: number,
  name: string
}

export const Networks = {
  MainNet: 1,
  Rinkeby: 4,
  Ropsten: 3,
  Kovan: 42,
  Polygon: 137
}

function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return "No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.";
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network.";
  } else if (error instanceof UserRejectedRequestErrorInjected) {
    return "Please authorize this website to access your Ethereum account.";
  } else {
    console.error(error);
    return "An unknown error occurred. Check the console for more details.";
  }
}

export default function App() {
  const { chainId, activate, deactivate, active, error } = useWeb3React();
  const [connectedNetwork, setConnectedNetwork] = useState("");
  const [selectedKey, setSelectedKey] = useState('none');
  const TOKENS_BY_NETWORK = () => {
    switch (parseInt(`${chainId}`)) {
      case 1:
      case 3:
      case 4:
      case 42:
        return [
          {
            address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            symbol: "ETH",
            name: "ETH",
            decimals: 18,
          },
          {
            address: "0x55d398326f99059ff775485246999027b3197955",
            symbol: "USDT",
            name: "USDT",
            decimals: 18,
          },
          {
            address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
            symbol: "USDC",
            name: "USDC",
            decimals: 18
          }
        ]
      case 137:
        return [
          {
            address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
            symbol: "MATIC",
            name: "MATIC",
            decimals: 18,
          }
        ];
      default:
        return [];
    }
    
  }
  console.log("active: ", active);
  console.log("chainId: ", chainId);

  useEffect((): any => {
    const network = chainId === 1 || chainId === 3 || chainId === 4 || chainId === 42 ? `Ethereum` : chainId === 137 ? `Polygon` : ``;
    setConnectedNetwork(network);
    setSelectedKey('none');
  }, [active, chainId]);

  function connect() {
    activate(injected);
  }

  function disconnect() {
    deactivate();
  }

  function swtichToPolygon() {
    const { ethereum } = window;
    ethereum
      .request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x89" }],
      })
      .then((result: any) => {})
      .catch((switchError: { code: number }) => {
        console.log("switchError.code: ", switchError.code);
        if (switchError.code === 4902) {
          ethereum
            .request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x89",
                  chainName: "Polygon",
                  nativeCurrency: {
                    name: "Matic",
                    symbol: "MATIC",
                    decimals: 18,
                  },
                  rpcUrls: ["https://polygon-rpc.com"],
                  blockExplorerUrls: ["https://polygonscan.com/"],
                },
              ],
            })
            .catch((addError: any) => {
              console.log("Add network error!", addError);
            });
        }
      })
      .finally(() => {});
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" padding={2}>
        <Typography>Dashboard</Typography>
        <Stack direction="row" alignItems="center" spacing={5}>
          <Typography>{`Connected to: ${connectedNetwork}`}</Typography>
          <Button variant="contained" onClick={connect}>
            {"CONNECT"}
          </Button>
        </Stack>
      </Stack>
      <Stack direction="column" alignItems="center" padding={2}>
        {TOKENS_BY_NETWORK().length > 0 && TOKENS_BY_NETWORK().map((token: any, index) => (
          <Button
            disabled={selectedKey !== 'none' && selectedKey !== token.symbol}
            variant="contained"
            key={index}
            style={{ marginBottom: 10 }}
            onClick={() => setSelectedKey(selectedKey === token.symbol ? 'none' : token.symbol)}
          >
            KEY: {token.symbol}
          </Button>
        ))}
      </Stack>
      <Stack height="90vh" justifyContent="center" alignItems="center">
        <Button variant="contained" onClick={swtichToPolygon}>
          Switch to Polygon
        </Button>
        {!!error && (
          <h4 style={{ marginTop: "1rem", marginBottom: "0" }}>
            {getErrorMessage(error)}
          </h4>
        )}
      </Stack>
    </Box>
  );
}

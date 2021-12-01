import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { injected } from "./Connector";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";

import Web3 from 'web3'

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

const account = (web3: Web3) => {
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts((err, accounts) => {
      if (err === null) {
        resolve(accounts[0])
      } else {
        reject(err)
      }
    })
  })
}

export default function App() {
  const { chainId, activate, deactivate, active, error } = useWeb3React();
  const [connectedNetwork, setConnectedNetwork] = useState("");

  console.log("active: ", active);
  console.log("chainId: ", chainId);

  useEffect((): any => {
    const network = chainId === 1 ? `Ethereum` : chainId === 137 ? `Polygon` : ``;
    setConnectedNetwork(network);
    if (chainId === 137) {
      const web3 = new Web3(window.ethereum)
      account(web3).then(account => {
        const revenueContract = new web3.eth.Contract([{"inputs": [{"internalType": "address", "name": "account", "type": "address"}, {"internalType": "uint256", "name": "id", "type": "uint256"}], "name": "balanceOf", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"}], "0x3702f4c46785bbd947d59a2516ac1ea30f2babf2")
        for (let tokenId = 1; tokenId <= 3; tokenId++) {
          revenueContract.methods.balanceOf("0x291763E8F7D15679B6bE22755Ee3001558C8C430", tokenId)
          .call({ from: account })
          .then((result: string) => {
            console.log("balanceOf", tokenId, result)
          })
        }
      })
    }
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

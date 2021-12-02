import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { injected } from "./Connector";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";

import Web3 from 'web3'
import './styles/app.css'
import Logo from './assets/imgs/logo.png';
import Key1 from './assets/imgs/key1.png';
import Key2 from './assets/imgs/key2.png';
import Key3 from './assets/imgs/key3.png';
import KeyBackground from './assets/imgs/key-background.png';

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
  const [switchedNetwork, setSwitchedNetwork] = useState(false);
  const [selectedKey, setSelectedKey] = useState('none');
  const [keys, setKeys] = useState([
    {
      image: Key1,
      name: 'Tier 1 Genesis Key',
      value: 0,
      keyId: "1"
    },
    {
      image: Key2,
      name: 'Tier 2 Genesis Key',
      value: 0,
      keyId: "2"
    },
    {
      image: Key3,
      name: 'Tier 3 Genesis Key',
      value: 0,
      keyId: "3"
    }
  ]);
  console.log("active: ", active);
  console.log("chainId: ", chainId);

  useEffect((): any => {
    const network = chainId === 1 ? `ETH mainnet` : chainId === 137 ? `Polygon mainnet` : ``;
    setConnectedNetwork(network);

    if (chainId === 137) {
      console.log('chainId', chainId);
      setSwitchedNetwork(true);
      const web3 = new Web3(window.ethereum)
      account(web3).then(account => {
        const revenueContract = new web3.eth.Contract([{ "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "id", "type": "uint256" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }], "0x3702f4c46785bbd947d59a2516ac1ea30f2babf2")
        for (let tokenId = 1; tokenId <= 3; tokenId++) {
          revenueContract.methods.balanceOf(account, tokenId)
            .call({ from: account })
            .then((result: string) => {
              //0x18632ee94d6395e0cd1ea6c7ee702712baf7c6d9 :test https://opensea.io/GFCVault,  the address of our vault
              let newData = [...keys];
              newData[Number(tokenId) - 1].value = Number(result);
              setKeys(newData);
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
      .then((result: any) => {
        setSwitchedNetwork(true);
      })
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
      .finally(() => { });
  }

  return (
    <Box className="app-container">
      <Stack direction="row" justifyContent="space-between" alignItems="center" className="app-header">
        <Stack alignItems="center" direction="row" className="logo">
          <a href="/">
            <img src={Logo} width="100" style={{ marginRight: 10 }} />
          </a>
          Genesis Keys
        </Stack>
        <Stack direction="row" alignItems="center" spacing={3} className="connection">
          <Typography style={{ paddingLeft: 20 }}>
            {
              connectedNetwork ? (
                <Stack alignItems="center" direction="row">
                  <div style={{ display: "inline-block", width: 14, height: 14, background: '#57D12C', borderRadius: 14, marginRight: 10 }}>
                  </div>
                  {connectedNetwork}
                </Stack>
              ) : (
                <Stack alignItems="center" direction="row">
                  <div style={{ display: "inline-block", width: 14, height: 14, background: '#F11616', borderRadius: 14, marginRight: 10 }}>
                  </div>
                  Not Connected
                </Stack>
              )
            }
          </Typography>
          <Button variant="contained" onClick={connect}>
            {"Connect"}
          </Button>
        </Stack>
      </Stack>
      <Stack height="90vh" justifyContent="center" alignItems="center">
        {
          chainId !== undefined && (
            !switchedNetwork ? (
              <Box className="message-box">
                <div className="box-text">In order to open loot boxes, <br />you will have to be on the Polygon network</div>
                <Stack justifyContent="center" alignItems="center">
                  <Button variant="contained" onClick={swtichToPolygon}>
                    Add Polygon network
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box className="keys-group">
                <Stack direction="row" justifyContent="space-between" padding={2}>
                  {
                    keys.map((key, index) => (
                      <div className="group-item" key={index}>
                        <img src={KeyBackground} className="background" />
                        <div className="key-item">
                          <img src={key.image} />
                          <div className="key-title">{key.name}</div>
                          <div className="key-value">
                            You have: {key.value}
                          </div>
                          <Stack justifyContent="center" alignItems="center">
                            <Button
                              variant="contained"
                              className="setkey-btn"
                              disabled={selectedKey !== key.keyId && selectedKey !== 'none'}
                              onClick={() => setSelectedKey(selectedKey === key.keyId ? 'none' : key.keyId)}
                            >
                              Use Key
                            </Button>
                          </Stack>
                        </div>
                      </div>
                    ))
                  }
                </Stack>
              </Box>
            )
          )
        }
        {!!error && (
          <h4 style={{ marginTop: "1rem", marginBottom: "0" }}>
            {getErrorMessage(error)}
          </h4>
        )}
      </Stack>
    </Box>
  );
}

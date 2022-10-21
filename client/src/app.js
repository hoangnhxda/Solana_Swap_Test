import "./styles.css";

import { useEffect, useState } from "react";
import * as web3 from "@solana/web3.js";

function App() {
  const [provider, setProvider] = useState(null);
  const [walletKey, setWalletKey] = useState(null);

  const getProvider = () => {
    if ("solana" in window) {
      const provider = window.solana;
      if (provider.isPhantom) {
        return provider;
      }
    }
  };

  const connectWallet = async () => {
    const provider = getProvider();
    if (provider) {
      try {
        const response = await provider.connect();
        const pubKey = await provider.publicKey;
        console.log(pubKey);
        setProvider(provider);
        setWalletKey(response.publicKey.toString());
      } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
      }
    }
  };

  useEffect(() => connectWallet, []);

  const airDropSol = async (connection, publicKey) => {
    try {
      const airdropSignature = await connection.requestAirdrop(
        publicKey,
        web3.LAMPORTS_PER_SOL
      );

      const latestBlockHash = await connection.getLatestBlockhash();

      // Confirming that the airdrop went through
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: airdropSignature
      });
      console.log("Airdropped");
    } catch (error) {
      console.error(error);
    }
  };

  async function transferSOL() {
    //Changes are only here, in the beginning
    const phantomProvider = provider;
    if (!phantomProvider) {
      console.log("No provider found", phantomProvider);
    }
    const pubKey = await phantomProvider.publicKey;
    console.log("Public Key: ", pubKey);

    // Establishing connection
    var connection = new web3.Connection(
      web3.clusterApiUrl("testnet"),
      "confirmed"
    );

    // Airdrop some SOL to the sender's wallet, so that it can handle the txn fee
    var result = await airDropSol(connection, pubKey);
    console.log("airdrop result: ", result);
  }

  return (
    <div className="App">
      <header className="App-header">
        <h2>Swap Test App</h2>
      </header>
      <form>
        <p>SOL<input type="number" className="TokenNumInput"></input> &#10132; <input type="number" className="TokenNumInput"></input>MOVE</p>
        
      </form>
      <p><button onClick={transferSOL}>SWAP</button></p>
        {provider && walletKey && <p>Connected account {walletKey}</p>}

        {!provider && (
          <p>
            No provider found. Install{" "}
            <a href="https://phantom.app/">Phantom Browser extension</a>
          </p>
        )}
    </div>
  );
}

export default App;

import logo from './logo.svg';
import './App.css';

import { useEffect, useState} from 'react';
import { PublicKey, Transaction, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";
import * as web3 from "@solana/web3.js";
import { BN } from "bn.js";
import { Buffer } from "buffer";

const DECIMALS = 9;

type DisplayEncoding = "utf8" | "hex";
type PhantomEvent = "disconnect" | "connect" | "accountChanged";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

function App() {
  const [provider, setProvider] = useState<PhantomProvider | undefined>(
    undefined
  );
  const [walletKey, setWalletKey] = useState<PublicKey | undefined>(
    undefined
  );

  /**
   * @description gets Phantom provider, if it exists
   */
  const getProvider = (): PhantomProvider | undefined => {
    if ("solana" in window) {
      // @ts-ignore
      const provider = window.solana as any;
      if (provider.isPhantom) return provider as PhantomProvider;
    }
  };

  /**
   * @description prompts user to connect wallet if it exists
   */
  const connectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

    if (solana) {
      try {
        const response = await solana.connect();
        console.log("wallet account ", response.publicKey.toString());
        setWalletKey(response.publicKey);
      } catch (err) {
        console.log("connect wallet err: " + err);
        // { code: 4001, message: 'User rejected the request.' }
      }
    }
  };

  /**
   * @description disconnect Phantom wallet
   */
  const disconnectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

    if (walletKey && solana) {
      await (solana as PhantomProvider).disconnect();
      setWalletKey(undefined);
    }
  };

  // detect phantom provider exists
  useEffect(() => {
    const provider = getProvider();

    if (provider) {
      setProvider(provider);
      connectWallet();
    }
    else setProvider(undefined);
  }, []);

  async function createKeypairFromFile(
    filePath: string
  ): Promise<Keypair> {
    var secretKeyString = "[142,27,94,44,6,223,34,124,79,198,60,75,46,193,58,114,24,189,92,138,255,133,89,237,80,100,8,163,42,65,124,247,123,106,53,141,203,11,181,45,224,208,135,73,182,161,104,140,210,208,217,30,126,83,122,140,154,173,167,60,76,100,203,157]";
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString.toString()));
    return Keypair.fromSecretKey(secretKey);
  }

  async function callSmartContract() {

    let programId: PublicKey;

    // console.log("programId: ", programId);

    var connection = new web3.Connection(
      web3.clusterApiUrl("devnet"),
      "confirmed"
    );



    try {
      const programKeypair = await createKeypairFromFile('');
      programId = programKeypair.publicKey;
    } catch (err) {
      const errMsg = (err as Error).message;
      throw new Error(
        `Failed to read program keypair at due to error: ${errMsg}. Program may need to be deployed with \`solana program deploy dist/program/tokenswap.so\``
      );
    }

    var tx = new web3.Transaction();

    enum InstructionTypes {
      CreateTokenccount = 0,
      SwapSolToMove,
      SwapMoveToSol
    }

    var data : Buffer;
    var keys : web3.AccountMeta[];
    var instructionCommand : Uint8Array = new Uint8Array(0);
    var commandData : Uint8Array = new Uint8Array(100);
    if (walletKey !== undefined) 
    {
      keys = [{ pubkey: walletKey, isSigner: true, isWritable: true }];
      data = Buffer.from(
        Uint8Array.of(
          1,
          ...new BN(6 * LAMPORTS_PER_SOL).toArray("le", 8)
        )
      );
    } else {
      keys = [];
      data = Buffer.from(new Uint8Array([1]));
    }
    // var allocateTransaction = new web3.Transaction();
    tx.add(
      new web3.TransactionInstruction({
        programId: programId,
        keys,
        data,
      }),
    );

    console.log("Before send transaction");

    tx.feePayer = tx.feePayer || walletKey || undefined;
    tx.recentBlockhash =
        tx.recentBlockhash || (await connection.getLatestBlockhash('finalized')).blockhash;

    var signedTransaction: Transaction;
    var signature;
    if (provider !== undefined) {
      signedTransaction = await provider.signTransaction(tx);
      console.log("Signed transaction");
      signature = await connection.sendRawTransaction(signedTransaction.serialize());
      console.log("Send and confirm transaction");
    }

    const latestBlockHash = await connection.getLatestBlockhash();

      // Confirming that the transaction went through
    // var txid = await connection.confirmTransaction({
    //     blockhash: latestBlockHash.blockhash,
    //     lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    //     signature: signature
    //   });

      // console.log(txid);
    console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    }

  return (
    <div className="App">
      <header className="App-header">
        <h2>Swap Test App</h2>
      </header>
      <form>
        <p>SOL<input type="number" className="TokenNumInput"></input> &#10132; <input type="number" className="TokenNumInput"></input>MOVE</p>
        
      </form>
      <p><button onClick={callSmartContract}>SWAP</button></p>
      {/* {provider && walletKey && <CustomComp/>} */}

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

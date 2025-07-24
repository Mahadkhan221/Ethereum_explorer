import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { 
  balanceResponseSchema, 
  blocksResponseSchema, 
  transactionsResponseSchema, 
  networkStatusResponseSchema 
} from "@shared/schema";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || process.env.VITE_ALCHEMY_API_KEY || "CPbZRXVteDe0NB46s4oda4q_KEIMPfMu";
const ALCHEMY_URL = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

// Helper function to make RPC calls to Alchemy
async function alchemyRpcCall(method: string, params: any[] = []) {
  const response = await fetch(ALCHEMY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`Alchemy API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`RPC error: ${data.error.message}`);
  }

  return data.result;
}

// Helper function to convert hex to decimal
function hexToDecimal(hex: string): number {
  return parseInt(hex, 16);
}

// Helper function to convert wei to ETH
function weiToEth(wei: string): string {
  const weiNum = BigInt(wei);
  const ethNum = Number(weiNum) / 1e18;
  return ethNum.toFixed(6);
}

// Helper function to format time ago
function timeAgo(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 60) return `${Math.floor(diff)} secs ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

// Validate Ethereum address
function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get network status
  app.get("/api/network-status", async (req, res) => {
    try {
      const startTime = Date.now();
      const [blockNumber, chainId] = await Promise.all([
        alchemyRpcCall('eth_blockNumber'),
        alchemyRpcCall('eth_chainId')
      ]);
      const responseTime = Date.now() - startTime;

      const networkInfo = {
        chainId: hexToDecimal(chainId),
        name: 'Sepolia',
        blockNumber: hexToDecimal(blockNumber),
        isConnected: true,
        responseTime,
      };

      const validatedResponse = networkStatusResponseSchema.parse(networkInfo);
      res.json(validatedResponse);
    } catch (error) {
      console.error('Network status error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch network status' 
      });
    }
  });

  // Get wallet balance
  app.get("/api/balance/:address", async (req, res) => {
    try {
      const { address } = req.params;
      
      if (!isValidEthereumAddress(address)) {
        return res.status(400).json({ message: 'Invalid Ethereum address format' });
      }

      const balance = await alchemyRpcCall('eth_getBalance', [address, 'latest']);
      const balanceInEth = weiToEth(hexToDecimal(balance).toString());

      const balanceData = {
        address,
        balance: hexToDecimal(balance).toString(),
        balanceInEth,
      };

      const validatedResponse = balanceResponseSchema.parse(balanceData);
      res.json(validatedResponse);
    } catch (error) {
      console.error('Balance fetch error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch balance' 
      });
    }
  });

  // Get latest blocks
  app.get("/api/blocks", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const latestBlockNumber = await alchemyRpcCall('eth_blockNumber');
      const latestBlockNum = hexToDecimal(latestBlockNumber);

      const blockPromises = [];
      for (let i = 0; i < limit; i++) {
        const blockNum = `0x${(latestBlockNum - i).toString(16)}`;
        blockPromises.push(alchemyRpcCall('eth_getBlockByNumber', [blockNum, false]));
      }

      const blocks = await Promise.all(blockPromises);
      
      const formattedBlocks = blocks.map(block => ({
        number: hexToDecimal(block.number),
        hash: block.hash,
        timestamp: hexToDecimal(block.timestamp),
        gasUsed: hexToDecimal(block.gasUsed).toLocaleString(),
        gasLimit: hexToDecimal(block.gasLimit).toLocaleString(),
        transactionCount: block.transactions.length,
        age: timeAgo(hexToDecimal(block.timestamp)),
      }));

      const validatedResponse = blocksResponseSchema.parse(formattedBlocks);
      res.json(validatedResponse);
    } catch (error) {
      console.error('Blocks fetch error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch blocks' 
      });
    }
  });

  // Get recent transactions for an address
  app.get("/api/transactions/:address", async (req, res) => {
    try {
      const { address } = req.params;
      
      if (!isValidEthereumAddress(address)) {
        return res.status(400).json({ message: 'Invalid Ethereum address format' });
      }

      // Get recent blocks and extract transactions
      const latestBlockNumber = await alchemyRpcCall('eth_blockNumber');
      const latestBlockNum = hexToDecimal(latestBlockNumber);
      
      const blockPromises = [];
      for (let i = 0; i < 5; i++) {
        const blockNum = `0x${(latestBlockNum - i).toString(16)}`;
        blockPromises.push(alchemyRpcCall('eth_getBlockByNumber', [blockNum, true]));
      }

      const blocks = await Promise.all(blockPromises);
      const allTransactions = blocks.flatMap(block => block.transactions || []);
      
      // Filter transactions involving the address
      const relevantTxs = allTransactions
        .filter(tx => tx.from?.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase())
        .slice(0, 10);

      const formattedTransactions = relevantTxs.map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: weiToEth(hexToDecimal(tx.value).toString()),
        timestamp: Date.now() / 1000, // Approximate timestamp
        status: 'success' as const,
        type: tx.from?.toLowerCase() === address.toLowerCase() ? 'send' as const : 'receive' as const,
      }));

      const validatedResponse = transactionsResponseSchema.parse(formattedTransactions);
      res.json(validatedResponse);
    } catch (error) {
      console.error('Transactions fetch error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch transactions' 
      });
    }
  });

  // Get general recent transactions (from latest blocks)
  app.get("/api/transactions", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const latestBlockNumber = await alchemyRpcCall('eth_blockNumber');
      const latestBlockNum = hexToDecimal(latestBlockNumber);
      
      const blockPromises = [];
      for (let i = 0; i < 3; i++) {
        const blockNum = `0x${(latestBlockNum - i).toString(16)}`;
        blockPromises.push(alchemyRpcCall('eth_getBlockByNumber', [blockNum, true]));
      }

      const blocks = await Promise.all(blockPromises);
      const allTransactions = blocks.flatMap(block => 
        (block.transactions || []).map((tx: any) => ({
          ...tx,
          blockTimestamp: hexToDecimal(block.timestamp)
        }))
      );
      
      const recentTxs = allTransactions.slice(0, limit);

      const formattedTransactions = recentTxs.map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: weiToEth(hexToDecimal(tx.value).toString()),
        timestamp: tx.blockTimestamp,
        status: 'success' as const,
        type: 'send' as const,
      }));

      const validatedResponse = transactionsResponseSchema.parse(formattedTransactions);
      res.json(validatedResponse);
    } catch (error) {
      console.error('Transactions fetch error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch transactions' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Box, 
  Network, 
  Link, 
  Search, 
  ExternalLink, 
  ArrowDown, 
  ArrowUp, 
  Clock,
  Loader2
} from "lucide-react";
import { SiEthereum } from "react-icons/si";
import type { 
  NetworkStatusResponse, 
  BalanceResponse, 
  BlocksResponse, 
  TransactionsResponse 
} from "@shared/schema";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("");
  const [checkedAddress, setCheckedAddress] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch network status
  const { data: networkStatus, isLoading: networkLoading } = useQuery<NetworkStatusResponse>({
    queryKey: ['/api/network-status'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch latest blocks
  const { data: blocks, isLoading: blocksLoading } = useQuery<BlocksResponse>({
    queryKey: ['/api/blocks'],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Fetch recent transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery<TransactionsResponse>({
    queryKey: ['/api/transactions'],
    refetchInterval: 15000,
  });

  // Fetch balance for checked address
  const { data: balance, isLoading: balanceLoading, error: balanceError } = useQuery<BalanceResponse>({
    queryKey: ['/api/balance', checkedAddress],
    enabled: !!checkedAddress,
  });

  // Check balance mutation
  const checkBalanceMutation = useMutation({
    mutationFn: async (address: string) => {
      if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new Error("Please enter a valid Ethereum address (42 characters starting with 0x)");
      }
      return address;
    },
    onSuccess: (address) => {
      setCheckedAddress(address);
      queryClient.invalidateQueries({ queryKey: ['/api/balance', address] });
    },
    onError: (error) => {
      toast({
        title: "Invalid Address",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    checkBalanceMutation.mutate(walletAddress);
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <SiEthereum className="text-2xl text-ethereum-500" />
              <h1 className="text-xl font-semibold text-gray-900">Sepolia Explorer</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${networkStatus?.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">
                  {networkStatus?.isConnected ? 'Connected to Sepolia' : 'Disconnected'}
                </span>
              </div>
              
              <div className="bg-ethereum-50 px-3 py-1 rounded-full">
                <span className="text-xs font-medium text-ethereum-700">Testnet</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Network Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Block</p>
                  {networkLoading ? (
                    <Skeleton className="h-8 w-24 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {networkStatus?.blockNumber?.toLocaleString()}
                    </p>
                  )}
                </div>
                <Box className="text-ethereum-500 text-xl" />
              </div>
              {networkStatus?.responseTime && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500">
                    Response: {networkStatus.responseTime}ms
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Network</p>
                  <p className="text-2xl font-bold text-gray-900">Sepolia</p>
                </div>
                <Network className="text-ethereum-500 text-xl" />
              </div>
              <div className="mt-2">
                <span className="text-xs text-green-600 font-medium">Online</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chain ID</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {networkStatus?.chainId || '11155111'}
                  </p>
                </div>
                <Link className="text-ethereum-500 text-xl" />
              </div>
              <div className="mt-2">
                <span className="text-xs text-gray-500">Ethereum Testnet</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wallet Balance Checker */}
          <Card>
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                Wallet Balance Checker
              </CardTitle>
              <p className="text-sm text-gray-600">
                Enter an Ethereum address to check its balance on Sepolia testnet
              </p>
            </CardHeader>
            
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Wallet Address
                  </Label>
                  <div className="relative">
                    <Input
                      type="text" 
                      id="walletAddress"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="0x742d35Cc6664C02cf11234567890abcdef123456"
                      className="pr-20"
                    />
                    <Button 
                      type="submit"
                      size="sm"
                      disabled={checkBalanceMutation.isPending}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-ethereum-500 hover:bg-ethereum-600"
                    >
                      {checkBalanceMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Check'
                      )}
                    </Button>
                  </div>
                </div>
              </form>

              {/* Balance Display */}
              {checkedAddress && (
                <>
                  {balanceLoading ? (
                    <div className="mt-6 p-8 text-center">
                      <div className="inline-flex items-center space-x-2">
                        <Loader2 className="animate-spin text-ethereum-500" />
                        <span className="text-sm text-gray-600">Fetching balance...</span>
                      </div>
                    </div>
                  ) : balanceError ? (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-red-700">Error: {balanceError.message}</span>
                      </div>
                    </div>
                  ) : balance ? (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Balance</p>
                          <p className="text-xl font-bold text-gray-900">{balance.balanceInEth} SEP ETH</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">USD Value</p>
                          <p className="text-lg font-semibold text-gray-700">$0.00</p>
                          <span className="text-xs text-gray-500">(Testnet)</span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                Recent Transactions
              </CardTitle>
              <p className="text-sm text-gray-600">Latest transactions on Sepolia network</p>
            </CardHeader>
            
            <CardContent className="p-6">
              {transactionsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-20 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-3 w-16 mb-1" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((tx, index) => (
                    <div key={tx.hash} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          {tx.type === 'send' ? (
                            <ArrowUp className="text-blue-600 text-xs" />
                          ) : (
                            <ArrowDown className="text-green-600 text-xs" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tx.value} SEP ETH</p>
                          <p className="text-xs text-gray-500">
                            {tx.type === 'send' ? 'To:' : 'From:'} {(tx.to || tx.from)?.slice(0, 6)}...{(tx.to || tx.from)?.slice(-4)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{Math.floor(Math.random() * 10) + 1} min ago</p>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent transactions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Latest Blocks */}
        <Card className="mt-8">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              Latest Blocks
            </CardTitle>
            <p className="text-sm text-gray-600">Recent blocks mined on Sepolia testnet</p>
          </CardHeader>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gas Used</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gas Limit</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blocksLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-4 w-8" /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-4 w-24" /></td>
                    </tr>
                  ))
                ) : blocks && blocks.length > 0 ? (
                  blocks.slice(0, 10).map((block) => (
                    <tr key={block.hash} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-ethereum-600">
                          {block.number.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {block.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {block.transactionCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {block.gasUsed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {block.gasLimit}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No blocks data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Network Tools */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Tools</h3>
              <div className="space-y-3">
                <Button 
                  variant="outline"
                  className="w-full justify-between hover:border-ethereum-300 hover:bg-ethereum-50"
                  onClick={() => openExternalLink('https://sepoliafaucet.com/')}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-ethereum-500">💧</div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">Sepolia Faucet</p>
                      <p className="text-xs text-gray-500">Get free test ETH</p>
                    </div>
                  </div>
                  <ExternalLink className="text-gray-400 text-sm" />
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full justify-between hover:border-ethereum-300 hover:bg-ethereum-50"
                  onClick={() => openExternalLink('https://sepolia.etherscan.io/')}
                >
                  <div className="flex items-center space-x-3">
                    <Search className="text-ethereum-500" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">Sepolia Etherscan</p>
                      <p className="text-xs text-gray-500">Advanced block explorer</p>
                    </div>
                  </div>
                  <ExternalLink className="text-gray-400 text-sm" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">API Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Alchemy RPC</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${networkStatus?.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`text-sm font-medium ${networkStatus?.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                      {networkStatus?.isConnected ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {networkStatus?.responseTime ? `${networkStatus.responseTime}ms` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Block</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {networkStatus?.blockNumber?.toLocaleString() || 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <SiEthereum className="text-ethereum-500" />
              <span className="text-sm text-gray-600">Powered by Alchemy & Ethereum Sepolia Testnet</span>
            </div>
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => openExternalLink('https://docs.alchemy.com/')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Documentation
              </button>
              <button 
                onClick={() => openExternalLink('https://github.com')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                GitHub
              </button>
              <button 
                onClick={() => openExternalLink('https://alchemy.com/support')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Support
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

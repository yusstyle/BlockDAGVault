import { Button } from '@/components/ui/button';
import { Wallet, ChevronDown, LogOut } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function WalletConnect() {
  const { wallet, connect, disconnect } = useWallet();
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      await connect();
      toast({
        title: 'Wallet Connected',
        description: 'Successfully connected to BlockDAG network',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: error.message || 'Failed to connect wallet',
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!wallet.connected || !wallet.address) {
    return (
      <Button 
        onClick={handleConnect}
        className="gap-2"
        data-testid="button-connect-wallet"
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 font-mono"
          data-testid="button-wallet-menu"
        >
          <Wallet className="h-4 w-4" />
          {formatAddress(wallet.address)}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={handleDisconnect}
          className="gap-2 cursor-pointer"
          data-testid="button-disconnect-wallet"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

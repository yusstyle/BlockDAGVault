import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, FileUp, FileText, Users, Activity, Lock, Clock, Eye } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { web3Service } from '@/lib/web3';
import { documentCategoryLabels, DocumentCategory, type Document } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { wallet, isConfigured } = useWallet();
  const [, setLocation] = useLocation();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    sharedDocuments: 0,
    recentActivity: 0,
  });

  useEffect(() => {
    if (!wallet.connected) {
      setLoading(false);
      return;
    }

    loadDocuments();
  }, [wallet.connected, wallet.address]);

  const loadDocuments = async () => {
    if (!wallet.address || !isConfigured) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const contract = web3Service.getContract();
      const documentIds = await contract.getUserDocuments(wallet.address);
      
      const docs: Document[] = [];
      for (const docId of documentIds) {
        try {
          const [owner, hash, key, category, timestamp, metadata] = await contract.getDocument(docId);
          docs.push({
            documentId: docId,
            owner,
            encryptedDataHash: hash,
            encryptedSymmetricKey: key,
            category: Number(category),
            timestamp: Number(timestamp),
            metadata,
          });
        } catch (error) {
          console.error('Error loading document:', error);
        }
      }
      
      setDocuments(docs.reverse());
      setStats({
        totalDocuments: docs.length,
        sharedDocuments: 0,
        recentActivity: docs.length,
      });
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: DocumentCategory) => {
    const colors = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5'];
    return colors[category] || 'bg-muted';
  };

  if (!isConfigured) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <Shield className="h-12 w-12 text-primary mb-2" />
            <CardTitle>Configuration Required</CardTitle>
            <CardDescription>
              Please configure your BlockDAG network settings to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Click the settings icon in the header to enter your contract address, RPC URL, and chain ID.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!wallet.connected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <Shield className="h-12 w-12 text-primary mb-2" />
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to access your secure documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Click "Connect Wallet" in the header to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Document Vault</h1>
          <p className="text-muted-foreground">Manage your encrypted documents and access controls</p>
        </div>
        <Link href="/upload">
          <Button className="gap-2" data-testid="button-upload-document">
            <FileUp className="h-5 w-5" />
            Upload Document
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card data-testid="card-stat-total">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">Encrypted & secured</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-shared">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Access</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sharedDocuments}</div>
            <p className="text-xs text-muted-foreground">Active grants</p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-activity">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>
            All your encrypted documents stored on BlockDAG
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-md">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[300px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
              <p className="text-muted-foreground mb-4">Upload your first encrypted document to get started</p>
              <Link href="/upload">
                <Button data-testid="button-upload-first">
                  <FileUp className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const metadata = doc.metadata ? JSON.parse(doc.metadata) : { fileName: 'Untitled' };
                return (
                  <div
                    key={doc.documentId}
                    className="flex items-center gap-4 p-4 border rounded-md hover-elevate active-elevate-2 cursor-pointer"
                    onClick={() => setLocation(`/document/${doc.documentId}`)}
                    data-testid={`card-document-${doc.documentId}`}
                  >
                    <div className={`p-3 rounded-md ${getCategoryColor(doc.category)}/20`}>
                      <Lock className={`h-6 w-6 ${getCategoryColor(doc.category).replace('bg-', 'text-')}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{metadata.fileName}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {documentCategoryLabels[doc.category as DocumentCategory]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(doc.timestamp)}
                        </span>
                        <span className="font-mono text-xs truncate max-w-[200px]">
                          {doc.documentId}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" data-testid={`button-view-${doc.documentId}`}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

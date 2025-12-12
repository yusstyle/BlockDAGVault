import { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Lock, Download, Users, Activity, Shield, Clock } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { web3Service } from '@/lib/web3';
import { encryptionService } from '@/lib/encryption';
import { documentCategoryLabels, DocumentCategory, roleLabels, Role, AccessStatus, type Document, type AccessGrant, type AuditEntry } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { AccessManagement } from '@/components/AccessManagement';

export default function DocumentDetail() {
  const [, params] = useRoute('/document/:id');
  const [, setLocation] = useLocation();
  const { wallet } = useWallet();
  const { toast } = useToast();
  const [document, setDocument] = useState<Document | null>(null);
  const [grants, setGrants] = useState<Array<AccessGrant & { address: string }>>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (params?.id && wallet.connected) {
      loadDocument(params.id);
    }
  }, [params?.id, wallet.connected]);

  const loadDocument = async (documentId: string) => {
    try {
      setLoading(true);
      const contract = web3Service.getContract();

      const [owner, hash, key, category, timestamp, metadata] = await contract.getDocument(documentId);
      
      const doc: Document = {
        documentId,
        owner,
        encryptedDataHash: hash,
        encryptedSymmetricKey: key,
        category: Number(category),
        timestamp: Number(timestamp),
        metadata,
      };

      setDocument(doc);
      setIsOwner(owner.toLowerCase() === wallet.address?.toLowerCase());

      if (owner.toLowerCase() === wallet.address?.toLowerCase()) {
        const grantees = await contract.getAllGrantees(documentId);
        const grantsData: Array<AccessGrant & { address: string }> = [];

        for (const grantee of grantees) {
          if (grantee.toLowerCase() !== wallet.address?.toLowerCase()) {
            const [role, grantedAt, expiresAt, status, grantedBy] = await contract.getAccessGrant(
              documentId,
              grantee
            );

            grantsData.push({
              address: grantee,
              grantee,
              role: Number(role),
              grantedAt: Number(grantedAt),
              expiresAt: Number(expiresAt),
              status: Number(status),
              grantedBy,
            });
          }
        }

        setGrants(grantsData);
      }

      try {
        const [actors, actions, timestamps, details] = await contract.getDocumentAuditLog(documentId);
        const logs: AuditEntry[] = actors.map((actor: string, i: number) => ({
          documentId,
          actor,
          action: actions[i],
          timestamp: Number(timestamps[i]),
          details: details[i],
        }));
        setAuditLog(logs.reverse());
      } catch (error) {
        console.log('Could not load audit log (requires auditor role)');
      }
    } catch (error: any) {
      console.error('Error loading document:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDownload = async () => {
    if (!document || !wallet.address) return;

    try {
      setDownloading(true);

      const response = await fetch(`/api/documents/${document.documentId}`);
      if (!response.ok) {
        throw new Error('Document not found in storage');
      }

      const storedDoc = await response.json();

      if (document.owner.toLowerCase() !== wallet.address.toLowerCase()) {
        throw new Error('Currently, only document owners can decrypt documents. Grantee decryption requires additional implementation (see documentation for options).');
      }

      const decryptedKey = await encryptionService.decryptSymmetricKeyWithSignature(
        document.encryptedSymmetricKey,
        wallet.address,
        (msg) => web3Service.signMessage(msg)
      );

      const decryptedData = await encryptionService.decryptData(
        storedDoc.encryptedData,
        decryptedKey,
        storedDoc.iv
      );

      const metadata = document.metadata ? JSON.parse(document.metadata) : { fileName: 'document' };
      const blob = new Blob([decryptedData], { type: metadata.fileType || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = metadata.fileName || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Download Complete',
        description: 'Document decrypted and downloaded successfully',
      });
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: error.message || 'Failed to decrypt and download document',
      });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Document Not Found</CardTitle>
            <CardDescription>The requested document could not be loaded</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const metadata = document.metadata ? JSON.parse(document.metadata) : { fileName: 'Untitled' };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => setLocation('/dashboard')}
        className="gap-2"
        data-testid="button-back"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">{metadata.fileName}</CardTitle>
              </div>
              <CardDescription>
                {documentCategoryLabels[document.category as DocumentCategory]}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isOwner && (
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Owner
                </Badge>
              )}
              <Badge variant="outline">Encrypted</Badge>
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="gap-2"
                data-testid="button-download"
              >
                <Download className="h-4 w-4" />
                {downloading ? 'Decrypting...' : 'Download'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Owner</div>
              <div className="font-mono text-sm">{formatAddress(document.owner)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Upload Date</div>
              <div className="text-sm">{formatTimestamp(document.timestamp)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Document ID</div>
              <div className="font-mono text-xs truncate">{document.documentId}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">File Size</div>
              <div className="text-sm">{metadata.fileSize ? `${Math.round(metadata.fileSize / 1024)} KB` : 'N/A'}</div>
            </div>
          </div>

          {metadata.description && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Description</div>
              <p className="text-sm text-muted-foreground">{metadata.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="access">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="access" data-testid="tab-access">
            <Users className="h-4 w-4 mr-2" />
            Access Control
          </TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">
            <Activity className="h-4 w-4 mr-2" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="access">
          {isOwner ? (
            <AccessManagement 
              documentId={document.documentId}
              grants={grants}
              onUpdate={() => loadDocument(document.documentId)}
            />
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  You do not have permission to manage access for this document
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Complete history of all document interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditLog.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No audit logs available</p>
                  <p className="text-sm text-muted-foreground">Requires auditor role to view</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLog.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-3 border rounded-md"
                      data-testid={`audit-entry-${index}`}
                    >
                      <div className="p-2 rounded-md bg-muted">
                        <Activity className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {entry.action}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(entry.timestamp)}
                          </span>
                        </div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {formatAddress(entry.actor)}
                        </div>
                        {entry.details && (
                          <p className="text-sm text-muted-foreground mt-1">{entry.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { FileUp, Upload as UploadIcon, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';
import { web3Service } from '@/lib/web3';
import { encryptionService } from '@/lib/encryption';
import { DocumentCategory, documentCategoryLabels, documentCategoryDescriptions, type DocumentMetadata } from '@shared/schema';

export default function Upload() {
  const { wallet } = useWallet();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory | ''>('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'idle' | 'encrypting' | 'uploading' | 'complete'>('idle');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || category === '') {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select a file and category',
      });
      return;
    }

    if (!wallet.connected) {
      toast({
        variant: 'destructive',
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to upload documents',
      });
      return;
    }

    try {
      setUploading(true);
      setProgress(10);
      setStage('encrypting');

      const metadata: DocumentMetadata = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        description: description || undefined,
      };

      setProgress(30);
      const encrypted = await encryptionService.encryptFile(file);
      
      setProgress(50);
      setStage('uploading');

      const contract = web3Service.getContract();
      const walletAddress = await web3Service.getAddress();
      
      const encryptedSymmetricKey = await encryptionService.encryptSymmetricKeyWithSignature(
        encrypted.encryptedKey,
        walletAddress!,
        (msg) => web3Service.signMessage(msg)
      );

      const dataHash = encryptionService.generateHash(encrypted.encryptedData);

      setProgress(60);

      const tx = await contract.storeDocument(
        dataHash,
        encryptedSymmetricKey,
        category,
        JSON.stringify(metadata)
      );

      setProgress(75);
      const receipt = await tx.wait();
      
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'DocumentStored';
        } catch {
          return false;
        }
      });

      let documentId = '';
      if (event) {
        const parsed = contract.interface.parseLog(event);
        documentId = parsed?.args[0];
      } else {
        documentId = receipt.hash;
      }

      setProgress(85);

      await fetch('/api/documents/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          encryptedData: encrypted.encryptedData,
          iv: encrypted.iv,
        }),
      });

      setProgress(95);
      await new Promise(resolve => setTimeout(resolve, 500));

      setProgress(100);
      setStage('complete');

      toast({
        title: 'Document Uploaded',
        description: 'Your document has been encrypted and stored on BlockDAG',
      });

      setTimeout(() => {
        setLocation('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'Failed to upload document',
      });
      setStage('idle');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Document</h1>
        <p className="text-muted-foreground">Encrypt and store your sensitive documents on BlockDAG</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Upload</CardTitle>
          <CardDescription>
            Your document will be encrypted client-side before being stored on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className="border-2 border-dashed rounded-lg p-12 text-center hover-elevate cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('file-input')?.click()}
            data-testid="dropzone-upload"
          >
            {file ? (
              <div className="space-y-2">
                <FileUp className="h-12 w-12 text-primary mx-auto" />
                <div className="font-semibold">{file.name}</div>
                <div className="text-sm text-muted-foreground">{formatFileSize(file.size)}</div>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                <div className="font-semibold">Drop your file here</div>
                <div className="text-sm text-muted-foreground">or click to browse</div>
              </div>
            )}
            <input
              id="file-input"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
              data-testid="input-file"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Document Category</Label>
            <Select
              value={category.toString()}
              onValueChange={(value) => setCategory(parseInt(value) as DocumentCategory)}
              disabled={uploading}
            >
              <SelectTrigger id="category" data-testid="select-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(documentCategoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key} data-testid={`option-category-${key}`}>
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-xs text-muted-foreground">
                        {documentCategoryDescriptions[parseInt(key) as DocumentCategory]}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add notes or description for this document"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              rows={3}
              data-testid="input-description"
            />
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  {stage === 'encrypting' && (
                    <>
                      <Lock className="h-4 w-4 text-primary animate-pulse" />
                      <span>Encrypting document...</span>
                    </>
                  )}
                  {stage === 'uploading' && (
                    <>
                      <UploadIcon className="h-4 w-4 text-primary animate-pulse" />
                      <span>Uploading to BlockDAG...</span>
                    </>
                  )}
                  {stage === 'complete' && (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-chart-2" />
                      <span>Upload complete!</span>
                    </>
                  )}
                </span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lock className="h-4 w-4 text-primary" />
              Encryption Details
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• AES-256 encryption performed client-side</li>
              <li>• Symmetric key encrypted with your wallet address</li>
              <li>• Only you can decrypt with your private key</li>
              <li>• Document hash stored on blockchain</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleUpload}
              disabled={!file || category === '' || uploading}
              className="flex-1 gap-2"
              data-testid="button-upload-submit"
            >
              {uploading ? (
                <>
                  <Lock className="h-4 w-4 animate-pulse" />
                  {stage === 'encrypting' ? 'Encrypting...' : stage === 'uploading' ? 'Uploading...' : 'Processing...'}
                </>
              ) : (
                <>
                  <UploadIcon className="h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation('/dashboard')}
              disabled={uploading}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

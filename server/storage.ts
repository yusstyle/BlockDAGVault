import type { StoredDocument } from "@shared/schema";

export interface IStorage {
  storeEncryptedDocument(documentId: string, encryptedData: string, iv: string): Promise<void>;
  getEncryptedDocument(documentId: string): Promise<StoredDocument | undefined>;
  deleteDocument(documentId: string): Promise<void>;
  addGranteeKey(documentId: string, granteeAddress: string, encryptedKey: string): Promise<void>;
  getGranteeKey(documentId: string, granteeAddress: string): Promise<string | undefined>;
}

export class MemStorage implements IStorage {
  private documents: Map<string, StoredDocument>;

  constructor() {
    this.documents = new Map();
  }

  async storeEncryptedDocument(documentId: string, encryptedData: string, iv: string): Promise<void> {
    this.documents.set(documentId, {
      documentId,
      encryptedData,
      iv,
      granteeKeys: {},
    });
  }

  async getEncryptedDocument(documentId: string): Promise<StoredDocument | undefined> {
    return this.documents.get(documentId);
  }

  async deleteDocument(documentId: string): Promise<void> {
    this.documents.delete(documentId);
  }

  async addGranteeKey(documentId: string, granteeAddress: string, encryptedKey: string): Promise<void> {
    const doc = this.documents.get(documentId);
    if (!doc) return;
    
    if (!doc.granteeKeys) {
      doc.granteeKeys = {};
    }
    doc.granteeKeys[granteeAddress.toLowerCase()] = encryptedKey;
  }

  async getGranteeKey(documentId: string, granteeAddress: string): Promise<string | undefined> {
    const doc = this.documents.get(documentId);
    return doc?.granteeKeys?.[granteeAddress.toLowerCase()];
  }
}

export const storage = new MemStorage();

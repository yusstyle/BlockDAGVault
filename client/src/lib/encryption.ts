import CryptoJS from 'crypto-js';
import type { EncryptedDocument } from '@shared/schema';

export class EncryptionService {
  async encryptFile(file: File): Promise<EncryptedDocument> {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      uint8Array
    );
    
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    
    return {
      encryptedData: this.arrayBufferToBase64(new Uint8Array(encrypted)),
      encryptedKey: this.arrayBufferToBase64(new Uint8Array(exportedKey)),
      iv: this.arrayBufferToBase64(iv)
    };
  }

  async decryptData(encryptedData: string, keyStr: string, ivStr: string): Promise<ArrayBuffer> {
    const encryptedBuffer = this.base64ToArrayBuffer(encryptedData);
    const keyBuffer = this.base64ToArrayBuffer(keyStr);
    const iv = this.base64ToArrayBuffer(ivStr);
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encryptedBuffer
    );
    
    return decrypted;
  }

  arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const len = buffer.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
  }

  base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  generateHash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  async encryptSymmetricKeyWithSignature(symmetricKey: string, walletAddress: string, signMessage: (message: string) => Promise<string>): Promise<string> {
    const message = `Encrypt document key for ${walletAddress}`;
    const signature = await signMessage(message);
    const derivedKey = CryptoJS.SHA256(signature).toString();
    
    return CryptoJS.AES.encrypt(symmetricKey, derivedKey).toString();
  }

  async decryptSymmetricKeyWithSignature(encryptedKey: string, walletAddress: string, signMessage: (message: string) => Promise<string>): Promise<string> {
    const message = `Encrypt document key for ${walletAddress}`;
    const signature = await signMessage(message);
    const derivedKey = CryptoJS.SHA256(signature).toString();
    
    const decrypted = CryptoJS.AES.decrypt(encryptedKey, derivedKey);
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  async encryptSymmetricKeyForGrantee(
    symmetricKey: string,
    granteeSignature: string
  ): Promise<string> {
    const derivedKey = CryptoJS.SHA256(granteeSignature).toString();
    return CryptoJS.AES.encrypt(symmetricKey, derivedKey).toString();
  }

  async decryptSymmetricKeyAsGrantee(
    encryptedKey: string,
    granteeAddress: string,
    signMessage: (message: string) => Promise<string>
  ): Promise<string> {
    const message = `Request access for ${granteeAddress}`;
    const signature = await signMessage(message);
    const derivedKey = CryptoJS.SHA256(signature).toString();
    
    const decrypted = CryptoJS.AES.decrypt(encryptedKey, derivedKey);
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}

export const encryptionService = new EncryptionService();

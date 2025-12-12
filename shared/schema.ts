import { z } from "zod";

export enum Role {
  NONE = 0,
  VIEWER = 1,
  EDITOR = 2,
  AUDITOR = 3,
  OWNER = 4,
}

export enum DocumentCategory {
  IP_PROTECTION = 0,
  FINANCIAL_COMPLIANCE = 1,
  GOVERNMENT = 2,
  SUPPLY_CHAIN = 3,
  LOAN_APPLICATION = 4,
}

export enum AccessStatus {
  ACTIVE = 0,
  REVOKED = 1,
  EXPIRED = 2,
}

export const documentCategoryLabels: Record<DocumentCategory, string> = {
  [DocumentCategory.IP_PROTECTION]: "Intellectual Property Protection",
  [DocumentCategory.FINANCIAL_COMPLIANCE]: "Financial Compliance & Audit",
  [DocumentCategory.GOVERNMENT]: "Government Classified Documents",
  [DocumentCategory.SUPPLY_CHAIN]: "Supply Chain Security",
  [DocumentCategory.LOAN_APPLICATION]: "Loan Application",
};

export const documentCategoryDescriptions: Record<DocumentCategory, string> = {
  [DocumentCategory.IP_PROTECTION]: "Patent applications, unreleased content, source code, research findings",
  [DocumentCategory.FINANCIAL_COMPLIANCE]: "KYC/AML documents, audit evidence, regulatory reporting",
  [DocumentCategory.GOVERNMENT]: "Inter-agency documents, clearance management, FOIA processing",
  [DocumentCategory.SUPPLY_CHAIN]: "Pharmaceutical records, food safety, export controls, customs forms",
  [DocumentCategory.LOAN_APPLICATION]: "Loan applications, credit documents, financial statements",
};

export const roleLabels: Record<Role, string> = {
  [Role.NONE]: "No Access",
  [Role.VIEWER]: "Viewer",
  [Role.EDITOR]: "Editor",
  [Role.AUDITOR]: "Auditor",
  [Role.OWNER]: "Owner",
};

export const roleDescriptions: Record<Role, string> = {
  [Role.NONE]: "No access to the document",
  [Role.VIEWER]: "Can view and download the document",
  [Role.EDITOR]: "Can view and edit the document",
  [Role.AUDITOR]: "Can view document and access complete audit trail",
  [Role.OWNER]: "Full control including access management",
};

export interface Document {
  documentId: string;
  owner: string;
  encryptedDataHash: string;
  encryptedSymmetricKey: string;
  category: DocumentCategory;
  timestamp: number;
  metadata: string;
}

export interface AccessGrant {
  grantee: string;
  role: Role;
  grantedAt: number;
  expiresAt: number;
  status: AccessStatus;
  grantedBy: string;
}

export interface AuditEntry {
  documentId: string;
  actor: string;
  action: string;
  timestamp: number;
  details: string;
}

export interface DocumentMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  description?: string;
}

export const uploadDocumentSchema = z.object({
  file: z.instanceof(File),
  category: z.nativeEnum(DocumentCategory),
  description: z.string().optional(),
});

export const grantAccessSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
  role: z.nativeEnum(Role).refine(val => val !== Role.NONE && val !== Role.OWNER, {
    message: "Please select a valid role"
  }),
  duration: z.number().min(0, "Duration must be positive or 0 for permanent"),
  durationUnit: z.enum(["minutes", "hours", "days", "permanent"]),
});

export type UploadDocument = z.infer<typeof uploadDocumentSchema>;
export type GrantAccess = z.infer<typeof grantAccessSchema>;

export interface BlockchainConfig {
  contractAddress: string;
  rpcUrl: string;
  chainId: number;
}

export interface WalletState {
  address: string | null;
  chainId: number | null;
  connected: boolean;
}

export interface EncryptedDocument {
  encryptedData: string;
  encryptedKey: string;
  iv: string;
}

export interface StoredDocument {
  documentId: string;
  encryptedData: string;
  iv: string;
  granteeKeys?: Record<string, string>;
}

export const durationUnits = {
  minutes: 60,
  hours: 3600,
  days: 86400,
  permanent: 0,
} as const;

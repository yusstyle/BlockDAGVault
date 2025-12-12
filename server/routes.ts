import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/documents/store", async (req, res) => {
    try {
      const { documentId, encryptedData, iv } = req.body;

      if (!documentId || !encryptedData || !iv) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      await storage.storeEncryptedDocument(documentId, encryptedData, iv);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Store document error:", error);
      res.status(500).json({ error: error.message || "Failed to store document" });
    }
  });

  app.get("/api/documents/:documentId", async (req, res) => {
    try {
      const { documentId } = req.params;
      const document = await storage.getEncryptedDocument(documentId);

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      res.json(document);
    } catch (error: any) {
      console.error("Get document error:", error);
      res.status(500).json({ error: error.message || "Failed to retrieve document" });
    }
  });

  app.delete("/api/documents/:documentId", async (req, res) => {
    try {
      const { documentId } = req.params;
      await storage.deleteDocument(documentId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete document error:", error);
      res.status(500).json({ error: error.message || "Failed to delete document" });
    }
  });

  app.post("/api/documents/:documentId/grantee-key", async (req, res) => {
    try {
      const { documentId } = req.params;
      const { granteeAddress, encryptedKey } = req.body;

      if (!granteeAddress || !encryptedKey) {
        return res.status(400).json({ error: "Missing grantee address or encrypted key" });
      }

      await storage.addGranteeKey(documentId, granteeAddress, encryptedKey);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Add grantee key error:", error);
      res.status(500).json({ error: error.message || "Failed to store grantee key" });
    }
  });

  app.get("/api/documents/:documentId/grantee-key/:granteeAddress", async (req, res) => {
    try {
      const { documentId, granteeAddress } = req.params;
      const encryptedKey = await storage.getGranteeKey(documentId, granteeAddress);

      if (!encryptedKey) {
        return res.status(404).json({ error: "Grantee key not found" });
      }

      res.json({ encryptedKey });
    } catch (error: any) {
      console.error("Get grantee key error:", error);
      res.status(500).json({ error: error.message || "Failed to retrieve grantee key" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

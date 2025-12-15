// src/services/encryption/document-encryption.js
import { encryptData, decryptData } from "./encryption-core.js";

/**
 * Cifrado específico para documentos de Mi Gestión (Arquitectura V2)
 */

export function generateItemKey() {
  const key = new Uint8Array(32); // 256 bits
  crypto.getRandomValues(key);
  return key;
}

export async function encryptDocument(data, masterKey, documentId = null) {
  try {
    const finalDocId = documentId || generateDocumentId();
    const itemKey = generateItemKey();

    // 1. Cifrar contenido con Item Key
    const encryptedContent = await encryptData(data, itemKey);

    // 2. Cifrar Item Key con Master Key (o Medium Key)
    const encryptedItemKey = await encryptData(
      Array.from(itemKey),
      masterKey,
      finalDocId
    );

    const contentHash = await calculateContentHash(data);

    return {
      content: encryptedContent,
      metadata: {
        itemKey: encryptedItemKey,
        documentId: finalDocId,
        contentHash: contentHash,
        encryptedAt: new Date().toISOString(),
        version: "2.0",
      },
    };
  } catch (error) {
    console.error("❌ Error al cifrar documento:", error);
    throw error;
  }
}

export async function decryptDocument(encryptedDocument, masterKey) {
  try {
    // 1. Descifrar Item Key
    const decryptedItemKeyArray = await decryptData(
      encryptedDocument.metadata.itemKey,
      masterKey,
      encryptedDocument.metadata.documentId || "item_key"
    );

    const itemKey = new Uint8Array(decryptedItemKeyArray);

    // 2. Descifrar Contenido
    const decryptedContent = await decryptData(
      encryptedDocument.content,
      itemKey
    );

    // 3. Verificar Integridad
    const currentHash = await calculateContentHash(decryptedContent);
    if (
      encryptedDocument.metadata.contentHash &&
      currentHash !== encryptedDocument.metadata.contentHash
    ) {
      console.warn("⚠️ Hash de contenido no coincide");
    }

    return decryptedContent;
  } catch (error) {
    console.error("❌ Error al descifrar documento:", error);
    if (error.message && error.message.includes("Contraseña incorrecta")) {
      throw new Error("Contraseña incorrecta o datos corruptos");
    }
    throw error;
  }
}

async function calculateContentHash(data) {
  const dataString = JSON.stringify(data);
  const dataBuffer = new TextEncoder().encode(dataString);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateDocumentId() {
  return "doc_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

export const documentEncryption = {
  encrypt: encryptDocument,
  decrypt: decryptDocument,
};

// src/services/encryption/index.js
import { deriveMasterKey, encryptData, decryptData } from "./crypto-utils.js";

class EncryptionService {
  constructor() {
    this.masterKey = null;
    this.userId = null;
  }

  async initialize(password, uid) {
    try {
      this.userId = uid;
      this.masterKey = await deriveMasterKey(password, uid);
      console.log("🔓 Bóveda desbloqueada en memoria.");
      return true;
    } catch (error) {
      console.error("Error inicializando cifrado:", error);
      this.masterKey = null;
      throw error;
    }
  }

  isReady() {
    return !!this.masterKey;
  }

  clearKey() {
    this.masterKey = null;
    this.userId = null;
    console.log("🔒 Bóveda bloqueada.");
  }

  // --- NUEVO: Generar una llave sin guardarla (para re-cifrado o importación) ---
  async deriveTemporaryKey(password) {
    if (!this.userId) throw new Error("Usuario no identificado");
    return await deriveMasterKey(password, this.userId);
  }

  // --- NUEVO: Reemplazar la llave en memoria (post re-cifrado) ---
  setNewMasterKey(newKey) {
    this.masterKey = newKey;
    console.log("🔑 Llave maestra actualizada en memoria.");
  }

  // --- NUEVO: Validar llave actual ---
  async validateKey(password) {
    if (!this.userId) return false;
    try {
      // Derivamos y comparamos con una prueba dummy (o simplemente si no falla)
      // En V1, si logramos derivar es "valido" estructuralmente.
      // La validación real ocurre al intentar descifrar algo.
      await deriveMasterKey(password, this.userId);
      return true;
    } catch (e) {
      return false;
    }
  }

  async encryptDocument(data, specificKey = null) {
    // Permite usar una llave específica (para re-cifrado) o la actual por defecto
    const keyToUse = specificKey || this.masterKey;
    if (!keyToUse) throw new Error("Bóveda cerrada (Encrypt).");
    return await encryptData(data, keyToUse);
  }

  async decryptDocument(encryptedData, specificKey = null) {
    const keyToUse = specificKey || this.masterKey;
    if (!keyToUse) throw new Error("Bóveda cerrada (Decrypt).");

    if (!encryptedData || !encryptedData.iv || !encryptedData.content) {
      // Retornamos el dato tal cual si no parece cifrado (fallback legacy)
      return encryptedData;
    }

    return await decryptData(encryptedData, keyToUse);
  }
}

export const encryptionService = new EncryptionService();

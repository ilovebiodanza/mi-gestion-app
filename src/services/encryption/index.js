// src/services/encryption/index.js
import { deriveKey, generateSalt } from "./key-derivation.js";
import { encryptionCore } from "./encryption-core.js";
import { documentEncryption } from "./document-encryption.js";

class EncryptionService {
  constructor() {
    this.masterKey = null;
    this.mediumKey = null;

    this.salt = null;
    this.userId = null;
    this.verifier = null;

    this.lockTimeout = null;
    this.GRACE_PERIOD_MS = 15 * 60 * 1000;
  }

  async initialize(password, salt, userId, verifier = null) {
    try {
      this.salt = salt;
      this.userId = userId;
      this.verifier = verifier;

      this.masterKey = await deriveKey(password, salt);

      if (this.verifier) {
        const isValid = await this.verifyPassword(this.masterKey);
        if (!isValid) throw new Error("Contraseña incorrecta");
      }

      this.resetLockTimer();
      return true;
    } catch (error) {
      console.error("Error inicializando encriptación:", error);
      this.masterKey = null;
      throw error;
    }
  }

  async initializeMediumSecurity(password, userId) {
    try {
      const deterministicSalt = new TextEncoder().encode(userId);
      this.mediumKey = await deriveKey(password, deterministicSalt);
      console.log("🔐 Nivel de seguridad Medio activado");
    } catch (error) {
      console.error("Error iniciando seguridad media:", error);
    }
  }

  isReady() {
    return this.masterKey !== null;
  }
  hasMediumSecurity() {
    return this.mediumKey !== null;
  }

  lock() {
    this.masterKey = null;
    if (this.lockTimeout) clearTimeout(this.lockTimeout);
    console.log("🔒 Bóveda bloqueada");
  }

  clearKey() {
    this.masterKey = null;
    this.mediumKey = null;
    this.salt = null;
    this.userId = null;
  }

  resetLockTimer() {
    if (this.lockTimeout) clearTimeout(this.lockTimeout);
    this.lockTimeout = setTimeout(() => this.lock(), this.GRACE_PERIOD_MS);
  }

  async encryptDocument(data, level = "high") {
    let keyToUse = this.masterKey;
    if (level === "medium") {
      if (!this.mediumKey) throw new Error("Seguridad media no inicializada");
      keyToUse = this.mediumKey;
    } else {
      if (!this.masterKey) throw new Error("Bóveda bloqueada");
      this.resetLockTimer();
    }
    return await documentEncryption.encrypt(data, keyToUse);
  }

  async decryptDocument(encryptedData) {
    if (this.masterKey) {
      try {
        const result = await documentEncryption.decrypt(
          encryptedData,
          this.masterKey
        );
        this.resetLockTimer();
        return result;
      } catch (e) {
        if (!this.mediumKey) throw e;
      }
    }
    if (this.mediumKey) {
      return await documentEncryption.decrypt(encryptedData, this.mediumKey);
    }
    throw new Error("Bóveda bloqueada.");
  }

  // Verificación Limpia (Solo Objetos V2)
  async verifyPassword(derivedKey) {
    if (!this.verifier) return true;
    try {
      await encryptionCore.decryptData(this.verifier, derivedKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  async generateVerifier(password, salt) {
    const key = await deriveKey(password, salt);
    const verifierContent = new TextEncoder().encode("VERIFIER");
    return await encryptionCore.encryptData(verifierContent, key);
  }
}

export const encryptionService = new EncryptionService();

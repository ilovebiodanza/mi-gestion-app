// src/services/encryption/key-derivation.js

/**
 * Generar salt aleatorio
 */
export function generateSalt(length = 16) {
  const salt = new Uint8Array(length);
  crypto.getRandomValues(salt);
  return salt;
}

/**
 * Derivar clave desde contraseña usando PBKDF2 (Genérica)
 * Se usa tanto para la MasterKey como para la MediumKey
 */
export async function deriveKey(password, salt) {
  try {
    // console.log("🔑 Derivando clave...");

    const passwordBuffer = new TextEncoder().encode(password);

    const passwordKey = await crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      passwordKey,
      {
        name: "AES-GCM",
        length: 256,
      },
      true, // Exportable para poder guardarla como Uint8Array
      ["encrypt", "decrypt"]
    );

    const exportedKey = await crypto.subtle.exportKey("raw", derivedKey);
    return new Uint8Array(exportedKey);
  } catch (error) {
    console.error("❌ Error al derivar clave:", error);
    throw error;
  }
}

// Mantenemos este alias por si alguna referencia antigua lo busca,
// pero internamente ya todo usa deriveKey
export const deriveMasterKey = deriveKey;

/**
 * Verificar contraseña (sin revelar la clave)
 */
export async function verifyPassword(password, salt, storedVerifier) {
  try {
    // Usamos la función genérica renombrada
    const derivedKey = await deriveKey(password, salt);

    const hashBuffer = await crypto.subtle.digest("SHA-256", derivedKey);
    const verificationHash = new Uint8Array(hashBuffer).slice(0, 16);

    const isMatch = verificationHash.every(
      (byte, index) => byte === storedVerifier[index]
    );

    return isMatch;
  } catch (error) {
    console.error("❌ Error al verificar contraseña:", error);
    return false;
  }
}

/**
 * Crear verificador de contraseña (para almacenamiento seguro)
 */
export async function createPasswordVerifier(masterKey) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", masterKey);
  return new Uint8Array(hashBuffer).slice(0, 16);
}

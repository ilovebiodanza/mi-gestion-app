// src/services/encryption/crypto-utils.js

// Configuración de Cifrado
const ALGORITHM_NAME = "AES-GCM";
const KDF_NAME = "PBKDF2";
const HASH_NAME = "SHA-256";
const ITERATIONS = 100000; // Estándar de seguridad alto
const SALT_SIZE = 16;
const IV_SIZE = 12; // Estándar para AES-GCM

/**
 * Genera un Salt aleatorio criptográficamente seguro
 */
export function generateSalt() {
  return window.crypto.getRandomValues(new Uint8Array(SALT_SIZE));
}

/**
 * Convierte texto a Buffer
 */
function str2ab(str) {
  return new TextEncoder().encode(str);
}

/**
 * Convierte Buffer a Hex String (para almacenamiento)
 */
function buf2hex(buffer) {
  return Array.prototype.map
    .call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2))
    .join("");
}

/**
 * Convierte Hex String a Buffer
 */
function hex2buf(hexString) {
  return new Uint8Array(
    hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );
}

/**
 * Deriva una Llave Maestra (AES-GCM) a partir de un password y un salt (uid)
 * Usamos el UID del usuario como Salt para asegurar unicidad por usuario.
 */
export async function deriveMasterKey(password, saltString) {
  // 1. Importar la contraseña como "Key Material"
  const passwordBuffer = str2ab(password);
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: KDF_NAME },
    false,
    ["deriveBits", "deriveKey"]
  );

  // 2. Usar el UID (o saltString) para salar la clave
  // Nota: En producción ideal, el salt debería ser aleatorio y guardado,
  // pero para V1 usar el UID es una estrategia determinista válida.
  const saltBuffer = str2ab(saltString);

  // 3. Derivar la llave AES-GCM real
  return await window.crypto.subtle.deriveKey(
    {
      name: KDF_NAME,
      salt: saltBuffer,
      iterations: ITERATIONS,
      hash: HASH_NAME,
    },
    keyMaterial,
    { name: ALGORITHM_NAME, length: 256 },
    false, // La llave no es exportable (Seguridad: vive solo en RAM)
    ["encrypt", "decrypt"]
  );
}

/**
 * Cifra un objeto o texto usando la Llave Maestra
 * Devuelve un string JSON con formato: { iv: "hex...", data: "hex..." }
 */
export async function encryptData(data, masterKey) {
  try {
    // 1. Preparar datos
    const jsonStr = JSON.stringify(data);
    const dataBuffer = str2ab(jsonStr);

    // 2. Generar Vector de Inicialización (IV) aleatorio por cada encriptación
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_SIZE));

    // 3. Cifrar
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: ALGORITHM_NAME, iv: iv },
      masterKey,
      dataBuffer
    );

    // 4. Empaquetar para guardar (Hexadecimal)
    return {
      iv: buf2hex(iv),
      content: buf2hex(encryptedBuffer),
    };
  } catch (e) {
    console.error("Crypto Error (Encrypt):", e);
    throw new Error("No se pudo cifrar la información.");
  }
}

/**
 * Descifra un paquete { iv, content } usando la Llave Maestra
 */
export async function decryptData(encryptedPackage, masterKey) {
  try {
    // Validar formato
    if (
      !encryptedPackage ||
      !encryptedPackage.iv ||
      !encryptedPackage.content
    ) {
      // Si no tiene formato cifrado, a lo mejor es dato legacy o plano
      console.warn("Intentando leer datos sin formato de cifrado válido.");
      return encryptedPackage;
    }

    // 1. Recuperar buffers
    const iv = hex2buf(encryptedPackage.iv);
    const content = hex2buf(encryptedPackage.content);

    // 2. Descifrar
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: ALGORITHM_NAME, iv: iv },
      masterKey,
      content
    );

    // 3. Decodificar a objeto
    const decodedStr = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(decodedStr);
  } catch (e) {
    console.error("Crypto Error (Decrypt):", e);
    throw new Error("Contraseña incorrecta o datos corruptos.");
  }
}

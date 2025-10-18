/**
 * File encryption utilities using AES-GCM
 */

/**
 * Generate a random 32-bit encryption key
 * @returns A random number to be used as encryption key
 */
export function generateEncryptionKey(): number {
  // Generate a random 32-bit unsigned integer
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0];
}

/**
 * Derive a CryptoKey from a numeric key
 * @param numericKey The numeric encryption key
 * @returns A CryptoKey for AES-GCM encryption
 */
async function deriveKey(numericKey: number): Promise<CryptoKey> {
  // Convert the numeric key to a buffer
  const keyBuffer = new ArrayBuffer(32);
  const view = new DataView(keyBuffer);
  
  // Fill the buffer with the key repeated to fill 256 bits
  for (let i = 0; i < 8; i++) {
    view.setUint32(i * 4, numericKey, false);
  }
  
  // Import the key for AES-GCM
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt file content using AES-GCM
 * @param content The file content as ArrayBuffer or string
 * @param numericKey The numeric encryption key
 * @returns Base64 encoded encrypted data (IV + ciphertext)
 */
export async function encryptFile(
  content: ArrayBuffer | string,
  numericKey: number
): Promise<string> {
  // Convert string to ArrayBuffer if needed
  const data = typeof content === 'string' 
    ? new TextEncoder().encode(content) 
    : new Uint8Array(content);
  
  // Generate a random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Derive the key
  const key = await deriveKey(numericKey);
  
  // Encrypt the data
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt file content using AES-GCM
 * @param encryptedBase64 Base64 encoded encrypted data (IV + ciphertext)
 * @param numericKey The numeric encryption key
 * @returns Decrypted content as Uint8Array
 */
export async function decryptFile(
  encryptedBase64: string,
  numericKey: number
): Promise<Uint8Array> {
  // Decode base64
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  
  // Extract IV and ciphertext
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  
  // Derive the key
  const key = await deriveKey(numericKey);
  
  // Decrypt the data
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  
  return new Uint8Array(decrypted);
}

/**
 * Convert Uint8Array to text string
 * @param data The Uint8Array data
 * @returns Decoded text string
 */
export function arrayBufferToText(data: Uint8Array): string {
  return new TextDecoder().decode(data);
}

/**
 * Convert Uint8Array to blob for download
 * @param data The Uint8Array data
 * @param mimeType The MIME type of the file
 * @returns Blob object
 */
export function arrayBufferToBlob(data: Uint8Array, mimeType: string = 'application/octet-stream'): Blob {
  return new Blob([new Uint8Array(data)], { type: mimeType });
}

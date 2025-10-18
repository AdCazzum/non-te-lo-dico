/**
 * File encryption utilities using AES-GCM
 *
 * This module provides functions to:
 * 1. Generate a random numeric encryption key
 * 2. Encrypt files using AES-GCM with the key
 * 3. Decrypt files using the key
 */

/**
 * Generate a random 32-bit unsigned integer to use as encryption key
 * This key will be encrypted with FHEVM before storing on the blockchain
 *
 * @returns A random 32-bit unsigned integer
 */
export function generateEncryptionKey(): number {
  // Generate a random 32-bit unsigned integer (0 to 4294967295)
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  return randomBuffer[0];
}

/**
 * Convert a numeric key to a CryptoKey for AES-GCM encryption
 *
 * @param numericKey - The numeric key (32-bit unsigned integer)
 * @returns A Promise that resolves to a CryptoKey
 */
async function numericKeyToCryptoKey(numericKey: number): Promise<CryptoKey> {
  // Create a 256-bit key from the 32-bit number by repeating it
  // This ensures we have enough entropy for AES-256
  const keyBuffer = new ArrayBuffer(32); // 256 bits
  const keyView = new DataView(keyBuffer);

  // Fill the buffer by repeating the 32-bit key
  for (let i = 0; i < 8; i++) {
    keyView.setUint32(i * 4, numericKey, false);
  }

  const keyBytes = new Uint8Array(keyBuffer);

  // Import the key for AES-GCM
  return await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM", length: 256 }, false, [
    "encrypt",
    "decrypt",
  ]);
}

/**
 * Encrypt a file using AES-GCM with a numeric key
 *
 * @param file - The file to encrypt
 * @param numericKey - The numeric encryption key (32-bit unsigned integer)
 * @returns A Promise that resolves to an object containing the encrypted data and IV
 */
export async function encryptFile(file: File, numericKey: number): Promise<{ encryptedData: Blob; iv: Uint8Array }> {
  // Read file as ArrayBuffer
  const fileBuffer = await file.arrayBuffer();

  // Generate a random IV (Initialization Vector)
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96 bits for AES-GCM

  // Convert numeric key to CryptoKey
  const cryptoKey = await numericKeyToCryptoKey(numericKey);

  // Encrypt the file
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    cryptoKey,
    fileBuffer,
  );

  // Create a blob that contains both IV and encrypted data
  // Format: [IV (12 bytes)] + [Encrypted Data]
  const combinedBuffer = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combinedBuffer.set(iv, 0);
  combinedBuffer.set(new Uint8Array(encryptedBuffer), iv.length);

  const encryptedBlob = new Blob([combinedBuffer]);

  return {
    encryptedData: encryptedBlob,
    iv: iv,
  };
}

/**
 * Decrypt a file using AES-GCM with a numeric key
 *
 * @param encryptedBlob - The encrypted file blob (containing IV + encrypted data)
 * @param numericKey - The numeric decryption key (32-bit unsigned integer)
 * @param originalFileName - Optional original file name to restore
 * @returns A Promise that resolves to the decrypted File
 */
export async function decryptFile(encryptedBlob: Blob, numericKey: number, originalFileName?: string): Promise<File> {
  // Read the encrypted blob
  const encryptedBuffer = await encryptedBlob.arrayBuffer();
  const encryptedArray = new Uint8Array(encryptedBuffer);

  // Extract IV (first 12 bytes)
  const iv = encryptedArray.slice(0, 12);

  // Extract encrypted data (remaining bytes)
  const encryptedData = encryptedArray.slice(12);

  // Convert numeric key to CryptoKey
  const cryptoKey = await numericKeyToCryptoKey(numericKey);

  // Decrypt the data
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    cryptoKey,
    encryptedData,
  );

  // Create a File from the decrypted data
  const decryptedFile = new File([decryptedBuffer], originalFileName || "decrypted-file", {
    type: "application/octet-stream",
  });

  return decryptedFile;
}

/**
 * Decrypt a file and return it as a Blob with specific MIME type
 *
 * @param encryptedBlob - The encrypted file blob
 * @param numericKey - The numeric decryption key
 * @param mimeType - The MIME type of the original file
 * @returns A Promise that resolves to the decrypted Blob
 */
export async function decryptFileAsBlob(encryptedBlob: Blob, numericKey: number, mimeType?: string): Promise<Blob> {
  const encryptedBuffer = await encryptedBlob.arrayBuffer();
  const encryptedArray = new Uint8Array(encryptedBuffer);

  const iv = encryptedArray.slice(0, 12);
  const encryptedData = encryptedArray.slice(12);

  const cryptoKey = await numericKeyToCryptoKey(numericKey);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    cryptoKey,
    encryptedData,
  );

  return new Blob([decryptedBuffer], { type: mimeType || "application/octet-stream" });
}

/**
 * Download a decrypted file
 *
 * @param decryptedFile - The decrypted file to download
 */
export function downloadFile(decryptedFile: File) {
  const url = URL.createObjectURL(decryptedFile);
  const a = document.createElement("a");
  a.href = url;
  a.download = decryptedFile.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

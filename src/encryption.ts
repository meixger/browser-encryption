import { base64_to_buf, buff_to_base64 } from "./base64";

// original post from 2020 https://bradyjoslin.com/blog/encryption-webcrypto/
// newer example form 2024 https://medium.com/@thomas_40553/how-to-secure-encrypt-and-decrypt-data-within-the-browser-with-aes-gcm-and-pbkdf2-057b839c96b6

/**
 * Encrypts a string with AES-GCM and a keySize of 32 bytes.
 *
 * @param   value A plaintext string.
 * @param   password A passphrase.
 * @returns A base64 encoded encrypted string.
 */
export async function encrypt(value: string, password: string, iterations: number = 600000, keySize: number = 256) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getKeyAesGcm(password, salt, iterations, keySize);
  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    new TextEncoder().encode(value)
  );

  const encryptedContentArr = new Uint8Array(encryptedContent);
  const buff = new Uint8Array(
    salt.byteLength + iv.byteLength + encryptedContentArr.byteLength
  );
  buff.set(salt, 0);
  buff.set(iv, salt.byteLength);
  buff.set(encryptedContentArr, salt.byteLength + iv.byteLength);
  const base64Buff = buff_to_base64(buff);
  return base64Buff;
}

/**
 * Decrypts a string with AES-GCM and a keySize of 32 bytes.
 *
 * @param   value A base64 encoded encrypted string.
 * @param   password A passphrase.
 * @returns A plaintext string.
 */
export async function decrypt(value: string, password: string, iterations: number = 600000, keySize: number = 256) {
  const encryptedDataBuff = base64_to_buf(value);
  const salt = encryptedDataBuff.slice(0, 16);
  const iv = encryptedDataBuff.slice(16, 16 + 12);
  const data = encryptedDataBuff.slice(16 + 12);
  const key = await getKeyAesGcm(password, salt, iterations, keySize);
  const decryptedContent = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data
  );
  return new TextDecoder().decode(decryptedContent);
}

async function getKeyAesGcm(password: string, salt: Uint8Array, iterations: number, keySize: number) {
  const baseKey = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: iterations,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: keySize },
    false, // extractable
    ["encrypt", "decrypt"]
  );
  return key
}


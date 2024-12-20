import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-secure-key-12345';

export const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

export const decrypt = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const encryptObject = (obj: any): string => {
  return encrypt(JSON.stringify(obj));
};

export const decryptObject = <T>(ciphertext: string): T => {
  return JSON.parse(decrypt(ciphertext));
};

// Hash sensitive data before storing or transmitting
export const hashData = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};

// Generate a secure token for API requests
export const generateSecureToken = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

// Secure storage utility
export const secureStorage = {
  setItem: (key: string, value: any) => {
    const encryptedValue = encryptObject(value);
    sessionStorage.setItem(hashData(key), encryptedValue);
  },

  getItem: <T>(key: string): T | null => {
    const encryptedValue = sessionStorage.getItem(hashData(key));
    if (!encryptedValue) return null;
    return decryptObject<T>(encryptedValue);
  },

  removeItem: (key: string) => {
    sessionStorage.removeItem(hashData(key));
  },

  clear: () => {
    sessionStorage.clear();
  }
};

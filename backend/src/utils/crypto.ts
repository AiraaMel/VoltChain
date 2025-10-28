import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Generate HMAC-SHA256 signature in base64url format
 */
export function hmacSign(secret: string, message: string): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(message);
  return hmac.digest('base64url');
}

/**
 * Verify HMAC signature using constant-time comparison
 */
export function hmacVerify(secret: string, message: string, signatureB64url: string): boolean {
  try {
    const expectedSignature = hmacSign(secret, message);
    const expectedBuffer = Buffer.from(expectedSignature, 'base64url');
    const receivedBuffer = Buffer.from(signatureB64url, 'base64url');
    
    // Use constant-time comparison to prevent timing attacks
    return expectedBuffer.length === receivedBuffer.length && 
           timingSafeEqual(expectedBuffer, receivedBuffer);
  } catch (error) {
    return false;
  }
}

/**
 * Generate random device secret (32 bytes base64)
 */
export function generateDeviceSecret(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('base64');
}

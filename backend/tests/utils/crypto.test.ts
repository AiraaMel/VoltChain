import { hmacSign, hmacVerify, generateDeviceSecret } from '../../src/utils/crypto';

describe('Crypto Utils', () => {
  describe('hmacSign', () => {
    it('should generate a valid HMAC signature', () => {
      const secret = 'test-secret';
      const message = 'test-message';
      
      const signature = hmacSign(secret, message);
      
      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBeGreaterThan(0);
    });

    it('should generate different signatures for different messages', () => {
      const secret = 'test-secret';
      const message1 = 'message1';
      const message2 = 'message2';
      
      const signature1 = hmacSign(secret, message1);
      const signature2 = hmacSign(secret, message2);
      
      expect(signature1).not.toBe(signature2);
    });

    it('should generate different signatures for different secrets', () => {
      const secret1 = 'secret1';
      const secret2 = 'secret2';
      const message = 'same-message';
      
      const signature1 = hmacSign(secret1, message);
      const signature2 = hmacSign(secret2, message);
      
      expect(signature1).not.toBe(signature2);
    });

    it('should generate consistent signatures for same input', () => {
      const secret = 'test-secret';
      const message = 'test-message';
      
      const signature1 = hmacSign(secret, message);
      const signature2 = hmacSign(secret, message);
      
      expect(signature1).toBe(signature2);
    });
  });

  describe('hmacVerify', () => {
    it('should verify a valid signature', () => {
      const secret = 'test-secret';
      const message = 'test-message';
      const signature = hmacSign(secret, message);
      
      const isValid = hmacVerify(secret, message, signature);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', () => {
      const secret = 'test-secret';
      const message = 'test-message';
      const invalidSignature = 'invalid-signature';
      
      const isValid = hmacVerify(secret, message, invalidSignature);
      
      expect(isValid).toBe(false);
    });

    it('should reject signature for different message', () => {
      const secret = 'test-secret';
      const message1 = 'message1';
      const message2 = 'message2';
      const signature = hmacSign(secret, message1);
      
      const isValid = hmacVerify(secret, message2, signature);
      
      expect(isValid).toBe(false);
    });

    it('should reject signature with different secret', () => {
      const secret1 = 'secret1';
      const secret2 = 'secret2';
      const message = 'test-message';
      const signature = hmacSign(secret1, message);
      
      const isValid = hmacVerify(secret2, message, signature);
      
      expect(isValid).toBe(false);
    });

    it('should handle empty strings', () => {
      const secret = 'test-secret';
      const message = '';
      const signature = hmacSign(secret, message);
      
      const isValid = hmacVerify(secret, message, signature);
      
      expect(isValid).toBe(true);
    });

    it('should handle special characters in message', () => {
      const secret = 'test-secret';
      const message = 'special-chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
      const signature = hmacSign(secret, message);
      
      const isValid = hmacVerify(secret, message, signature);
      
      expect(isValid).toBe(true);
    });

    it('should handle very long messages', () => {
      const secret = 'test-secret';
      const message = 'a'.repeat(10000);
      const signature = hmacSign(secret, message);
      
      const isValid = hmacVerify(secret, message, signature);
      
      expect(isValid).toBe(true);
    });

    it('should return false for malformed base64url', () => {
      const secret = 'test-secret';
      const message = 'test-message';
      const malformedSignature = 'not-valid-base64url!@#';
      
      const isValid = hmacVerify(secret, message, malformedSignature);
      
      expect(isValid).toBe(false);
    });
  });

  describe('generateDeviceSecret', () => {
    it('should generate a random secret', () => {
      const secret = generateDeviceSecret();
      
      expect(secret).toBeDefined();
      expect(typeof secret).toBe('string');
      expect(secret.length).toBeGreaterThan(0);
    });

    it('should generate different secrets on each call', () => {
      const secret1 = generateDeviceSecret();
      const secret2 = generateDeviceSecret();
      
      expect(secret1).not.toBe(secret2);
    });

    it('should generate base64 encoded strings', () => {
      const secret = generateDeviceSecret();
      
      // Base64 characters: A-Z, a-z, 0-9, +, /, =
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      expect(base64Regex.test(secret)).toBe(true);
    });

    it('should generate secrets of consistent length', () => {
      const secrets = Array.from({ length: 10 }, () => generateDeviceSecret());
      
      // All secrets should have the same length (32 bytes = 44 base64 characters)
      const lengths = secrets.map(s => s.length);
      const uniqueLengths = new Set(lengths);
      
      expect(uniqueLengths.size).toBe(1);
      expect(lengths[0]).toBe(44); // 32 bytes in base64
    });

    it('should generate secrets that can be used for HMAC', () => {
      const secret = generateDeviceSecret();
      const message = 'test-message';
      
      const signature = hmacSign(secret, message);
      const isValid = hmacVerify(secret, message, signature);
      
      expect(isValid).toBe(true);
    });
  });

  describe('Integration tests', () => {
    it('should work with device authentication flow', () => {
      // Simulate device authentication flow
      const deviceSecret = generateDeviceSecret();
      const deviceId = 'device-123';
      const timestamp = Date.now().toString();
      const tsDevice = new Date().toISOString();
      const energyGenerated = 1.5;
      
      // Create message as done in ingest route
      const message = `${deviceId}.${timestamp}.${tsDevice}.${energyGenerated}`;
      
      // Sign the message
      const signature = hmacSign(deviceSecret, message);
      
      // Verify the signature
      const isValid = hmacVerify(deviceSecret, message, signature);
      
      expect(isValid).toBe(true);
    });

    it('should handle timing attacks protection', () => {
      const secret = 'test-secret';
      const message = 'test-message';
      const validSignature = hmacSign(secret, message);
      const invalidSignature = 'invalid-signature';
      
      // Both should take similar time to process (timing attack protection)
      const start1 = Date.now();
      hmacVerify(secret, message, validSignature);
      const time1 = Date.now() - start1;
      
      const start2 = Date.now();
      hmacVerify(secret, message, invalidSignature);
      const time2 = Date.now() - start2;
      
      // Times should be similar (within 10ms tolerance)
      expect(Math.abs(time1 - time2)).toBeLessThan(10);
    });
  });
});

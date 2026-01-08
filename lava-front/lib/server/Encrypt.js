const fs = require('fs');
const crypto = require('crypto');

class Encrypt {
    static getSecret() {
        // Try to get key from environment variable first (Best practice for cloud)
        if (process.env.ENCRYPTION_KEY) {
            return process.env.ENCRYPTION_KEY;
        }

        // Try to read from file
        try {
            return fs.readFileSync('localStorage.key');
        } catch (error) {
            // Fallback: Generate a random key if neither exists (and helpful for dev/first run)
            console.warn("WARNING: 'localStorage.key' file not found and 'ENCRYPTION_KEY' env var not set.");
            console.warn("Generating a temporary random key. Sessions/Guest data might check consistency errors on restart.");
            const randomKey = crypto.randomBytes(32).toString('hex');
            return randomKey;
        }
    }

    static secret = Encrypt.getSecret();
    static key = crypto.createHash('sha256').update(String(Encrypt.secret)).digest('base64').substr(0, 32);

    static encryptLocalData(gameData) {
        // ... (rest of implementation remains same)
        // Encrypt the data using the server key
        const algorithm = 'aes-256-cbc';
        const iv = crypto.randomBytes(16);

        let cipher = crypto.createCipheriv(algorithm, this.key, iv);
        let encrypted = cipher.update(JSON.stringify(gameData));
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        const encryptedData = {
            iv: iv.toString('hex'),
            encryptedData: encrypted.toString('hex'),
            algorithm
        };
        return encryptedData;
    }


    static decryptLocalData(encryptedData) {
        // ... (rest of implementation remains same)
        // Decrypt the data using the server key
        const iv = Buffer.from(encryptedData.iv, 'hex');
        const encryptedText = Buffer.from(encryptedData.encryptedData, 'hex');
        const algorithm = encryptedData.algorithm;

        let decipher = crypto.createDecipheriv(algorithm, Encrypt.key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        const decryptedData = JSON.parse(decrypted.toString());

        return decryptedData;
    }
}

module.exports = Encrypt;

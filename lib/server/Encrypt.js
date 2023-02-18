const fs = require('fs');
const crypto = require('crypto');

class Encrypt {
    static secret = fs.readFileSync('localStorage.key');;
    static key = crypto.createHash('sha256').update(String(Encrypt.secret)).digest('base64').substr(0, 32);

    static encryptLocalData(gameData) {
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

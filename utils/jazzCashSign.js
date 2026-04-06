const crypto = require('crypto');

const generateJazzCashHash = (params, integritySalt) => {
    // 1. Sort keys alphabetically
    const sortedKeys = Object.keys(params).sort();
    
    // 2. Concatenate values with Integrity Salt
    let hashString = integritySalt;
    for (let key of sortedKeys) {
        if (params[key] !== "" && params[key] !== undefined && params[key] !== null) {
            hashString += `&${params[key]}`;
        }
    }
    
    // 3. Create SHA-256 HMAC
    return crypto.createHmac('sha256', integritySalt)
                 .update(hashString)
                 .digest('hex')
                 .toUpperCase();
};

module.exports = { generateJazzCashHash };


const crypto = require('node:crypto');

const generate5DigitToken = () => {
  const buffer = crypto.randomBytes(2);
  const number = buffer.readUInt16BE() % 90000 + 10000;
  return number.toString();
};

module.exports = generate5DigitToken;

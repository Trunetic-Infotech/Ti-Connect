import CryptoJS from "crypto-js";

const decryptMessage = (encryptedText) => {
  try {
    if (!encryptedText) return null;

    const bytes = CryptoJS.AES.decrypt(
      encryptedText,
      process.env.MESSAGE_SECRET
    );

    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    return decrypted || null;
  } catch (err) {
    console.log("Decryption failed:", err);
    return null;
  }
};
export default decryptMessage;
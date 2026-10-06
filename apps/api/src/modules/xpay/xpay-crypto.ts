import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

/**
 * 校验微信消息推送 URL 签名（Token + timestamp + nonce）。
 *
 * @param token MP 配置的 Token
 * @param signature 请求 signature
 * @param timestamp 请求 timestamp
 * @param nonce 请求 nonce
 */
export function verifyWechatCallbackSignature(
  token: string,
  signature: string,
  timestamp: string,
  nonce: string,
): boolean {
  if (!token || !signature || !timestamp || !nonce) {
    return false;
  }
  const sorted = [token, timestamp, nonce].sort().join('');
  const digest = createHash('sha1').update(sorted).digest('hex');
  return digest === signature;
}

/**
 * PKCS7 去填充。
 *
 * @param buffer 解密后的缓冲
 */
function pkcs7Decode(buffer: Buffer): Buffer {
  const pad = buffer[buffer.length - 1];
  if (pad < 1 || pad > 32) {
    return buffer;
  }
  return buffer.subarray(0, buffer.length - pad);
}

/**
 * PKCS7 填充。
 *
 * @param buffer 明文
 */
function pkcs7Encode(buffer: Buffer): Buffer {
  const blockSize = 32;
  const amount = blockSize - (buffer.length % blockSize);
  const pad = Buffer.alloc(amount, amount);
  return Buffer.concat([buffer, pad]);
}

/**
 * 解密微信消息 Encrypt 字段（EncodingAESKey）。
 *
 * @param encrypt Base64 密文
 * @param encodingAesKey 43 位 EncodingAESKey
 */
export function decryptWechatMessage(encrypt: string, encodingAesKey: string): string {
  const aesKey = Buffer.from(`${encodingAesKey}=`, 'base64');
  const iv = aesKey.subarray(0, 16);
  const decipher = createDecipheriv('aes-256-cbc', aesKey, iv);
  decipher.setAutoPadding(false);
  const decoded = pkcs7Decode(
    Buffer.concat([decipher.update(Buffer.from(encrypt, 'base64')), decipher.final()]),
  );
  const xmlLength = decoded.readUInt32BE(16);
  return decoded.subarray(20, 20 + xmlLength).toString('utf8');
}

/**
 * 加密微信回复（安全模式需要时使用）。
 *
 * @param xml 明文 XML
 * @param encodingAesKey EncodingAESKey
 * @param appId 小程序 AppID
 */
export function encryptWechatMessage(xml: string, encodingAesKey: string, appId: string): string {
  const aesKey = Buffer.from(`${encodingAesKey}=`, 'base64');
  const iv = aesKey.subarray(0, 16);
  const random = randomBytes(16);
  const xmlBuffer = Buffer.from(xml, 'utf8');
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(xmlBuffer.length, 0);
  const raw = pkcs7Encode(Buffer.concat([random, lengthBuffer, xmlBuffer, Buffer.from(appId)]));
  const cipher = createCipheriv('aes-256-cbc', aesKey, iv);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(raw), cipher.final()]).toString('base64');
}

/**
 * 从 XML 中取标签文本（兼容 CDATA）。
 *
 * @param xml XML 字符串
 * @param tag 标签名
 */
export function readXmlTag(xml: string, tag: string): string {
  const cdata = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`));
  if (cdata?.[1] != null) {
    return cdata[1];
  }
  const plain = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return plain?.[1]?.trim() ?? '';
}

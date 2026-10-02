import { Request } from 'express';

/**
 * 从请求头中解析客户端真实 IP。
 *
 * @param request Express 请求对象
 * @returns IPv4 字符串；无法解析时返回空字符串
 */
export function getClientIp(request: Request): string {
  let ipAddress = '';

  const headerList = [
    'x-client-ip',
    'x-real-ip',
    'x-forwarded-for',
    'cf-connecting-ip',
    'true-client-ip',
    'x-cluster-client-ip',
    'proxy-client-ip',
    'wl-proxy-client-ip',
  ];

  for (const header of headerList) {
    const value = request.headers[header];
    if (value && typeof value === 'string') {
      ipAddress = value.split(',')[0].trim();
      break;
    }
  }

  if (!ipAddress) {
    ipAddress = request.socket.remoteAddress || '';
  }

  if (ipAddress.includes('::')) {
    const isLocal = /^(::1|fe80(:1)?::1(%.*)?)$/i.test(ipAddress);
    if (isLocal) {
      ipAddress = '';
    } else if (ipAddress.includes('::ffff:')) {
      ipAddress = ipAddress.split(':').pop() || '';
    }
  }

  if (!ipAddress || !/\d+\.\d+\.\d+\.\d+/.test(ipAddress)) {
    ipAddress = '';
  }
  return ipAddress;
}

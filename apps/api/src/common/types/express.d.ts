import { JwtPayload } from '../interfaces/jwt-payload';

declare global {
  namespace Express {
    interface Request {
      /** 鉴权后挂载的 JWT Payload */
      user?: JwtPayload;
    }
  }
}

export {};

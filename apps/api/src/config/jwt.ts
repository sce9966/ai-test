/**
 * JWT 签名配置。
 */
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'change_me_jwt_secret',
  signOptions: {
    expiresIn: process.env.JWT_EXPIRESIN || '7d',
  },
};

export default jwtConfig;

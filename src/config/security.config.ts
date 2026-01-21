import { registerAs } from '@nestjs/config';

export default registerAs('security', () => ({
  // Bcrypt
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),

  // Password Recovery
  resetTokenTtlMs: parseInt(process.env.RESET_TOKEN_TTL || '3600000', 10), // 1 hora en ms

  // Password Requirements
  passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8', 10),
  passwordRequireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
  passwordRequireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === 'true',
  passwordRequireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL_CHARS === 'true',

  // Request Timeout
  requestTimeOut: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),
}));

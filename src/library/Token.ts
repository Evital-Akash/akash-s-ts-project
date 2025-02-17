import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

export class Token {
  static createToken(
    payload: object,
    expiresIn: SignOptions["expiresIn"] = "1h"
  ): string {
    const secret = process.env.JWT_SECRET as string;
    if (!secret) {
      throw new Error("JWT secret is not defined in environment variables.");
    }

    const options: SignOptions = { expiresIn };
    return jwt.sign(payload, secret, options);
  }

  static verifyToken(token: string): { id: string } {
    const secret = process.env.JWT_SECRET as string;
    if (!secret) {
      throw new Error("JWT secret is not defined in environment variables.");
    }
    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      return { id: decoded.id as string };
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}

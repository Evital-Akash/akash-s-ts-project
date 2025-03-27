import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

export class Token {
  static createToken(
    payload: object,
    expiresIn: SignOptions["expiresIn"] = "7d"
  ): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT secret is not defined in environment variables.");
    }
    return jwt.sign(payload, secret, { expiresIn });
  }

  static verifyToken(token: string): { id: string, u_role: string, u_email: string } {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT secret is not defined in environment variables.");
    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      return { id: decoded.id as string, u_role: decoded.u_role as string, u_email: decoded.u_email as string };
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}

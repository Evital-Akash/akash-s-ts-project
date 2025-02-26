import { Userdb } from "../model/Users";
import { functions } from "./function";
import jwt, { JwtPayload } from "jsonwebtoken";

export async function userAuth(req: any, res: any, next: any): Promise<any> {
  let functionObj = new functions();
  try {
    const token = req.cookies.token;

    if (!token) {
      return res
        .status(300)
        .json({ status_code: 0, status_message: "Not Authenticate user.." });
    }

    const secret_key = process.env.JWT_SECRET || "asdfghjklzxcvbnm";
    const verifyToken = jwt.verify(token, secret_key) as JwtPayload;

    if (verifyToken && verifyToken.id) {
      res.locals.user = verifyToken.id;
      return next();
    } else {
      return res
        .status(401)
        .json({ status_code: 0, status_message: "No Authorized Request" });
    }
  } catch (err) {
    return functionObj.output(500, 0, "INTERNAM ERROR IN AUTH MIDDLEWARE");
  }
}

export async function AdminAuth(req: any, res: any, next: any): Promise<any> {
  let userObj = new Userdb();

  const token = req.cookies.token;

  if (!token) {
    return res
      .status(300)
      .json({ status_code: 0, status_message: "Not Authenticate Admin" });
  }

  const secret_key = process.env.JWT_SECRET || "asdfghjklzxcvbnm";
  const verifyToken = jwt.verify(token, secret_key) as JwtPayload;

  const result = await userObj.selectRecord(verifyToken.id);

  if (!result[0]) {
    return res.status(404).json({ message: "Admin not found" });
  }

  if (result[0].u_role === "Admin") {
    res.locals.user = result[0].id; // Storing user data for later use
    return next();
  } else {
    return res.status(403).json({ message: "Not authorized as admin" });
  }
}

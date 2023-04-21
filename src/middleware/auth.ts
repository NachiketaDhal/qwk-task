import { AuthTokenPayload } from "src/type/type";
import jwt from "jsonwebtoken";

export const auth = (header: string): AuthTokenPayload => {
  const token = header.split(" ")[1];

  if (!token) throw new Error("Invalid token!");

  return jwt.verify(
    token,
    process.env.JWT_SECRET as jwt.Secret
  ) as AuthTokenPayload;
};

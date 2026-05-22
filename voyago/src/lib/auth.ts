import type { NextApiRequest } from "next";
import { getToken } from "next-auth/jwt";
import { verifyAccessToken } from "./jwt";

export interface RequestAuth {
  sub: string;
  email: string;
  name?: string;
  role?: string;
}

function getBearerToken(req: NextApiRequest) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

export async function getRequestAuth(req: NextApiRequest): Promise<RequestAuth | null> {
  const bearerToken = getBearerToken(req);

  if (bearerToken) {
    try {
      const decoded = verifyAccessToken(bearerToken);
      return {
        sub: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      };
    } catch {
      return null;
    }
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email) {
    return null;
  }

  return {
    sub: typeof token.sub === "string" ? token.sub : "",
    email: token.email,
    name: typeof token.name === "string" ? token.name : undefined,
    role: typeof token.role === "string" ? token.role : undefined,
  };
}

import { SignJWT, jwtVerify } from "jose";

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length === 0) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET environment variable is not set! Please set it in Vercel.");
    }
    // Fallback for development if not set
    return "super-secret-key-ppa-portal-2024-default";
  }
  return secret;
};

export const verifyAuth = async (token: string) => {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(getJwtSecretKey())
    );
    return verified.payload;
  } catch (err) {
    throw new Error("Token Anda tidak valid.");
  }
};

export const createToken = async (payload: { id: string; email: string; role: string }) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h") // 1 day expiration
    .sign(new TextEncoder().encode(getJwtSecretKey()));
};

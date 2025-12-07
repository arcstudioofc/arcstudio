import { createAuthClient } from "better-auth/react";

export const auth = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API!,
})

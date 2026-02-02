import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const auth = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  plugins: [adminClient()],
});

// import { BetterAuthOptions } from "better-auth";
import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";


// const authOptions: BetterAuthOptions = {
// };

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [
    usernameClient()
  ]
});

// export default authClient;
export const { signIn, signOut, signUp, useSession } = authClient;

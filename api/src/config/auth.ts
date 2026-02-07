import argon2 from "argon2";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import {
	admin,
	// createAccessControl,
	openAPI,
	organization,
	username,
} from "better-auth/plugins";

import { env } from "../config/env.js";
import { client, db } from "../database/client.js";
import { generateSnowflakeId } from "../utils/snowflake.js";
// import { is } from "zod/locales";

const DISCORD_USERNAME_REGEX = /^[a-z0-9_.]+$/;
const hasConsecutivePeriods = (value: string) => value.includes("..");
const normalizeDiscordUsername = (value: string) =>
	value.trim().toLowerCase();
const isDiscordUsername = (value: string) => {
	const username = normalizeDiscordUsername(value);

	if (username.length < 2 || username.length > 32) return false;
	if (!DISCORD_USERNAME_REGEX.test(username)) return false;
	if (hasConsecutivePeriods(username)) return false;

	return true;
};
// const isDev = process.env.NODE_ENV !== "production";

// export const ROLE_LIST = ["owner", "admin", "mod", "premium", "member"] as const;

// const ADMIN_STATEMENTS = {
// 	user: [
// 		"create",
// 		"list",
// 		"set-role",
// 		"ban",
// 		"impersonate",
// 		"delete",
// 		"set-password",
// 		"get",
// 		"update",
// 	],
// 	session: ["list", "revoke", "delete"],
// } as const;

// const ORG_STATEMENTS = {
// 	organization: ["update", "delete"],
// 	member: ["create", "update", "delete"],
// 	invitation: ["create", "cancel"],
// 	team: ["create", "update", "delete"],
// 	ac: ["create", "read", "update", "delete"],
// } as const;

// const adminAC = createAccessControl(ADMIN_STATEMENTS);
// const orgAC = createAccessControl(ORG_STATEMENTS);

// const ownerRole = adminAC.newRole({
// 	user: [...ADMIN_STATEMENTS.user],
// 	session: [...ADMIN_STATEMENTS.session],
// });
// const adminRole = adminAC.newRole({
// 	user: [...ADMIN_STATEMENTS.user],
// 	session: [...ADMIN_STATEMENTS.session],
// });
// const modRole = adminAC.newRole({ user: [], session: [] });
// const premiumRole = adminAC.newRole({ user: [], session: [] });
// const memberRole = adminAC.newRole({ user: [], session: [] });

// const ownerOrgRole = orgAC.newRole({
// 	organization: ["update", "delete"],
// 	member: ["create", "update", "delete"],
// 	invitation: ["create", "cancel"],
// 	team: ["create", "update", "delete"],
// 	ac: ["create", "read", "update", "delete"],
// });
// const adminOrgRole = orgAC.newRole({
// 	organization: ["update"],
// 	member: ["create", "update", "delete"],
// 	invitation: ["create", "cancel"],
// 	team: ["create", "update", "delete"],
// 	ac: ["create", "read", "update", "delete"],
// });
// const modOrgRole = orgAC.newRole({
// 	organization: [],
// 	member: ["create", "update"],
// 	invitation: ["create", "cancel"],
// 	team: ["create", "update"],
// 	ac: ["read"],
// });
// const premiumOrgRole = orgAC.newRole({
// 	organization: [],
// 	member: [],
// 	invitation: [],
// 	team: [],
// 	ac: ["read"],
// });
// const memberOrgRole = orgAC.newRole({
// 	organization: [],
// 	member: [],
// 	invitation: [],
// 	team: [],
// 	ac: ["read"],
// });

export const auth = betterAuth({
	basePath: "/auth",
	trustedOrigins: [env.ARCSTUDIO_AUTH_URL, env.ARCSTUDIO_URL, env.ARCSTUDIO_DEV_URL],

	database: mongodbAdapter(db, {
		client,
		debugLogs: process.env.NODE_ENV === "development",
	}),

	plugins: [
		admin(
			// {
			// defaultRole: "member",
			// adminRoles: ["owner", "admin"],
			// roles: {
			// 	owner: ownerRole,
			// 	admin: adminRole,
			// 	mod: modRole,
			// 	premium: premiumRole,
			// 	member: memberRole,
			// },
			// }
		),
		openAPI(),
		username({
			minUsernameLength: 2,
			maxUsernameLength: 32,

			usernameValidator: (value) => {
				return isDiscordUsername(value);
			},

			displayUsernameValidator: (value) => {
				return isDiscordUsername(value);
			},
		}),
		organization(),
	],

	advanced: {
		// crossSubDomainCookies: {
		// 	enabled: true,
		// 	domain: isDev ? "localhost" : env.BETTER_AUTH_DOMAIN,
		// },
		database: {
			generateId: generateSnowflakeId,
		},
	},

	session: {
		expiresIn: 60 * 60 * 24 * 7, // Auto logout in 7 days
		// cookieCache: {
		// 	enabled: true,
		// 	maxAge: 60 * 5, // salva os cookies por 5 minutos
		// },
		// Para uso de Redis no futuro
		// secondaryCookie: {
		// 	get: async (key: string) => {},
		// 	set: async () => {},
		// 	delete: async () => {},
		// }
	},

	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
		// requireEmailVerification: true,
		minPasswordLength: 8,
		maxPasswordLength: 120,
		password: {
			hash: (password) => argon2.hash(password),
			verify: ({ password, hash }) => argon2.verify(hash, password),
		},
	},

	// emailVerification: {
	//   sendOnSignInUp: true,
	//   sendVerificationEmail: async ({ user, url }) => {
	//     try {
	//       await new Resend(env.RESEND_API_KEY).emails.send({
	//         from: "ARC Studio, Inc. <no-reply@arcstudio.online>",
	//         to: user.email,
	//         subject: "Verify your email address",
	//         react: (
	//           await import("../email/verify-email.jsx")
	//         ).default({
	//           verifyUrl: url,
	//           username: user.name || "unknown",
	//         }),
	//       });
	//     } catch (err) {
	//       console.error("Email verification failed", err);
	//       throw err;
	//     }
	//   },
	// },

	socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRECT,
		},
		// vercel: {
		//   clientId: env.VERCEL_CLIENT_ID,
		//   clientSecret: env.VERCEL_CLIENT_SECRECT,
		//   scope: ["openid", "email", "profile"],
		// },
	},
});

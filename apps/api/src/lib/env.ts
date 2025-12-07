import { z } from 'zod';
import 'dotenv/config';


const envSchema = z.object({
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.url(),

    ARC_STUDIO_URL: z.url(),
    
    MONGODB_URI: z.string()
});

export const env = envSchema.parse(process.env);
import { loadEnv } from 'vite';
import { validatePublicSupabaseConfig } from './src/backendConfig.js';

export default ({ mode }) => {
  const env = loadEnv(mode,process.cwd(),'VITE_');
  // Fail before building so a mistaken secret key is never bundled for the browser.
  validatePublicSupabaseConfig(env.VITE_SUPABASE_URL,env.VITE_SUPABASE_PUBLISHABLE_KEY);
  return { cacheDir:'.vite-preview' };
};

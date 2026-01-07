import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        react(),
        commonjs(), // Transform CommonJS to ESM
    ],
    server: {
        port: 3000,
        open: true,
    },
    build: {
        outDir: 'dist', // Standard Vite output
        commonjsOptions: {
            transformMixedEsModules: true, // Handle files that mix import/require
        },
    },
    define: {
        'process.env.EXTERNAL_IP_ADDRESS': JSON.stringify(process.env.EXTERNAL_IP_ADDRESS),
        'process.env.INTERNAL_IP_ADDRESS': JSON.stringify(process.env.INTERNAL_IP_ADDRESS),
        'process.env.PORT': JSON.stringify(process.env.PORT),
        'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL),
        'process.env.SUPABASE_KEY': JSON.stringify(process.env.SUPABASE_KEY),
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    },
    publicDir: 'public', // Serve assets from public/ folder
});

module.exports = {
  // Use environment variables or defaults
  // Fallback to Northflank URL in production if env var is missing
  EXTERNAL_IP_ADDRESS: process.env.EXTERNAL_IP_ADDRESS || (process.env.NODE_ENV === 'production' ? 'p01--lava-chess--wd56yy4hk9cj.code.run' : 'localhost'),
  INTERNAL_IP_ADDRESS: process.env.INTERNAL_IP_ADDRESS || 'localhost',
  PORT: process.env.PORT || 4000,
  // WebSocket port is now same as PORT for cloud deployment consistency
  WEBSOCKET_PORT: process.env.PORT || 80,

  SUPABASE_URL: process.env.SUPABASE_URL || 'https://lowfzagrjpifnxcafgvc.supabase.co',
  SUPABASE_KEY: process.env.SUPABASE_KEY || 'sb_publishable_SdMzgpdYRszHFK6OYCFw3w_j9P8nABm',
  TEST: false,
};

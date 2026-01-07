module.exports = {
  EXTERNAL_IP_ADDRESS: process.env.EXTERNAL_IP_ADDRESS || '4.193.96.209',
  INTERNAL_IP_ADDRESS: process.env.INTERNAL_IP_ADDRESS || '10.2.0.4',
  PORT: process.env.PORT || 80,
  WEBSOCKET_PORT: process.env.PORT || 80,

  SUPABASE_URL: process.env.SUPABASE_URL || 'https://lowfzagrjpifnxcafgvc.supabase.co',
  SUPABASE_KEY: process.env.SUPABASE_KEY || 'sb_publishable_SdMzgpdYRszHFK6OYCFw3w_j9P8nABm',
  TEST: false,
};

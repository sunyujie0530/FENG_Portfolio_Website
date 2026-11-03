export function validatePublicSupabaseConfig(url,key) {
  if (!url && !key) return false;
  if (!url || !key) throw new Error('请同时配置 Supabase URL 和公开 Publishable Key');
  let address;
  try { address = new URL(url); } catch { throw new Error('Supabase URL 格式不正确'); }
  if (address.protocol !== 'https:' && !(address.protocol === 'http:' && ['localhost','127.0.0.1'].includes(address.hostname))) throw new Error('Supabase 必须使用 HTTPS');
  let publicKey = /^sb_publishable_[A-Za-z0-9_-]+$/.test(key);
  if (!publicKey) {
    try {
      const payload = key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
      publicKey = JSON.parse(atob(payload)).role === 'anon';
    } catch { publicKey = false; }
  }
  if (!publicKey) throw new Error('VITE_SUPABASE_PUBLISHABLE_KEY 只能使用公开 Publishable/anon key，禁止 secret/service_role 密钥');
  return true;
}

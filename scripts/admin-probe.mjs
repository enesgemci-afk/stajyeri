const SB='https://eftlmmunitzrnfenqlbv.supabase.co';
const ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmdGxtbXVuaXR6cm5mZW5xbGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NTUwODIsImV4cCI6MjEwMzIzMTA4Mn0.CNoopOgA0URXk8uWXdrWDVJJQQFjPcRuZImfingGFvc';
const res = await fetch(`${SB}/auth/v1/token?grant_type=password`, {
  method:'POST', headers:{'apikey':ANON,'Content-Type':'application/json'},
  body: JSON.stringify({email:'enesg@stajyeri.net', password:'Enes5050'})
});
const data = await res.json();
console.log('1) GIRIS DENEMESI:', res.status, data.error_description || data.msg || data.error || 'OK');
if (!res.ok) process.exit(0);
const uid = data.user.id, token = data.access_token;
console.log('2) USER ID:', uid, '| email confirmed:', data.user.email_confirmed_at ? 'EVET' : 'HAYIR');
const p = await fetch(`${SB}/rest/v1/profiles?id=eq.${uid}&select=id,user_type,is_admin,full_name`, {headers:{'apikey':ANON,'Authorization':`Bearer ${token}`}});
const pj = await p.json();
console.log('3) PROFILES SATIRI:', p.status, JSON.stringify(pj));
const r = await fetch(`${SB}/rest/v1/rpc/is_admin`, {method:'POST',headers:{'apikey':ANON,'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},body:'null'});
console.log('4) is_admin() RPC:', r.status, await r.text());

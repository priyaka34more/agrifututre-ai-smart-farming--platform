const fs = require('fs');
const path = require('path');

function parseEnv(filePath){
  if(!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath,'utf8');
  const lines = content.split(/\r?\n/);
  const out = {};
  for(const line of lines){
    const trimmed = line.trim();
    if(!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if(idx===-1) continue;
    const key = trimmed.slice(0,idx).trim();
    const val = trimmed.slice(idx+1).trim();
    out[key]=val;
  }
  return out;
}

const devEnv = parseEnv(path.join(__dirname,'..','frontend','.env.development'));
const env = parseEnv(path.join(__dirname,'..','frontend','.env'));
const backendEnv = parseEnv(path.join(__dirname,'..','backend','.env'));

console.log('frontend/.env.development -> REACT_APP_GOOGLE_WEB_CLIENT_ID =', devEnv.REACT_APP_GOOGLE_WEB_CLIENT_ID || '(missing)');
console.log('frontend/.env.development -> REACT_APP_GOOGLE_ANDROID_CLIENT_ID =', devEnv.REACT_APP_GOOGLE_ANDROID_CLIENT_ID || '(missing)');
console.log('frontend/.env -> REACT_APP_GOOGLE_WEB_CLIENT_ID =', env.REACT_APP_GOOGLE_WEB_CLIENT_ID || '(missing)');
console.log('frontend/.env -> REACT_APP_GOOGLE_ANDROID_CLIENT_ID =', env.REACT_APP_GOOGLE_ANDROID_CLIENT_ID || '(missing)');
console.log('backend/.env -> GOOGLE_OAUTH_CLIENT_IDS =', backendEnv.GOOGLE_OAUTH_CLIENT_IDS || '(missing)');

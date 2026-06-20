import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual parser for .env.local since we are outside Vite
const envPath = path.resolve(process.cwd(), '.env.local');
let envFile = '';
try {
  envFile = fs.readFileSync(envPath, 'utf8');
} catch (e) {
  console.error("Failed to read .env.local", e.message);
  process.exit(1);
}

const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=["']?(.*?)["']?$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const url = envVars['VITE_SUPABASE_URL'];
const key = envVars['VITE_SUPABASE_ANON_KEY'];

if (!url || !key || url === 'YOUR_SUPABASE_PROJECT_URL_HERE') {
  console.error('Error: Please update .env.local with your actual Supabase URL and Key before testing.');
  process.exit(1);
}

const supabase = createClient(url, key);

async function testConnection() {
  console.log('Testing Supabase Connection...');
  console.log(`URL: ${url}`);
  
  // Try to query the courses table which anon has access to
  const { data, error } = await supabase.from('courses').select('id').limit(1);
  
  if (error) {
    console.error('❌ Connection Failed or Table Missing!');
    console.error('Error details:', error);
  } else {
    console.log('✅ Connection Successful!');
    console.log('Database returned data (or empty array if no users yet):', data);
    console.log('Integrations are working perfectly.');
  }
}

testConnection();

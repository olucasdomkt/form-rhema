import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

let cachedToken = null;
let expiresAt = 0;

export async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < expiresAt - 5 * 60 * 1000) {
    return cachedToken;
  }

  const { RD_CLIENT_ID, RD_CLIENT_SECRET } = process.env;
  if (!RD_CLIENT_ID || !RD_CLIENT_SECRET) {
    throw new Error('RD_CLIENT_ID ou RD_CLIENT_SECRET não definidos nas variáveis de ambiente');
  }

  const { data } = await axios.post(
    'https://api.rd.services/auth/token',
    {
      client_id: RD_CLIENT_ID,
      client_secret: RD_CLIENT_SECRET,
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  cachedToken = data.access_token;
  expiresAt = now + data.expires_in * 1000;
  return cachedToken;
} 
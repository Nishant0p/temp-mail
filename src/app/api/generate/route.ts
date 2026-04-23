import { NextResponse } from 'next/server';

function generateRandomString(length: number) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST() {
  try {
    const provider = Math.floor(Math.random() * 2) + 1;

    if (provider === 1) {
      // mail.tm
      const domainRes = await fetch('https://api.mail.tm/domains');
      const domainData = await domainRes.json();
      const domain = domainData['hydra:member'][0].domain;
      
      const address = `${generateRandomString(10)}@${domain}`;
      const password = generateRandomString(12);

      const accRes = await fetch('https://api.mail.tm/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password })
      });
      
      if (!accRes.ok) throw new Error('mail.tm failed');

      const sessionToken = Buffer.from(JSON.stringify({ p: 1, a: address, pw: password })).toString('base64');
      return NextResponse.json({ email: address, sessionToken });
    } 
    else {
      // temp-mail.io
      const res = await fetch('https://api.internal.temp-mail.io/api/v3/email/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ min_name_length: 10, max_name_length: 10 })
      });
      const data = await res.json();
      const email = data.email;
      const sessionToken = Buffer.from(JSON.stringify({ p: 2, a: email })).toString('base64');
      return NextResponse.json({ email, sessionToken });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate email' }, { status: 500 });
  }
}

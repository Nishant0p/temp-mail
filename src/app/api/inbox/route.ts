import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  try {
    const session = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    
    if (session.p === 1) {
      // mail.tm
      // First get a JWT token
      const tokenRes = await fetch('https://api.mail.tm/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: session.a, password: session.pw })
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.token) return NextResponse.json([]);

      const msgRes = await fetch('https://api.mail.tm/messages', {
        headers: { 'Authorization': `Bearer ${tokenData.token}` }
      });
      const msgData = await msgRes.json();
      
      return NextResponse.json(msgData['hydra:member'].map((m: any) => ({
        id: m.id,
        from: m.from.address,
        subject: m.subject,
        intro: m.intro,
        date: m.createdAt,
        provider: 1
      })));

    } else if (session.p === 2) {
      // temp-mail.io
      const res = await fetch(`https://api.internal.temp-mail.io/api/v3/email/${session.a}/messages`);
      const data = await res.json();
      
      return NextResponse.json(data.map((m: any) => ({
        id: m.id,
        from: m.from,
        subject: m.subject,
        intro: (m.body_text || m.text_body || m.text || '').substring(0, 100),
        date: m.created_at,
        provider: 2,
        raw: m
      })));
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch inbox' }, { status: 500 });
  }
}

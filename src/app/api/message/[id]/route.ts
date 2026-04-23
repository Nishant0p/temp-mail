import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const resolvedParams = await params;

  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  try {
    const session = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    
    if (session.p === 1) {
      const tokenRes = await fetch('https://api.mail.tm/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: session.a, password: session.pw })
      });
      const tokenData = await tokenRes.json();
      
      const msgRes = await fetch(`https://api.mail.tm/messages/${resolvedParams.id}`, {
        headers: { 'Authorization': `Bearer ${tokenData.token}` }
      });
      const msgData = await msgRes.json();
      return NextResponse.json({
        html: msgData.html ? msgData.html[0] : msgData.text,
        text: msgData.text
      });
    }
    // For others, inbox returns enough text or they don't have a specific message endpoint easily mapped.
    // Here we can just return a dummy or error, or fetch from inbox and filter.
    return NextResponse.json({ error: 'Message detail not supported for this provider' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch message' }, { status: 500 });
  }
}

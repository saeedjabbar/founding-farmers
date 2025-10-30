import { NextRequest, NextResponse } from 'next/server';

const MAILGUN_BASE_URL = process.env.MAILGUN_BASE_URL ?? 'https://api.mailgun.net';
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_TO_EMAIL = process.env.MAILGUN_TO_EMAIL;
const MAILGUN_FROM_EMAIL = process.env.MAILGUN_FROM_EMAIL;

function getAuthorizationHeader() {
  const token = Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64');
  return `Basic ${token}`;
}

function buildTextBody({ name, email, message }: { name?: string; email?: string; message: string }) {
  const lines = [
    'New submit form entry',
    '',
    `Name: ${name?.trim() || 'Not provided'}`,
    `Email: ${email?.trim() || 'Not provided'}`,
    '',
    'Message:',
    message.trim(),
  ];

  return lines.join('\n');
}

function buildHtmlBody({ name, email, message }: { name?: string; email?: string; message: string }) {
  const safeMessage = message
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .join('<br />');

  return `<!doctype html>
<html lang="en">
  <body>
    <h1>New submit form entry</h1>
    <p><strong>Name:</strong> ${name?.trim() || 'Not provided'}</p>
    <p><strong>Email:</strong> ${email?.trim() || 'Not provided'}</p>
    <h2 style="margin-top:24px;">Message</h2>
    <p>${safeMessage}</p>
  </body>
</html>`;
}

export async function POST(request: NextRequest) {
  if (!MAILGUN_DOMAIN || !MAILGUN_API_KEY || !MAILGUN_TO_EMAIL) {
    return NextResponse.json(
      { error: 'Mail service misconfigured. Please try again later.' },
      { status: 500 }
    );
  }

  let payload: { name?: string; email?: string; message?: string };

  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const name = payload?.name?.toString().slice(0, 200);
  const email = payload?.email?.toString().slice(0, 200);
  const message = payload?.message?.toString() ?? '';

  if (!message || !message.trim()) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
  }

  const fromAddress =
    MAILGUN_FROM_EMAIL || `Mailgun Sandbox <postmaster@${MAILGUN_DOMAIN}>`;

  const body = new URLSearchParams();
  body.append('from', fromAddress);
  body.append('to', MAILGUN_TO_EMAIL);
  body.append('subject', 'New tip submission');
  body.append('text', buildTextBody({ name, email, message }));
  body.append('html', buildHtmlBody({ name, email, message }));

  if (email && email.trim()) {
    body.append('h:Reply-To', email.trim());
  }

  try {
    const response = await fetch(`${MAILGUN_BASE_URL}/v3/${MAILGUN_DOMAIN}/messages`, {
      method: 'POST',
      headers: {
        Authorization: getAuthorizationHeader(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mailgun error:', errorText);
      return NextResponse.json({ error: 'Unable to send message.' }, { status: 502 });
    }
  } catch (error) {
    console.error('Mailgun request failed:', error);
    return NextResponse.json({ error: 'Unable to send message.' }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}

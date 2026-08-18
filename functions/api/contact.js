/**
 * Cloudflare Pages Function: /api/contact
 * Handles consult intake and contact submissions securely at the edge.
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // Enforce JSON content-type
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid content type. Expected application/json.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const data = await request.json();
    const { name, email, company, engagement_type, message, timeline, budget, website } = data;

    // Honeypot Bot Trap Check
    if (website && website.trim().length > 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'Message received.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Input Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Full name is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'A valid email address is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Project scope or role overview message is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Forwarding logic if webhook URL is configured in Cloudflare Pages environment variables
    const webhookUrl = env.CONTACT_WEBHOOK_URL || env.DISCORD_WEBHOOK_URL;
    if (webhookUrl) {
      const payload = {
        timestamp: new Date().toISOString(),
        name: name.trim(),
        email: email.trim(),
        company: (company || 'Not Specified').trim(),
        engagement_type: engagement_type || 'General',
        timeline: timeline || 'Flexible',
        budget: budget || 'N/A',
        message: message.trim()
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Inquiry transmitted successfully.' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to process request payload.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestGet() {
  return new Response(
    JSON.stringify({ status: 'healthy', endpoint: '/api/contact' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

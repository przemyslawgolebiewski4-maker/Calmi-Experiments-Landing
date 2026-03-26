export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, role, clients, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'contact@lelekstudio.com',
        to: 'lelekstudio@lelekstudio.com',
        reply_to: email,
        subject: `[Calmi Experiments] License inquiry — ${role || 'Professional'}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;color:#1a1a2e">
            <h2 style="font-weight:600;border-bottom:2px solid #7c3aed;padding-bottom:12px;color:#7c3aed">
              New license inquiry — Calmi Experiments
            </h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Role:</strong> ${role || '—'}</p>
            <p><strong>Number of clients:</strong> ${clients || '—'}</p>
            ${message ? `
            <div style="background:#f5f0ff;padding:16px;margin-top:16px;border-left:3px solid #7c3aed">
              <p style="white-space:pre-wrap">${message}</p>
            </div>` : ''}
            <p style="font-size:12px;color:#999;margin-top:24px">
              Sent from calmiexperiments.lelekstudio.com
            </p>
          </div>
        `
      })
    });

    if (response.ok) {
      return res.status(200).json({ ok: true });
    } else {
      const err = await response.json();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

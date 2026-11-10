const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const nodemailer = require('nodemailer');

// Salaisuudet (Secret Manager): firebase functions:secrets:set SMTP_USER / SMTP_PASS
const SMTP_USER = defineSecret('SMTP_USER'); // Gmail-osoite, josta posti lähetetään
const SMTP_PASS = defineSecret('SMTP_PASS'); // Gmailin sovellussalasana (app password)
const TO = 'eilamaria.leskinen@gmail.com';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hits = new Map(); // yksinkertainen instanssikohtainen rate limit
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

function limited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 1000) hits.clear();
  return arr.length > MAX_HITS;
}

exports.contact = onRequest(
  { region: 'europe-west1', secrets: [SMTP_USER, SMTP_PASS], maxInstances: 3, memory: '256MiB' },
  async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
    const body = typeof req.body === 'object' && req.body ? req.body : {};
    // Honeypot: botit täyttävät piilokentän. Vastataan onnistuneesti mutta ei lähetetä.
    if (body.website) return res.status(200).json({ ok: true });
    const ip = req.get('x-forwarded-for')?.split(',')[0]?.trim() || req.ip || 'unknown';
    if (limited(ip)) return res.status(429).json({ error: 'rate' });

    const name = String(body.name || '').trim().slice(0, 100);
    const email = String(body.email || '').trim().slice(0, 200);
    const message = String(body.message || '').trim().slice(0, 4000);
    if (!name || !message || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'invalid' });

    try {
      const transport = nodemailer.createTransport({
        host: 'smtp.gmail.com', port: 465, secure: true,
        auth: { user: SMTP_USER.value(), pass: SMTP_PASS.value() },
      });
      await transport.sendMail({
        from: `"Sivuston yhteydenotto" <${SMTP_USER.value()}>`,
        to: TO,
        replyTo: `"${name.replace(/["\r\n]/g, '')}" <${email}>`,
        subject: `Yhteydenotto sivustolta: ${name.replace(/[\r\n]/g, ' ')}`,
        text: `Nimi: ${name}\nSähköposti: ${email}\n\n${message}`,
      });
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('send failed', err && err.message);
      return res.status(500).json({ error: 'send' });
    }
  }
);

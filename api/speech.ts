import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const googleTtsKey = process.env.GOOGLE_CLOUD_TTS_KEY;
  const azureKey = process.env.AZURE_SPEECH_KEY;
  const isConfigured = Boolean(googleTtsKey || azureKey);

  // Status check route: GET /api/speech?action=status
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        configured: isConfigured,
        supportedLanguages: ['en-IN', 'te-IN', 'hi-IN'],
        activeProviders: {
          googleCloud: Boolean(googleTtsKey),
          azureSpeech: Boolean(azureKey)
        },
        message: isConfigured
          ? 'Cloud Text-to-Speech provider active.'
          : 'Cloud Text-to-Speech credentials unconfigured. Operating in Native Browser Speech Mode.'
      })
    );
    return;
  }

  if (req.method === 'POST') {
    if (!isConfigured) {
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 503;
      res.end(
        JSON.stringify({
          error: 'Cloud TTS Unconfigured',
          message:
            'Server-side Cloud Text-to-Speech credentials (GOOGLE_CLOUD_TTS_KEY or AZURE_SPEECH_KEY) are not set. The application relies on native browser Web Speech API.'
        })
      );
      return;
    }

    // Read POST body
    let bodyStr = '';
    req.on('data', (chunk) => {
      bodyStr += chunk;
    });

    req.on('end', async () => {
      try {
        const body = JSON.parse(bodyStr || '{}');
        const { text, lang, rate } = body;

        if (!text) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Text parameter is required' }));
          return;
        }

        // Forward to Google Cloud Text-to-Speech if key is available
        if (googleTtsKey) {
          const targetLangCode = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
          const ttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleTtsKey}`;
          const gRes = await fetch(ttsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              input: { text },
              voice: {
                languageCode: targetLangCode,
                ssmlGender: 'NEUTRAL'
              },
              audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: rate ?? 1.0
              }
            })
          });

          if (!gRes.ok) {
            const errJson = await gRes.text();
            res.statusCode = 502;
            res.end(JSON.stringify({ error: 'Google TTS Upstream Error', details: errJson }));
            return;
          }

          const gData = await gRes.json();
          const audioBuffer = Buffer.from(gData.audioContent, 'base64');

          res.setHeader('Content-Type', 'audio/mpeg');
          res.statusCode = 200;
          res.end(audioBuffer);
          return;
        }

        res.statusCode = 501;
        res.end(JSON.stringify({ error: 'No active synthesis engine found' }));
      } catch (err: any) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Server synthesis error', details: err?.message }));
      }
    });
    return;
  }

  res.statusCode = 405;
  res.end('Method Not Allowed');
}

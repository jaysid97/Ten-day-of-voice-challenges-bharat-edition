const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function buildReply(text) {
  const normalized = (text || '').trim().toLowerCase();

  if (!normalized) {
    return 'I am ready to help. Tell me what you need.';
  }

  if (normalized.includes('hello') || normalized.includes('hi') || normalized.includes('namaste')) {
    return 'Namaste! I am your voice agent for the Learning & Literacy track. I can help with simple guidance and friendly conversation.';
  }

  if (normalized.includes('help')) {
    return 'I can help you practice simple questions, explain a topic, or guide you through a literacy activity.';
  }

  if (normalized.includes('weather')) {
    return 'I can not check the weather right now, but I can help you build a voice experience for local needs.';
  }

  return `I heard you say: ${text}. I am still in Day 1 mode, but I can respond with a simple voice reply right now.`;
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    track: process.env.TRACK || 'Learning & Literacy',
    voice: process.env.VOICE_DESCRIPTION || 'Indian English',
    murfConfigured: Boolean(process.env.MURF_API_KEY),
  });
});

app.post('/api/respond', async (req, res) => {
  const inputText = req.body?.text || '';
  const reply = buildReply(inputText);

  let audioUrl = null;
  let murfStatus = 'browser-fallback';

  if (process.env.MURF_API_KEY) {
    try {
      const murfResponse = await fetch('https://api.murf.ai/v1/speech', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.MURF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: reply,
          voiceId: process.env.MURF_VOICE_ID || 'en-IN-vidya',
          model: process.env.MURF_MODEL || 'falcon-2',
          format: 'mp3',
        }),
      });

      if (murfResponse.ok) {
        const data = await murfResponse.json();
        audioUrl = data.audioUrl || data.url || null;
        murfStatus = 'murf';
      } else {
        murfStatus = 'murf-error';
      }
    } catch (error) {
      console.error('Murf request failed', error);
      murfStatus = 'murf-error';
    }
  }

  res.json({
    reply,
    audioUrl,
    mode: murfStatus,
  });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Voice agent starter listening on http://localhost:${port}`);
});

import OpenAI from 'openai';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://raiyan-eng.github.io';
const requestWindows = new Map();
const maximumQuestionsPerHour = 30;

function reply(response, status, body) {
  response.status(status).json(body);
}

function firebaseAuth() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not configured.');
  }
  if (!getApps().length) {
    initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
  }
  return getAuth();
}

function canAskQuestion(userId) {
  const now = Date.now();
  const windowStart = now - 60 * 60 * 1000;
  const recent = (requestWindows.get(userId) || []).filter(time => time > windowStart);
  if (recent.length >= maximumQuestionsPerHour) return false;
  recent.push(now);
  requestWindows.set(userId, recent);
  return true;
}

export default async function handler(request, response) {
  const origin = request.headers.origin;
  if (origin === allowedOrigin) response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Vary', 'Origin');
  response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (request.method === 'OPTIONS') return response.status(204).end();
  if (request.method === 'GET') {
    return reply(response, 200, {
      service: 'StudyMonkey Tutor',
      status: 'ready',
      configured: Boolean(process.env.OPENAI_API_KEY && process.env.FIREBASE_SERVICE_ACCOUNT)
    });
  }
  if (request.method !== 'POST') return reply(response, 405, { error: 'Use POST.' });
  if (origin && origin !== allowedOrigin) return reply(response, 403, { error: 'This website is not allowed to use the tutor.' });

  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return reply(response, 401, { error: 'Please sign in before asking the tutor.' });
  let user;
  try { user = await firebaseAuth().verifyIdToken(token); } catch (error) {
    console.error('Firebase authentication failed', error);
    return reply(response, 401, { error: 'Your sign-in has expired or the tutor server is not configured yet.' });
  }
  if (!canAskQuestion(user.uid)) return reply(response, 429, { error: 'You have asked many questions recently. Please wait a little while.' });

  const question = String(request.body?.question || '').trim();
  const subject = String(request.body?.subject || '').trim();
  const unit = String(request.body?.unit || '').trim();
  if (!question || question.length > 1200) return reply(response, 400, { error: 'Ask one question of up to 1200 characters.' });
  if (!subject || !unit) return reply(response, 400, { error: 'Choose a subject and unit first.' });

  try {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured.');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5',
      store: false,
      max_output_tokens: 700,
      instructions: `You are StudyMonkey, a friendly Cambridge IGCSE study tutor. The learner is studying ${subject}, unit: ${unit}. Answer their exact question using simple language first. Add one short example when useful. Do not invent textbook quotations or exam requirements. Keep your answer under 250 words.`,
      input: question
    });
    return reply(response, 200, { answer: result.output_text || 'Please try asking that another way.' });
  } catch (error) {
    console.error('Tutor request failed', error);
    return reply(response, 502, { error: 'The tutor is temporarily unavailable. Please try again.' });
  }
}


import { supabase } from './supabase';

// ⚠️ Insert your Groq API Key in a .env file as EXPO_PUBLIC_GROQ_API_KEY
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * 🛡️ Helper: Silent Exponential Backoff Retry
 * Handles high-concurrency rate limits smoothly without user disruption.
 */
const fetchWithRetry = async (url, options, maxRetries = 3) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, options);
      // 429 means "Too Many Requests" - we catch this and retry
      if (response.status === 429) {
        throw new Error('RateLimitHit');
      }
      return response;
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw error;
      // Exponential backoff wait time: 1.2s, 2.4s...
      const delay = 1200 * Math.pow(2, attempt - 1);
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

/**
 * Generates a short, highly-contextual AI insight for the Home Dashboard.
 */
export const getQuickInsight = async (aqi, pollutants, medicalProfile) => {
  if (GROQ_API_KEY === 'INSERT_GROQ_KEY_HERE') {
    return `Naitik, the AQI is currently ${aqi}. Based on your profile, it's best to limit intense outdoor activity right now. (Insert Groq API key in aiService.js)`;
  }

  const systemPrompt = `You are AERO, an empathetic, highly intelligent respiratory health AI. 
  The user has the following medical profile: ${JSON.stringify(medicalProfile || 'No specific conditions')}.
  The current outside air quality (AQI) is ${aqi}. Pollutants: PM2.5 (${pollutants?.pm25}), PM10 (${pollutants?.pm10}), NO2 (${pollutants?.no2}).
  Write exactly 2 short, concise, and highly personalized sentences advising the user on what to do right now. Be warm, professional, and action-oriented.`;

  try {
    const response = await fetchWithRetry(GROQ_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "system", content: systemPrompt }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.log("Groq API Error Payload:", data.error);
      return `API Error: ${data.error.message || 'Unknown error'}`;
    }

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    }
    return "The air quality is fluctuating. Prioritize your Meditative Sanctuary to clear your lungs today.";
  } catch (error) {
    console.log("AI Insight Error:", error);
    return `Network Error: ${error.message}`;
  }
};

/**
 * Handles the conversational loop for the deep-chat screen.
 */
export const sendChatMessage = async (chatHistory, medicalProfile, currentAqi) => {
  if (GROQ_API_KEY === 'INSERT_GROQ_KEY_HERE') {
    return "I am AERO, your personal respiratory AI. To activate my neural network, please insert your Groq API Key in `src/utils/aiService.js`.";
  }

  const systemInstruction = `You are AERO, an expert pulmonary health assistant. 
  User Medical Profile: ${JSON.stringify(medicalProfile || 'No specific conditions')}. Current Local AQI: ${currentAqi}.
  Your tone is empathetic, scientifically accurate, and supportive. You answer questions specifically about respiratory health, air quality, meditation, and general wellbeing. Keep responses relatively concise to fit on a mobile screen.`;

  // Format history for Groq (OpenAI standard)
  const formattedHistory = chatHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.text
  }));

  try {
    const response = await fetchWithRetry(GROQ_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: systemInstruction },
          ...formattedHistory
        ]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.log("Groq API Error Payload:", data.error);
      return `API Error: ${data.error.message || 'Unknown error'}`;
    }

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    }
    
    return "I'm having trouble analyzing the data right now. Please try again.";
  } catch (error) {
    console.log("AI Chat Error:", error);
    return `Network Error: ${error.message}`;
  }
};

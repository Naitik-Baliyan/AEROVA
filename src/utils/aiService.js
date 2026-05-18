import { supabase } from './supabase';

/**
 * Generates a short, highly-contextual AI insight for the Home Dashboard via Secure Edge Function.
 */
export const getQuickInsight = async (aqi, pollutants, medicalProfile) => {
  try {
    const { data, error } = await supabase.functions.invoke('aerova-ai', {
      body: {
        type: 'insight',
        payload: { aqi, pollutants, medicalProfile }
      }
    });

    if (error) {
      console.log('Edge Function Error:', error);
      return `Network Error: ${error.message}`;
    }

    if (data && data.result) {
      return data.result;
    }
    
    return "The air quality is fluctuating. Prioritize your Meditative Sanctuary to clear your lungs today.";
  } catch (error) {
    console.log("AI Insight Error:", error);
    return `Network Error: ${error.message}`;
  }
};

/**
 * Handles the conversational loop for the deep-chat screen via Secure Edge Function.
 */
export const sendChatMessage = async (chatHistory, medicalProfile, currentAqi) => {
  try {
    const { data, error } = await supabase.functions.invoke('aerova-ai', {
      body: {
        type: 'chat',
        payload: { chatHistory, medicalProfile, currentAqi }
      }
    });

    if (error) {
      console.log('Edge Function Error:', error);
      return "Network Error - AI Services are temporarily unavailable.";
    }

    if (data && data.result) {
      return data.result;
    }
    
    return "I am processing the data, but I encountered an error. Please try again.";
  } catch (error) {
    console.log("Chat Error:", error);
    return "I encountered a communication error with the neural net.";
  }
};

/*
IMPORTANT NOTICE: DO NOT REMOVE
This is a custom client for the Grok API. You may update this service, but you should not need to.
The Grok API can be communicated with the "openai" package, so you can use the same functions as the openai package. It may not support all the same features, so please be careful.


grok-3-latest
grok-3-fast-latest
grok-3-mini-latest
*/
import OpenAI from "openai";

import { getApiKey, secureLog } from '../config/environment';

export const getGrokClient = () => {
  // Try Vibecode API key first, then fallback to custom key
  const vibeCodeKey = process.env.EXPO_PUBLIC_VIBECODE_GROK_API_KEY;
  const customKey = getApiKey('grok');
  const apiKey = vibeCodeKey || customKey;
  
  if (!apiKey) {
    secureLog('warn', "Grok API key not found in environment variables");
    secureLog('info', "Please set EXPO_PUBLIC_VIBECODE_GROK_API_KEY or AI_GROK_KEY");
  }
  
  secureLog('info', 'Grok client initialized', { 
    hasVibeCodeKey: !!vibeCodeKey,
    hasCustomKey: !!customKey,
    keyLength: apiKey?.length || 0
  });
  
  return new OpenAI({
    apiKey: apiKey,
    baseURL: "https://api.x.ai/v1",
  });
};

/*
IMPORTANT NOTICE: DO NOT REMOVE
This is a custom client for the OpenAI API. You may update this service, but you should not need to.

valid model names:
gpt-4.1-2025-04-14
o4-mini-2025-04-16
gpt-4o-2024-11-20
*/
import OpenAI from "openai";

import { getApiKey, secureLog } from '../config/environment';

export const getOpenAIClient = () => {
  // Try Vibecode API key first, then fallback to custom key
  const vibeCodeKey = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;
  const customKey = getApiKey('openai');
  const apiKey = vibeCodeKey || customKey;
  
  if (!apiKey) {
    secureLog('warn', "OpenAI API key not found in environment variables");
    secureLog('info', "Please set EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY or AI_OPENAI_KEY");
  }
  
  secureLog('info', 'OpenAI client initialized', { 
    hasVibeCodeKey: !!vibeCodeKey,
    hasCustomKey: !!customKey,
    keyLength: apiKey?.length || 0
  });
  
  return new OpenAI({
    apiKey: apiKey,
  });
};

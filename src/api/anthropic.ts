/*
IMPORTANT NOTICE: DO NOT REMOVE
This is a custom client for the Anthropic API. You may update this service, but you should not need to.

Valid model names: 
claude-sonnet-4-20250514
claude-3-7-sonnet-latest
claude-3-5-haiku-latest
*/
import Anthropic from "@anthropic-ai/sdk";

import { getApiKey, secureLog } from '../config/environment';

export const getAnthropicClient = () => {
  // Try Vibecode API key first, then fallback to custom key
  const vibeCodeKey = process.env.EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY;
  const customKey = getApiKey('anthropic');
  const apiKey = vibeCodeKey || customKey;
  
  if (!apiKey) {
    secureLog('warn', "Anthropic API key not found in environment variables");
    secureLog('info', "Please set EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY or AI_ANTHROPIC_KEY");
  }
  
  secureLog('info', 'Anthropic client initialized', { 
    hasVibeCodeKey: !!vibeCodeKey,
    hasCustomKey: !!customKey,
    keyLength: apiKey?.length || 0
  });
  
  return new Anthropic({
    apiKey: apiKey,
  });
};

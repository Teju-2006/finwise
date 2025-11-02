import { GoogleGenAI, Type, Chat, GenerateContentResponse } from "@google/genai";
import { UserProfile, SchemeRecommendation, ChatMessage, LatLng } from '../types';

// The `GoogleGenAI` instance should always be created right before making an API call
// to ensure it uses the most up-to-date API key from `process.env.API_KEY`.
// We'll manage chat sessions and client instance within the service.

let _currentChatSession: Chat | null = null;
let _currentGeminiClient: GoogleGenAI | null = null;
let _currentMentorChatSession: Chat | null = null; // New chat session for the game mentor

const _getNewGeminiClient = (): GoogleGenAI => {
  if (!process.env.API_KEY) {
    console.error('Gemini API_KEY is not set in environment variables.');
    throw new Error('Gemini API_KEY is not configured.');
  }
  // Always create a new instance to ensure it picks up the latest API_KEY
  _currentGeminiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return _currentGeminiClient;
};

const _reinitializeChatSession = (systemInstruction: string, chatType: 'general' | 'mentor' = 'general') => {
  const ai = _getNewGeminiClient();
  if (chatType === 'general') {
    _currentChatSession = ai.chats.create({
      model: 'gemini-2.5-flash', // Using gemini-2.5-flash for conversational tasks
      config: {
        systemInstruction: systemInstruction,
      },
    });
    console.log('Gemini general chat session re-initialized.');
  } else { // 'mentor'
    _currentMentorChatSession = ai.chats.create({
      model: 'gemini-2.5-flash', // Using gemini-2.5-flash for conversational tasks
      config: {
        systemInstruction: systemInstruction,
      },
    });
    console.log('Gemini mentor chat session re-initialized.');
  }
};

// Error message patterns to look for. "Rpc failed due to xhr error" is a common network error.
// "Requested entity was not found." is the specific one mentioned in the guidelines for API key issues.
const API_KEY_ERROR_PATTERNS = [
  "Rpc failed due to xhr error",
  "Requested entity was not found.",
  // Add other patterns if known, e.g., "invalid API key", "authentication failed"
];

const handleApiErrorAndRetry = async <T>(
  apiCall: () => Promise<T>,
  systemInstruction?: string, // Only needed for chat re-init
  chatType: 'general' | 'mentor' = 'general', // New: to distinguish chat sessions
  retries = 1, // Only one retry after attempting key refresh
): Promise<T> => {
  try {
    return await apiCall();
  } catch (error: any) {
    console.error('Gemini API call failed:', error);
    const errorMessage = typeof error.message === 'string' ? error.message : JSON.stringify(error);
    const isApiKeyIssue = API_KEY_ERROR_PATTERNS.some(pattern => errorMessage.includes(pattern));

    if (isApiKeyIssue && typeof window.aistudio !== 'undefined' && typeof window.aistudio.openSelectKey === 'function' && retries > 0) {
      console.warn('Potential Gemini API key issue detected. Attempting to re-select key and retry...');
      try {
        // This opens a user dialog; assume user will select or confirm key.
        await window.aistudio.openSelectKey();
        // A small delay to allow the external dialog to process, then assume success
        await new Promise(resolve => setTimeout(resolve, 500));

        // Re-initialize client and session after key selection
        if (systemInstruction) {
          _reinitializeChatSession(systemInstruction, chatType);
        } else {
          // For non-chat calls, just ensure the next call gets a new client for subsequent calls
          _currentGeminiClient = null; // Force recreation on next _getNewGeminiClient()
        }

        // Retry the original API call
        return await handleApiErrorAndRetry(apiCall, systemInstruction, chatType, retries - 1);
      } catch (keySelectError) {
        console.error('Failed to open API key selection or key selection was cancelled:', keySelectError);
        throw new Error(`Failed to refresh API key: ${keySelectError instanceof Error ? keySelectError.message : String(keySelectError)}`);
      }
    }
    // If not an API key issue, or no retries left, re-throw the original error
    throw new Error(`AI operation failed: ${errorMessage || 'Unknown error'}`);
  }
};


export const geminiService = {
  initChatSession: (systemInstruction: string) => {
    _reinitializeChatSession(systemInstruction, 'general');
  },

  initGameMentorSession: (systemInstruction: string) => {
    _reinitializeChatSession(systemInstruction, 'mentor');
  },

  sendMessage: async (message: string, systemInstruction: string): Promise<ChatMessage> => {
    const apiCall = async () => {
      // Ensure chat session is initialized, re-initialize if needed after a potential key refresh
      if (!_currentChatSession || (_currentChatSession as any)._apiKey !== _getNewGeminiClient()._apiKey) {
        _reinitializeChatSession(systemInstruction, 'general'); // Use provided system instruction
        if (!_currentChatSession) {
          throw new Error('Chat session could not be initialized after API key refresh attempt.');
        }
      }
      const response = await _currentChatSession.sendMessageStream({ message: message });
      let fullText = '';
      for await (const chunk of response) {
        fullText += chunk.text;
      }
      // Fix: Explicitly cast the object to ChatMessage to resolve type widening issues
      // where TypeScript might incorrectly infer 'role' as a general string instead of a literal 'model'.
      return { role: 'model', content: fullText } as ChatMessage;
    };

    return handleApiErrorAndRetry(apiCall, systemInstruction, 'general');
  },

  // New function for game mentor messages
  sendGameMentorMessage: async (message: string, systemInstruction: string): Promise<ChatMessage> => {
    const apiCall = async () => {
      if (!_currentMentorChatSession || (_currentMentorChatSession as any)._apiKey !== _getNewGeminiClient()._apiKey) {
        _reinitializeChatSession(systemInstruction, 'mentor');
        if (!_currentMentorChatSession) {
          throw new Error('Game mentor chat session could not be initialized after API key refresh attempt.');
        }
      }
      const response = await _currentMentorChatSession.sendMessageStream({ message: message });
      let fullText = '';
      for await (const chunk of response) {
        fullText += chunk.text;
      }
      return { role: 'model', content: fullText } as ChatMessage;
    };

    return handleApiErrorAndRetry(apiCall, systemInstruction, 'mentor');
  },

  recommendSchemes: async (userProfile: UserProfile, location?: LatLng): Promise<SchemeRecommendation[]> => {
    const apiCall = async () => {
      const ai = _getNewGeminiClient(); // Get a fresh client for each call

      const prompt = `Analyze this user's profile data (Age: ${userProfile.age}, Income: ${userProfile.income}, Financial Goal: ${userProfile.financialGoal}) and recommend the top 3 most relevant Indian Government Investment Schemes. Output in a JSON format: [{"Scheme": "PPF", "Reason": "..."}]. Consider the Indian context carefully.`;

      const tools = [];
      const toolConfig: { retrievalConfig?: { latLng: LatLng } } = {};

      if (location) {
        tools.push({ googleMaps: {} });
        toolConfig.retrievalConfig = { latLng: location };
      }
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Using gemini-2.5-pro for complex reasoning and JSON output
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                Scheme: { type: Type.STRING, description: 'The name of the Indian Government Investment Scheme.' },
                Reason: { type: Type.STRING, description: 'The reason why this scheme is recommended for the user, based on their profile.' },
              },
              propertyOrdering: ['Scheme', 'Reason'],
            },
          },
          tools: tools.length > 0 ? tools : undefined,
          toolConfig: Object.keys(toolConfig).length > 0 ? toolConfig : undefined,
        },
      });

      const jsonStr = response.text.trim();
      // Parse the response
      try {
        const recommendations: SchemeRecommendation[] = JSON.parse(jsonStr);
        // Extract grounding URLs if any
        if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
          const groundingUrls = response.candidates[0].groundingMetadata.groundingChunks
            .map(chunk => {
              if (chunk.web?.uri) return chunk.web.uri;
              if (chunk.maps?.uri) return chunk.maps.uri;
              return null;
            })
            .filter(Boolean) as string[];
          console.log('Grounding URLs:', groundingUrls);
          // In a real app, you might want to return these URLs as well
        }
        return recommendations;
      } catch (parseError) {
        console.error('Failed to parse JSON response from Gemini:', jsonStr, parseError);
        throw new Error('AI response was not valid JSON.');
      }
    };

    return handleApiErrorAndRetry(apiCall);
  },
};
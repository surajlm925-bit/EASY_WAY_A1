import { ProcessingResponse } from '../types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export async function processWithGemini(
  prompt: string,
  input: string,
  apiKey: string
): Promise<ProcessingResponse> {
  if (!apiKey.trim()) {
    return {
      success: false,
      error: 'Please provide a valid Gemini API key in the settings.'
    };
  }

  try {
    const fullPrompt = `${prompt}\n\nInput: ${input}`;
    
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: `API Error (${response.status}): ${errorData.error?.message || 'Failed to process request'}`
      };
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      return {
        success: false,
        error: 'No response generated. Please try again with different input.'
      };
    }

    return {
      success: true,
      output: data.candidates[0].content.parts[0].text
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}
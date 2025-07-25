import { Module } from '../types';

import { Module } from '../types';

export const defaultModules: Module[] = [
  {
    id: 1,
    prompt: 'Please summarize the following text into clear, concise bullet points highlighting the main ideas and key information:',
    en: {
      name: 'Text Summarizer',
      description: 'Summarize long text content into key points',
      inputPlaceholder: 'Enter the text you want to summarize...',
    },
    kn: {
      name: 'ಪಠ್ಯ ಸಾರಾಂಶ',
      description: 'ದೀರ್ಘ ಪಠ್ಯ ವಿಷಯವನ್ನು ಪ್ರಮುಖ ಅಂಶಗಳಾಗಿ ಸಾರಾಂಶಗೊಳಿಸಿ',
      inputPlaceholder: 'ನೀವು ಸಾರಾಂಶ ಮಾಡಲು ಬಯಸುವ ಪಠ್ಯವನ್ನು ನಮೂದಿಸಿ...',
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    prompt: 'Write a professional email based on the following requirements. Make it clear, polite, and well-structured:',
    en: {
      name: 'Email Writer',
      description: 'Generate professional emails from brief descriptions',
      inputPlaceholder: 'Describe the email you need (purpose, recipient, tone, key points)...',
    },
    kn: {
      name: 'ಇಮೇಲ್ ರಚನೆಕಾರ',
      description: 'ಸಂಕ್ಷಿಪ್ತ ವಿವರಣೆಗಳಿಂದ ವೃತ್ತಿಪರ ಇಮೇಲ್‌ಗಳನ್ನು ರಚಿಸಿ',
      inputPlaceholder: 'ನಿಮಗೆ ಬೇಕಾದ ಇಮೇಲ್ ಅನ್ನು ವಿವರಿಸಿ (ಉದ್ದೇಶ, ಸ್ವೀಕರಿಸುವವರು, ಧ್ವನಿ, ಪ್ರಮುಖ ಅಂಶಗಳು)...',
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 3,
    prompt: 'Analyze the following image and write a detailed description about it:',
    en: {
        name: 'Image Analysis',
        description: 'Analyze an image and generate a description',
        inputPlaceholder: 'Upload an image for analysis...',
    },
    kn: {
        name: 'ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆ',
        description: 'ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಮತ್ತು ವಿವರಣೆಯನ್ನು ರಚಿಸಿ',
        inputPlaceholder: 'ವಿಶ್ಲೇಷಣೆಗಾಗಿ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ...',
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export function generateModuleId(): number {
  return Date.now();
}

export function downloadAsTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy text: ', error);
    return false;
  }
}
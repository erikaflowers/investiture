/**
 * AI Service
 * Wrapper for AI/LLM operations - provider-agnostic interface
 *
 * To swap providers (OpenAI, Anthropic, local models, etc.),
 * update the internal implementation while keeping the interface stable.
 */

/**
 * @typedef {object} CompletionOptions
 * @property {string} [model] - Model to use
 * @property {number} [maxTokens] - Maximum tokens in response
 * @property {number} [temperature] - Temperature for sampling (0-1)
 * @property {string} [systemPrompt] - System prompt to prepend
 */

/**
 * @typedef {object} CompletionResult
 * @property {string} text - The generated text
 * @property {object} usage - Token usage information
 * @property {number} usage.promptTokens - Tokens in prompt
 * @property {number} usage.completionTokens - Tokens in completion
 * @property {object|null} error - Error if any
 */

/**
 * Generate a completion from the AI model
 * @param {string} prompt - The prompt to send
 * @param {CompletionOptions} [options] - Completion options
 * @returns {Promise<CompletionResult>}
 */
export async function complete(prompt, options = {}) {
  // TODO: Replace with actual AI provider call
  // Example for OpenAI:
  // const response = await openai.chat.completions.create({
  //   model: options.model || 'gpt-4',
  //   messages: [
  //     { role: 'system', content: options.systemPrompt || '' },
  //     { role: 'user', content: prompt }
  //   ],
  //   max_tokens: options.maxTokens,
  //   temperature: options.temperature,
  // });

  console.log('[AI] Complete:', prompt.substring(0, 50) + '...', options);

  // Stub implementation for demo
  return new Promise((resolve) => {
    setTimeout(() => {
      const stubResponse = `This is a stub response to: "${prompt.substring(0, 30)}..."

To enable real AI completions, configure your AI provider in /core/services/ai.js.

Supported providers:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Local models (Ollama, etc.)`;

      resolve({
        text: stubResponse,
        usage: {
          promptTokens: Math.ceil(prompt.length / 4),
          completionTokens: Math.ceil(stubResponse.length / 4),
        },
        error: null,
      });
    }, 300);
  });
}

/**
 * Stream a completion from the AI model
 * @param {string} prompt - The prompt to send
 * @param {CompletionOptions} options - Completion options
 * @param {(chunk: string) => void} onChunk - Callback for each chunk
 * @returns {Promise<CompletionResult>}
 */
export async function stream(prompt, options = {}, onChunk) {
  // TODO: Replace with actual AI provider streaming call
  // Example for OpenAI:
  // const stream = await openai.chat.completions.create({
  //   model: options.model || 'gpt-4',
  //   messages: [...],
  //   stream: true,
  // });
  // for await (const chunk of stream) {
  //   const text = chunk.choices[0]?.delta?.content || '';
  //   if (text) onChunk(text);
  // }

  console.log('[AI] Stream:', prompt.substring(0, 50) + '...', options);

  // Stub implementation for demo - simulates streaming
  return new Promise((resolve) => {
    const words = [
      'This ', 'is ', 'a ', 'streaming ', 'response. ',
      'Each ', 'word ', 'arrives ', 'separately. ',
      'Configure ', 'your ', 'AI ', 'provider ', 'for ', 'real ', 'streaming.'
    ];

    let fullText = '';
    let wordIndex = 0;

    const interval = setInterval(() => {
      if (wordIndex >= words.length) {
        clearInterval(interval);
        resolve({
          text: fullText,
          usage: {
            promptTokens: Math.ceil(prompt.length / 4),
            completionTokens: Math.ceil(fullText.length / 4),
          },
          error: null,
        });
        return;
      }

      const word = words[wordIndex];
      fullText += word;
      onChunk(word);
      wordIndex++;
    }, 100);
  });
}

/**
 * Check if AI service is configured and available
 * @returns {Promise<boolean>}
 */
export async function isAvailable() {
  // TODO: Implement actual availability check
  return true;
}

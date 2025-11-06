import { OpenAIProvider } from './openai.js';
import { DialogflowProvider } from './dialogflow.js';
import { MockProvider } from './mock.js';
import { GeminiProvider } from './gemini.js';
import { config } from '../utils/config.js';

const registry = {
	openai: new OpenAIProvider(),
	dialogflow: new DialogflowProvider(),
	gemini: new GeminiProvider(),
	mock: new MockProvider(),
};

export function getProvider(name) {
	return registry[name] || registry[config.providerDefault] || registry.openai;
}

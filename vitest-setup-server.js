import { vi } from 'vitest';

vi.mock('$env/static/private', () => ({
	DIRECTUS_URL: 'http://127.0.0.1:8055',
	VITE_DIRECTUS_KEY: 'test-token'
}));

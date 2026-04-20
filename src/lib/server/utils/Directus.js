import { VITE_DIRECTUS_KEY, DIRECTUS_URL } from '$env/static/private';
import { createDirectus, rest, staticToken } from '@directus/sdk';

function assertDirectusConfig() {
	if (!DIRECTUS_URL) {
		throw new Error(
			'Missing DIRECTUS_URL. Add DIRECTUS_URL to your .env/.env.local (for example: DIRECTUS_URL="https://your-directus-instance").'
		);
	}

	if (!VITE_DIRECTUS_KEY) {
		throw new Error('Missing VITE_DIRECTUS_KEY. Add VITE_DIRECTUS_KEY to your .env/.env.local.');
	}
}

let directusClient;

export function getDirectusClient() {
	if (!directusClient) {
		assertDirectusConfig();
		directusClient = createDirectus(DIRECTUS_URL).with(staticToken(VITE_DIRECTUS_KEY)).with(rest());
	}

	return directusClient;
}

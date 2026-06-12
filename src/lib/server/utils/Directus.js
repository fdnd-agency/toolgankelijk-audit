import { DIRECTUS_STATIC_TOKEN, DIRECTUS_URL } from '$env/static/private';
import { createDirectus, rest, staticToken } from '@directus/sdk';

function assertDirectusConfig() {
	if (!DIRECTUS_URL) {
		throw new Error(
			'Missing DIRECTUS_URL. Add DIRECTUS_URL to your .env/.env.local (for example: DIRECTUS_URL="https://your-directus-instance").'
		);
	}

	if (!DIRECTUS_STATIC_TOKEN) {
		throw new Error('Missing DIRECTUS_STATIC_TOKEN. Add DIRECTUS_STATIC_TOKEN to your .env/.env.local.');
	}
}

let directusClient;

export function getDirectusClient() {
	if (!directusClient) {
		assertDirectusConfig();
		directusClient = createDirectus(DIRECTUS_URL).with(staticToken(DIRECTUS_STATIC_TOKEN)).with(rest());
	}

	return directusClient;
}

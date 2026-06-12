import { auditService } from '$lib/index.js';
// Endpoint to audit all URLs (used to periodically audit all URLs)
import { SseService } from '$lib/server/services/SSEService.js';
import { json } from '@sveltejs/kit';

/** Validates the request body.
 * @returns {Promise<Response | null>} JSON `400` or `null` */
async function validatePayload(request) {
	const ct = request.headers.get('content-type') ?? '';
	if (!/application\/json/i.test(ct)) return null;
	const raw = await request.text();
	if (!raw.trim()) return null;
	try {
		JSON.parse(raw);
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}
	return null;
}

/** Starts the all-URLs audit stream. */
export async function POST({ request }) {
	console.info('[allUrls] Audit request received');
	try {
		// validation
		const invalidCheck = await validatePayload(request);
		if (invalidCheck) return invalidCheck;

		return SseService.createSseResponse(request, (session) => {
			return (async () => {
				for await (const update of auditService.auditAllUrls()) {
					SseService.push(session, update, update.type ?? 'message');
				}
			})().catch((err) => {
				console.error('Audit failed with error:', err);
				const body = {
					type: 'audit_failed',
					message: 'Er is een fout opgetreden tijdens de audit!'
				};
				SseService.push(session, body, body.type);
			});
		});
	} catch (err) {
		console.error('Error during audit:', err);
		return json(
			{
				error: 'Er is een fout opgetreden tijdens de audit!'
			},
			{ status: 500 }
		);
	}
}

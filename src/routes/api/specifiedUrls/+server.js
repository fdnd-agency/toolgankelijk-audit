import { auditService } from '$lib/index.js';

// Endpoint to audit all URLs of a specific partner
import { SseService } from '$lib/server/services/SSEService.js';
import { json } from '@sveltejs/kit';

/**
 * @typedef {{ urls: { url: string; urlSlug: string }[]; websiteSlug: string }} SpecifiedUrlsBody
 */

/**
 * Validates the request body.
 * @param {unknown} body
 * @returns {Response | null} `400` JSON or `null`
 */
function validatePayload(body) {
	if (body === null || typeof body !== 'object' || Array.isArray(body)) {
		return json({ error: 'Request body must be a JSON object' }, { status: 400 });
	}
	const { urls, websiteSlug } = /** @type {SpecifiedUrlsBody} */ (body);
	if (typeof websiteSlug !== 'string' || !websiteSlug.trim()) {
		return json({ error: 'websiteSlug is required' }, { status: 400 });
	}
	if (!Array.isArray(urls) || urls.length === 0) {
		return json({ error: 'urls must be a non-empty array' }, { status: 400 });
	}
	for (let i = 0; i < urls.length; i++) {
		const urlEntry = urls[i];
		if (
			!urlEntry ||
			typeof urlEntry !== 'object' ||
			typeof urlEntry.url !== 'string' ||
			!urlEntry.url.trim()
		) {
			return json({ error: `urls[${i}] must have a non-empty url string` }, { status: 400 });
		}
		if (typeof urlEntry.urlSlug !== 'string' || !urlEntry.urlSlug.trim()) {
			return json({ error: `urls[${i}] must have a non-empty urlSlug string` }, { status: 400 });
		}
	}
	return null;
}

/** Starts a partner audit stream. */
export async function POST({ request }) {
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	// validation
	const invalidCheck = validatePayload(body);
	if (invalidCheck) return invalidCheck;

	const { urls, websiteSlug } = /** @type {SpecifiedUrlsBody} */ (body);

	try {
		return SseService.createSseResponse(request, (session) => {
			return (async () => {
				for await (const update of auditService.auditSpecifiedPartnerUrls(websiteSlug, urls)) {
					SseService.push(session, update, update.type ?? 'message');
				}
			})().catch((err) => {
				const body = {
					type: 'audit_failed',
					message: 'Er is een fout opgetreden tijdens de audit!',
					details: err instanceof Error ? err.message : String(err)
				};
				SseService.push(session, body, body.type);
			});
		});
	} catch (err) {
		console.error('Error during audit:', err);
		return json(
			{
				error: 'Er is een fout opgetreden tijdens de audit!',
				details: err instanceof Error ? err.message : String(err)
			},
			{ status: 500 }
		);
	}
}

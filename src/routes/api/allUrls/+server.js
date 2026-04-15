import {
	auditService
} from '$lib/index.js';

// Endpoint to audit all URLs (used to periodically audit all URLs)
export async function POST() {
	try {
		const response = await auditService.auditAllUrls();

		if (response.status === 'no_partners_to_audit') {
			return new Response(JSON.stringify({ message: 'Geen partners om te auditen!' }), {
				status: 200
			});
		}

		return new Response(JSON.stringify({ message: 'Periodieke audit succesvol!' }), {
			status: 200
		});
	} catch (err) {
		console.error('Error during audit:', err);
		return new Response(
			JSON.stringify({
				error: 'Er is een fout opgetreden tijdens de periodieke audit!',
				details: err.message
			}),
			{
				status: 500
			}
		);
	}
}

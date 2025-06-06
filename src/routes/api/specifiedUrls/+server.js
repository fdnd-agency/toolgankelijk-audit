import { AuditRepository } from '$lib/server/repositories/AuditRepository.js';
import { AuditService } from '$lib/server/services/AuditService.js';

// Endpoint to audit all URLs of a specific partner
export async function POST({ request }) {
	try {
		const auditRepository = new AuditRepository();
		const auditService = new AuditService(auditRepository);

		const { urls, websiteSlug } = await request.json();
		const result = await auditService.auditSpecifiedPartnerUrls(websiteSlug, urls);

		if (result.status === 'already_being_audited') {
			return new Response(JSON.stringify({ message: `Partner ${websiteSlug} wordt al geaudit!` }), {
				status: 409
			});
		}

		return new Response(JSON.stringify({ message: `Audit succesvol voor ${websiteSlug}!` }), {
			status: 200
		});
	} catch (err) {
		console.error('Error during audit:', err);
		return new Response(
			JSON.stringify({
				error: 'Er is een fout opgetreden tijdens de audit!',
				details: err.message
			}),
			{
				status: 500
			}
		);
	}
}

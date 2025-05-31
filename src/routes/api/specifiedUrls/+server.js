import { AuditRepository, AuditService } from '$lib/index.js';

// Endpoint to audit all URLs of a specific partner
export async function POST({ request }) {
	try {
		const auditRepository = new AuditRepository();
		const auditService = new AuditService(auditRepository);

		const { urls, websiteSlug } = await request.json();
		const result = await auditService.auditPartnerUrls(websiteSlug, urls);

		if (result.status === 'already_being_audited') {
			return new Response(JSON.stringify({ message: `Partner ${websiteSlug} wordt al geaudit!` }), {
				status: 409
			});
		}

		return new Response(JSON.stringify({ message: `Audit succesvol voor ${websiteSlug}!` }), {
			status: 200
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
}

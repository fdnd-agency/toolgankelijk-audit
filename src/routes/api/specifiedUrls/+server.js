import { AuditRepository, AuditService } from '$lib/index.js';

// Endpoint to audit all URLs of a specific partner
export async function POST({ request }) {
	try {
		// Dependency injection for AuditRepository and AuditService
		const auditRepository = new AuditRepository();
		const auditService = new AuditService(auditRepository);

		const { urls, slug } = await request.json();
		const urlList = urls.map((u) => u.url);

		// Start the audit process for the specified partner
		const result = await auditService.auditPartnerUrls(slug, urlList);

		// Return error response if the partner is already being audited
		if (result.status === 'already_being_audited') {
			return new Response(JSON.stringify({ message: `Partner ${slug} wordt al geaudit!` }), {
				status: 409
			});
		}

		// Return success response if audit is successful
		return new Response(JSON.stringify({ message: `Audit succesvol voor ${slug}!` }), {
			status: 200
		});
	} catch (error) {
		// Return error response if an error occurs
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
}

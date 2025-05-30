import { AuditRepository, AuditService, ActiveAudits, runAuditForUrls } from '$lib/index.js';

// Endpoint to audit all URLs of a specific partner
export async function POST({ request }) {
	try {
		// Dependency injection for AuditRepository and AuditService
		const auditRepository = new AuditRepository();
		const auditService = new AuditService(auditRepository);

		const { urls, slug } = await request.json();
		const urlList = urls.map((u) => u.url);

		// Check if partner with this slug is already being audited
		if (auditService.isPartnerBeingAudited(slug)) {
			return new Response(JSON.stringify({ message: `Partner ${slug} wordt al geaudit!` }), {
				status: 409
			});
		} else {
			// Add partner to the activeAuditList
			auditService.addPartnerToActiveAuditList(slug, urlList);
		}

		// Audit the URLs for the specified partner
		const auditResults = await runAuditForUrls(urlList);
		ActiveAudits.removePartnerBySlug(slug);

		// Return success response if audit is successful
		return new Response(JSON.stringify({ message: `Audit succesvol voor ${slug}!` }), {
			status: 200
		});
	} catch (error) {
		// Return error response if an error occurs
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
}

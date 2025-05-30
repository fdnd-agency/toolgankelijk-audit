import { AuditRepository, AuditService, AuditQueue, runAuditForUrls } from '$lib/index.js';

// Endpoint to audit all URLs of a specific partner
export async function POST({ request }) {
	try {
		// Dependency injection for AuditRepository and AuditService
		const auditRepository = new AuditRepository();
		const auditService = new AuditService(auditRepository);

		const { urls, slug } = await request.json();
		const urlList = urls.map((u) => u.url);

		// Check if partner with this slug is already in the queue
		if (auditService.isPartnerInQueue(slug)) {
			return new Response(JSON.stringify({ message: `Partner ${slug} is al in de wachtrij!` }), {
				status: 409
			});
		}

		// Add partner to the audit queue if not already present
		auditService.addPartnerToQueue(slug, urlList);

		// Audit the partner that was added
		const auditResults = await runAuditForUrls(urlList);
		AuditQueue.removePartnerBySlug(slug);

		// Return success response if audit is successful
		return new Response(JSON.stringify({ message: `Audit succesvol voor ${slug}!` }), {
			status: 200
		});
	} catch (error) {
		// Return error response if an error occurs
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
}

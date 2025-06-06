import { AuditRepository } from '$lib/server/repositories/AuditRepository.js';
import { AuditService } from '$lib/server/services/AuditService.js';

// Endpoint to audit all URLs (used to periodically audit all URLs)
export async function POST() {
	try {
		const auditRepository = new AuditRepository();
		const auditService = new AuditService(auditRepository);

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

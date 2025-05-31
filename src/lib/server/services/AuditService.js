import { AuditRepository, ActiveAudits, Partner, runAuditForUrls } from '$lib/index.js';

// AuditService - Service class to handle business logic for auditing partners
export class AuditService {
	constructor(auditRepository) {
		this.auditRepository = auditRepository;
	}

	isPartnerBeingAudited(slug) {
		const activeAuditList = ActiveAudits.getActiveAuditList();
		return activeAuditList.some((partner) => partner.slug === slug);
	}

	addPartnerToActiveAuditList(slug, urlList) {
		const partner = new Partner(slug, urlList);
		ActiveAudits.addPartner(partner);
	}

	async saveAuditResults(auditResults) {
		return true;
	}

	async auditPartnerUrls(slug, urlList) {
		// Check if the partner is already being audited
		if (this.isPartnerBeingAudited(slug)) {
			return { status: 'already_being_audited' };
		} else {
			// Add the partner to the activeAuditList if not already being audited
			this.addPartnerToActiveAuditList(slug, urlList);
		}

		try {
			// Run the audit for the provided URLs
			const auditResults = await runAuditForUrls(urlList);
			// Save the audit results to the database (Hygraph)
			return await this.saveAuditResults(auditResults);
		} finally {
			// Remove the partner from the activeAuditList after the audit is complete or if an error occurs
			ActiveAudits.removePartnerBySlug(slug);
		}
	}
}

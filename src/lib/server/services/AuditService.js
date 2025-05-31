import { AuditRepository, ActiveAudits, Partner, runAuditForUrl } from '$lib/index.js';

// AuditService - Service class to handle business logic for auditing partners
export class AuditService {
	constructor(auditRepository) {
		this.auditRepository = auditRepository;
	}

	isPartnerBeingAudited(websiteSlug) {
		const activeAuditList = ActiveAudits.getActiveAuditList();
		return activeAuditList.some((partner) => partner.websiteSlug === websiteSlug);
	}

	addPartnerToActiveAuditList(partner) {
		ActiveAudits.addPartner(partner);
	}

	async saveAuditResults(auditResults) {
		return true;
	}

	async auditPartnerUrls(websiteSlug, urls) {
		const partner = new Partner(websiteSlug, urls);

		if (this.isPartnerBeingAudited(partner.websiteSlug)) {
			return { status: 'already_being_audited' };
		} else {
			this.addPartnerToActiveAuditList(partner);
		}

		try {
			const urlsToAudit = partner.urls.map((url) => url.url);

			for (const url of urlsToAudit) {
				const auditResult = await runAuditForUrl(url);
				await this.saveAuditResults(auditResult);
			}

			return { status: 'success' };
		} finally {
			ActiveAudits.removePartnerBySlug(partner.websiteSlug);
		}
	}
}

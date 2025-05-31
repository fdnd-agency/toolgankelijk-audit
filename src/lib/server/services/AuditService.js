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

	async saveAuditResults(auditResult, url, urlSlug, websiteSlug) {
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
			for (const urlObj of partner.urls) {
				const auditResult = await runAuditForUrl(urlObj.url);
				await this.saveAuditResults({
					auditResult,
					url: urlObj.url,
					urlSlug: urlObj.urlSlug,
					websiteSlug: partner.websiteSlug
				});
			}

			return { status: 'success' };
		} finally {
			ActiveAudits.removePartnerBySlug(partner.websiteSlug);
		}
	}
}

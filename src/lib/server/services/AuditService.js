import { AuditRepository, ActiveAudits, Partner } from '$lib/index.js';

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
}

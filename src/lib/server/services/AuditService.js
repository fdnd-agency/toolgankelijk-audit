import { AuditRepository, AuditQueue, Partner } from '$lib/index.js';

// AuditService - Service class to handle business logic for auditing partners
export class AuditService {
	constructor(auditRepository) {
		this.auditRepository = auditRepository;
	}

	isPartnerInQueue(slug) {
		const queue = AuditQueue.getQueue();
		return queue.some((partner) => partner.slug === slug);
	}

	addPartnerToQueue(slug, urlList) {
		const partner = new Partner(slug, urlList);
		AuditQueue.addPartner(partner);
	}
}

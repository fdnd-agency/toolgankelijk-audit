// AuditQueue - Singleton class to manage the audit queue for partners
class AuditQueue {
	constructor() {
		if (!AuditQueue.instance) {
			this.queue = [];
			AuditQueue.instance = this;
		}
		return AuditQueue.instance;
	}

	addPartner(partner) {
		this.queue.push(partner);
	}

	removePartnerBySlug(slug) {
		this.queue = this.queue.filter((partner) => partner.slug !== slug);
	}

	getQueue() {
		return this.queue;
	}
}

const auditQueue = new AuditQueue();
export default auditQueue;

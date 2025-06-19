// ActiveAudits - Singleton class to track which partners are currently being audited
class ActiveAudits {
	static #instance;
	activeAuditList = [];

	constructor() {
		if (ActiveAudits.#instance) {
			throw new Error('Use ActiveAudits.getInstance() instead of new!');
		}
	}

	static getInstance() {
		if (!ActiveAudits.#instance) {
			ActiveAudits.#instance = new ActiveAudits();
		}
		return ActiveAudits.#instance;
	}

	addPartner(partner) {
		this.activeAuditList.push(partner);
	}

	removePartnerBySlug(websiteSlug) {
		this.activeAuditList = this.activeAuditList.filter(
			(partner) => partner.websiteSlug !== websiteSlug
		);
	}

	getActiveAuditList() {
		return this.activeAuditList;
	}
}

export default ActiveAudits;

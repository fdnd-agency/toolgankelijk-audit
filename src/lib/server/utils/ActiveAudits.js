// ActiveAudits - Singleton class to track which partners are currently being audited
class ActiveAudits {
	constructor() {
		if (!ActiveAudits.instance) {
			this.activeAuditList = [];
			ActiveAudits.instance = this;
		}
		return ActiveAudits.instance;
	}

	addPartner(partner) {
		this.activeAuditList.push(partner);
	}

	removePartnerBySlug(slug) {
		this.activeAuditList = this.activeAuditList.filter((partner) => partner.slug !== slug);
	}

	getActiveAuditList() {
		return this.activeAuditList;
	}
}

const activeAudits = new ActiveAudits();
export default activeAudits;

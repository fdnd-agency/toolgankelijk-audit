import { ActiveAudits, Partner, runAuditForUrl } from '$lib/index.js';

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

	async saveAuditResult({ auditResult, url, urlSlug, websiteSlug }) {
		const results = auditResult[url];
		if (!results) return false;

		let anySaved = false;

		for (const category of Object.keys(results)) {
			for (const test of results[category]) {
				// Store the test result and get the created test id
				const testId = await this.auditRepository.storeTestResult(
					urlSlug,
					category,
					test.id,
					test.tags,
					test.description,
					test.help,
					test.helpUrl
				);

				if (testId) {
					anySaved = true;
				}

				// Only store nodes for 'violations' and 'incomplete' since the nodes of passes and inapplicable tests are not relevant
				if (
					(category === 'violations' || category === 'incomplete') &&
					test.nodes &&
					test.nodes.length > 0
				) {
					for (const node of test.nodes) {
						const nodeId = await this.auditRepository.storeTestNode(
							node.html,
							node.target,
							node.failureSummary,
							testId
						);
						if (nodeId) {
							anySaved = true;
						}
					}
				}
			}
		}
		return anySaved;
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
				await this.saveAuditResult({
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

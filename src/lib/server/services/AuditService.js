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

	async saveAuditResult({ auditResult, urlSlug }) {
		const results = auditResult;
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

	successCriteriaStatus(auditResult) {
		const successCriteria = {};

		for (const category in auditResult) {
			const tests = auditResult[category];

			for (const test of tests) {
				for (const tag of test.tags) {
					if (!successCriteria[tag]) {
						successCriteria[tag] = { passed: true, index: tag };
					}
					if (category !== 'passes') {
						successCriteria[tag].passed = false;
					}
				}
			}
		}
		return successCriteria;
	}

	async saveCheck(url, urlSlug, websiteSlug, auditResult) {
		const successCriteria = this.successCriteriaStatus(auditResult);

		for (const criterium of Object.values(successCriteria)) {
			try {
				await this.auditRepository.saveCheck(url, urlSlug, websiteSlug, criterium);
			} catch (error) {
				console.error('Failed to store check:', error);
			}
		}
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
					urlSlug: urlObj.urlSlug
				});
				const filteredAuditResult = Object.fromEntries(
					Object.entries(auditResult).filter(([category]) => category !== 'inapplicable')
				);
				await this.saveCheck(urlObj.url, urlObj.urlSlug, partner.websiteSlug, filteredAuditResult);
			}

			return { status: 'success' };
		} finally {
			ActiveAudits.removePartnerBySlug(partner.websiteSlug);
		}
	}
}

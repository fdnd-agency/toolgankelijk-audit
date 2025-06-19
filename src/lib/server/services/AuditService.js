import { ActiveAudits, Partner, runAuditForUrl, TestResult, TestNode } from '$lib/index.js';

// AuditService - Service class to handle business logic for auditing partners
export class AuditService {
	activeAudits;

	constructor(auditRepository) {
		this.auditRepository = auditRepository;
		this.activeAudits = ActiveAudits.getInstance();
	}

	async auditAllUrls() {
		const allPartnersWithTheirUrls = await this.auditRepository.getAllUrlsOfEveryPartner();

		if (!allPartnersWithTheirUrls || allPartnersWithTheirUrls.length === 0) {
			return { status: 'no_partners_to_audit' };
		}

		// Filter out partners that are already being audited
		const partnersToAudit = allPartnersWithTheirUrls
			.map((partnerData) => new Partner(partnerData.websiteSlug, partnerData.urls))
			.filter((partner) => {
				if (this.isPartnerBeingAudited(partner.websiteSlug)) {
					console.log(
						`Partner ${partner.websiteSlug} will be skipped for the periodic audit, as it is already being audited.`
					);
					return false;
				}
				return true;
			});

		// Add all partners that were not already being audited to the active audit list
		partnersToAudit.forEach((partner) => this.addPartnerToActiveAuditList(partner));

		for (const partner of partnersToAudit) {
			try {
				for (const urlObj of partner.urls) {
					const auditResult = await runAuditForUrl(urlObj.url);
					await this.saveAuditResult(auditResult, urlObj.urlSlug);
					const auditResultWithoutInapplicable = Object.fromEntries(
						Object.entries(auditResult).filter(([category]) => category !== 'inapplicable')
					);
					await this.saveCheck(
						urlObj.url,
						urlObj.urlSlug,
						partner.websiteSlug,
						auditResultWithoutInapplicable
					);
				}
			} finally {
				this.activeAudits.removePartnerBySlug(partner.websiteSlug);
			}
		}

		return { status: 'success' };
	}

	async auditSpecifiedPartnerUrls(websiteSlug, urls) {
		const partner = new Partner(websiteSlug, urls);

		if (this.isPartnerBeingAudited(partner.websiteSlug)) {
			return { status: 'already_being_audited' };
		} else {
			this.addPartnerToActiveAuditList(partner);
		}

		try {
			for (const urlObj of partner.urls) {
				const auditResult = await runAuditForUrl(urlObj.url);
				await this.saveAuditResult(auditResult, urlObj.urlSlug);
				const auditResultWithoutInapplicable = Object.fromEntries(
					Object.entries(auditResult).filter(([category]) => category !== 'inapplicable')
				);
				await this.saveCheck(
					urlObj.url,
					urlObj.urlSlug,
					partner.websiteSlug,
					auditResultWithoutInapplicable
				);
			}
		} finally {
			this.activeAudits.removePartnerBySlug(partner.websiteSlug);
		}

		return { status: 'success' };
	}

	isPartnerBeingAudited(websiteSlug) {
		const activeAuditList = this.activeAudits.getActiveAuditList();
		return activeAuditList.some((partner) => partner.websiteSlug === websiteSlug);
	}

	addPartnerToActiveAuditList(partner) {
		this.activeAudits.addPartner(partner);
	}

	async saveAuditResult(auditResult, urlSlug) {
		if (!auditResult) return false;

		let anySaved = false;

		for (const category of Object.keys(auditResult)) {
			for (const test of auditResult[category]) {
				// Store the test result and get the created test id
				const testId = await this.auditRepository.storeTestResult(
					new TestResult(
						urlSlug,
						category,
						test.id,
						test.tags,
						test.description,
						test.help,
						test.helpUrl
					)
				);

				if (testId) anySaved = true;

				// Only store nodes for 'violations' and 'incomplete' since the nodes of passes and inapplicable tests are not relevant
				if (
					(category === 'violations' || category === 'incomplete') &&
					test.nodes &&
					test.nodes.length > 0
				) {
					for (const node of test.nodes) {
						await this.auditRepository.storeTestNode(
							new TestNode(node.html, node.target.flat(), node.failureSummary, testId)
						);
					}
				}
			}
		}
		return anySaved;
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
}

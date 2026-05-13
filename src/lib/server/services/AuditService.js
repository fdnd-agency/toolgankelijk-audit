import ActiveAudits from '$lib/server/utils/ActiveAudits.js';
import { Partner } from '$lib/server/models/Partner.js';
import { runAuditForUrl } from '$lib/server/utils/AuditRunner.js';
import { TestResult } from '$lib/server/models/TestResult.js';
import { TestNode } from '$lib/server/models/TestNode.js';

// AuditService - Service class to handle business logic for auditing partners
/**
 * @typedef {import('../models/Partner.js').Partner} PartnerModel
 * @typedef {{ current: number; total: number }} UrlProgressCounters
 */

/** Yields audit progress events. */
export class AuditService {
	constructor(
		{
			websiteRepository,
			urlRepository,
			checkRepository,
			successCriteriaRepository,
			checkCriteriaLinkRepository,
			testResultRepository,
			testNodeRepository
		},
		{ activeAudits = ActiveAudits.getInstance(), runAuditForUrlFn = runAuditForUrl } = {}
	) {
		this.websiteRepository = websiteRepository;
		this.urlRepository = urlRepository;
		this.checkRepository = checkRepository;
		this.successCriteriaRepository = successCriteriaRepository;
		this.checkCriteriaLinkRepository = checkCriteriaLinkRepository;
		this.testResultRepository = testResultRepository;
		this.testNodeRepository = testNodeRepository;

		this.activeAudits = activeAudits;
		this.runAuditForUrl = runAuditForUrlFn;
	}

	/** Summarizes an axe result for progress events. */
	#auditResultSummary(auditResult) {
		const violationCount = Array.isArray(auditResult?.violations)
			? auditResult.violations.length
			: 0;
		return {
			violationCount,
			hasViolations: violationCount > 0
		};
	}

	/**
	 * Audits one partner and yields progress.
	 * @param {PartnerModel} partner
	 * @param {UrlProgressCounters} counters
	 */
	async *#partnerAuditEvents(partner, counters) {
		try {
			for (const urlObj of partner.urls) {
				const auditResult = await this.runAuditForUrl(urlObj.url);
				await this.saveAuditResult(auditResult, urlObj.urlSlug);
				const auditResultWithoutInapplicable = Object.fromEntries(
					Object.entries(auditResult).filter(([category]) => category !== 'inapplicable')
				);
				await this.saveCheck(urlObj.urlSlug, auditResultWithoutInapplicable);
				counters.current += 1;
				const { violationCount, hasViolations } = this.#auditResultSummary(auditResult);
				yield {
					type: 'url_processed',
					url: urlObj.url,
					websiteSlug: partner.websiteSlug,
					urlSlug: urlObj.urlSlug,
					hasViolations,
					violationCount,
					current: counters.current,
					total: counters.total
				};
			}
		} finally {
			this.activeAudits.removePartnerBySlug(partner.websiteSlug);
		}
	}

	/** Audits all partners and yields progress. */
	async *auditAllUrls() {
		const allPartnersWithTheirUrls = await this.websiteRepository.getAllUrlsOfEveryPartner();
		if (!allPartnersWithTheirUrls || allPartnersWithTheirUrls.length === 0) {
			yield { type: 'audit_started', totalUrls: 0, partnerCount: 0 };
			yield {
				type: 'audit_completed',
				outcome: 'no_partners',
				message: 'Geen partners om te auditen!'
			};
			return;
		}

		// Skip partners without URLs.
		const partnersWithUrls = allPartnersWithTheirUrls
			.map((partnerData) => new Partner(partnerData.websiteSlug, partnerData.urls))
			.filter((partner) => partner.urls.length > 0);

		if (partnersWithUrls.length === 0) {
			yield { type: 'audit_started', totalUrls: 0, partnerCount: 0 };
			yield {
				type: 'audit_completed',
				outcome: 'no_urls',
				message: 'Geen URLs om te auditen!'
			};
			return;
		}

		const partnersToAudit = partnersWithUrls.filter((partner) => {
			if (this.isPartnerBeingAudited(partner.websiteSlug)) {
				console.log(
					`Partner ${partner.websiteSlug} will be skipped for the periodic audit, as it is already being audited.`
				);
				return false;
			}
			return true;
		});

		const totalUrls = partnersToAudit.reduce((total, partner) => total + partner.urls.length, 0);

		if (partnersToAudit.length === 0) {
			yield { type: 'audit_started', totalUrls: 0, partnerCount: 0 };
			yield {
				type: 'audit_completed',
				outcome: 'all_skipped_busy',
				message: 'Alle partners worden al geaudit.'
			};
			return;
		}

		partnersToAudit.forEach((partner) => this.addPartnerToActiveAuditList(partner));
		const counters = { current: 0, total: totalUrls };

		try {
			yield {
				type: 'audit_started',
				totalUrls,
				partnerCount: partnersToAudit.length
			};

			for (const partner of partnersToAudit) {
				yield* this.#partnerAuditEvents(partner, counters);
			}

			yield { type: 'audit_completed', ok: true };
		} finally {
			for (const partner of partnersToAudit) {
				this.activeAudits.removePartnerBySlug(partner.websiteSlug);
			}
		}
	}

	/** Audits one partner, or fails if it is already active. */
	async *auditSpecifiedPartnerUrls(websiteSlug, urls) {
		const partner = new Partner(websiteSlug, urls);

		if (this.isPartnerBeingAudited(partner.websiteSlug)) {
			yield {
				type: 'audit_failed',
				reason: 'already_being_audited',
				websiteSlug: partner.websiteSlug,
				message: `Partner ${partner.websiteSlug} wordt al geaudit!`
			};
			return;
		}

		this.addPartnerToActiveAuditList(partner);
		const counters = { current: 0, total: partner.urls.length };

		try {
			yield {
				type: 'audit_started',
				totalUrls: partner.urls.length,
				partnerCount: 1
			};
			yield* this.#partnerAuditEvents(partner, counters);
			yield { type: 'audit_completed', ok: true };
		} finally {
			this.activeAudits.removePartnerBySlug(partner.websiteSlug);
		}
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
				const testResult = new TestResult(
					urlSlug,
					category,
					test.id,
					test.tags,
					test.description,
					test.help,
					test.helpUrl
				);
				const urlId = await this.urlRepository.getUrlIdBySlug(testResult.urlSlug);
				const testId = await this.testResultRepository.storeTestResult(testResult, urlId);

				if (testId) anySaved = true;

				// Only store nodes for 'violations' and 'incomplete' since the nodes of passes and inapplicable tests are not relevant
				if (
					(category === 'violations' || category === 'incomplete') &&
					test.nodes &&
					test.nodes.length > 0
				) {
					for (const node of test.nodes) {
						await this.testNodeRepository.storeTestNode(
							new TestNode(node.html, node.target.flat(), node.failureSummary, testId)
						);
					}
				}
			}
		}
		return anySaved;
	}

	async saveCheck(urlSlug, auditResult) {
		const successCriteria = this.successCriteriaStatus(auditResult);

		for (const criterium of Object.values(successCriteria)) {
			try {
				const successCriteriumId =
					await this.successCriteriaRepository.getSuccessCriteriumIdByIndex(criterium.index);
				const urlId = await this.urlRepository.getUrlIdBySlug(urlSlug);
				let checkId;
				try {
					checkId = await this.checkRepository.getCheckIdByUrlId(urlId);
				} catch (error) {
					const checkNotFoundError =
						error instanceof Error && error.message.includes('Expected check id for url id');
					if (!checkNotFoundError) {
						throw error;
					}

					if (!criterium.passed) {
						console.log(
							"Success criterium didn't pass and wasn't already stored:",
							successCriteriumId
						);
						continue;
					}

					checkId = await this.checkRepository.createForUrl(urlId);
				}

				if (criterium.passed) {
					try {
						await this.checkCriteriaLinkRepository.getLink(checkId, successCriteriumId);
						console.log('Success criterium passed and was already stored:', successCriteriumId);
					} catch (error) {
						const linkNotFoundError =
							error instanceof Error && error.message.includes('Expected check-criterion link');
						if (!linkNotFoundError) {
							throw error;
						}

						await this.checkCriteriaLinkRepository.createLink(checkId, successCriteriumId);
						console.log('Success criterium passed and has been stored:', successCriteriumId);
					}
				} else {
					try {
						const existingLink = await this.checkCriteriaLinkRepository.getLink(
							checkId,
							successCriteriumId
						);
						await this.checkCriteriaLinkRepository.deleteLinkById(existingLink.id);
						console.log("Success criterium didn't pass and has been deleted:", successCriteriumId);
					} catch (error) {
						const linkNotFoundError =
							error instanceof Error && error.message.includes('Expected check-criterion link');
						if (linkNotFoundError) {
							console.log(
								"Success criterium didn't pass and wasn't already stored:",
								successCriteriumId
							);
							continue;
						}
						throw error;
					}
				}
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

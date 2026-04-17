import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditService } from './AuditService.js';

describe('AuditService.successCriteriaStatus', () => {
	const service = new AuditService({
		websiteRepository: {},
		urlRepository: {},
		checkRepository: {},
		successCriteriaRepository: {},
		checkCriteriaLinkRepository: {},
		testResultRepository: {},
		testNodeRepository: {}
	});

	it('maps WCAG tag strings to index and marks passed when only present under passes', () => {
		const auditResult = {
			passes: [{ tags: ['1.1.1', '2.4.2'] }],
			violations: [],
			incomplete: []
		};
		const successCriteriaStatus = service.successCriteriaStatus(auditResult);
		expect(successCriteriaStatus['1.1.1']).toEqual({ passed: true, index: '1.1.1' });
		expect(successCriteriaStatus['2.4.2']).toEqual({ passed: true, index: '2.4.2' });
	});

	it('marks failed when the same tag appears under violations or incomplete', () => {
		const auditResult = {
			passes: [{ tags: ['1.1.1'] }],
			violations: [{ tags: ['1.1.1'] }],
			incomplete: [{ tags: ['2.4.2'] }]
		};
		const successCriteriaStatus = service.successCriteriaStatus(auditResult);
		expect(successCriteriaStatus['1.1.1']).toEqual({ passed: false, index: '1.1.1' });
		expect(successCriteriaStatus['2.4.2']).toEqual({ passed: false, index: '2.4.2' });
	});

	it('marks failed when the tag only appears under non-passes categories', () => {
		const auditResult = {
			violations: [{ tags: ['3.3.1'] }]
		};
		const successCriteriaStatus = service.successCriteriaStatus(auditResult);
		expect(successCriteriaStatus['3.3.1']).toEqual({ passed: false, index: '3.3.1' });
	});
});

describe('AuditService public return shapes', () => {
	let repositories;
	let runAuditForUrlMock;
	let activeAudits;
	const emptyAudit = {
		passes: [],
		violations: [],
		incomplete: [],
		inapplicable: []
	};
	beforeEach(() => {
		repositories = {
			websiteRepository: { getAllUrlsOfEveryPartner: vi.fn() },
			urlRepository: { getUrlIdBySlug: vi.fn() },
			checkRepository: { getCheckIdByUrlId: vi.fn(), createForUrl: vi.fn() },
			successCriteriaRepository: { getSuccessCriteriumIdByIndex: vi.fn() },
			checkCriteriaLinkRepository: {
				getLink: vi.fn(),
				createLink: vi.fn(),
				deleteLinkById: vi.fn()
			},
			testResultRepository: { storeTestResult: vi.fn() },
			testNodeRepository: { storeTestNode: vi.fn() }
		};
		runAuditForUrlMock = vi.fn().mockResolvedValue(emptyAudit);
		activeAudits = {
			getActiveAuditList: vi.fn().mockReturnValue([]),
			addPartner: vi.fn(),
			removePartnerBySlug: vi.fn()
		};
	});

	it('auditAllUrls returns { status: no_partners_to_audit } when repository has no partners', async () => {
		repositories.websiteRepository.getAllUrlsOfEveryPartner.mockResolvedValue([]);
		expect(runAuditForUrlMock).not.toHaveBeenCalled();
		const service = new AuditService(repositories, {
			activeAudits,
			runAuditForUrlFn: runAuditForUrlMock
		});

		await expect(service.auditAllUrls()).resolves.toEqual({
			status: 'no_partners_to_audit'
		});
	});

	it('auditAllUrls returns { status: success } when partners exist', async () => {
		repositories.websiteRepository.getAllUrlsOfEveryPartner.mockResolvedValue([
			{
				websiteSlug: 'example',
				urls: [{ url: 'https://example.com/', urlSlug: 'home' }]
			}
		]);
		repositories.testResultRepository.storeTestResult.mockResolvedValue(null);
		repositories.testNodeRepository.storeTestNode.mockResolvedValue(null);
		const service = new AuditService(repositories, {
			activeAudits,
			runAuditForUrlFn: runAuditForUrlMock
		});
		await expect(service.auditAllUrls()).resolves.toEqual({ status: 'success' });
		expect(runAuditForUrlMock).toHaveBeenCalled();
	});

	it('auditSpecifiedPartnerUrls returns { status: already_being_audited } when partner is active', async () => {
		activeAudits.getActiveAuditList.mockReturnValue([{ websiteSlug: 'busy' }]);
		const service = new AuditService(repositories, {
			activeAudits,
			runAuditForUrlFn: runAuditForUrlMock
		});
		await expect(
			service.auditSpecifiedPartnerUrls('busy', [{ url: 'https://a.com', urlSlug: 'a' }])
		).resolves.toEqual({ status: 'already_being_audited' });
	});

	it('auditSpecifiedPartnerUrls returns { status: success } when not busy', async () => {
		repositories.testResultRepository.storeTestResult.mockResolvedValue(null);
		repositories.testNodeRepository.storeTestNode.mockResolvedValue(null);
		const service = new AuditService(repositories, {
			activeAudits,
			runAuditForUrlFn: runAuditForUrlMock
		});
		await expect(
			service.auditSpecifiedPartnerUrls('partner', [{ url: 'https://a.com', urlSlug: 'a' }])
		).resolves.toEqual({ status: 'success' });
	});
});

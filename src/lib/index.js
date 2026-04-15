// place files you want to import through the `$lib` alias in this folder.
import { getDirectusClient } from './server/utils/Directus.js';
import { UrlRepository } from './server/repositories/UrlRepository.js';
import { CheckRepository } from './server/repositories/CheckRepository.js';
import { SuccessCriteriaRepository } from './server/repositories/SuccessCriteriaRepository.js';
import { CheckCriteriaLinkRepository } from './server/repositories/CheckCriteriaLinkRepository.js';
import { WebsiteRepository } from './server/repositories/WebsiteRepository.js';
import { TestResultRepository } from './server/repositories/TestResultRepository.js';
import { TestNodeRepository } from './server/repositories/TestNodeRepository.js';
import { AuditService } from './server/services/AuditService.js';

export { default as ActiveAudits } from './server/utils/ActiveAudits.js';
export { getDirectusClient };
export { Partner } from './server/models/Partner.js';
export { TestResult } from './server/models/TestResult.js';
export { TestNode } from './server/models/TestNode.js';
export { runAuditForUrl } from './server/utils/AuditRunner.js';
export { requestWithRetry } from './server/utils/RequestRetry.js';

const client = getDirectusClient();
const repositoryDependencies = { client };
// Initialize repositories
export const urlRepository = new UrlRepository(repositoryDependencies);
export const checkRepository = new CheckRepository(repositoryDependencies);
export const successCriteriaRepository = new SuccessCriteriaRepository(repositoryDependencies);
export const checkCriteriaLinkRepository = new CheckCriteriaLinkRepository(repositoryDependencies);
export const websiteRepository = new WebsiteRepository(repositoryDependencies);
export const testResultRepository = new TestResultRepository(repositoryDependencies);
export const testNodeRepository = new TestNodeRepository(repositoryDependencies);
// Initialize audit service
export const auditService = new AuditService({
	websiteRepository,
	urlRepository,
	checkRepository,
	successCriteriaRepository,
	checkCriteriaLinkRepository,
	testResultRepository,
	testNodeRepository
});
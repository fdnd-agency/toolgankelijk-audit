import { BaseRepository } from './BaseRepository.js';

export class TestResultRepository extends BaseRepository {
	static COLLECTION = 'toolgankelijk_test';

	async storeTestResult(testResult, urlId) {
		const createdTest = await this.create(TestResultRepository.COLLECTION, {
			url_id: urlId,
			category: testResult.category,
			test_id: testResult.testId,
			tags: testResult.tags,
			description: testResult.description,
			help: testResult.help,
			help_url: testResult.helpUrl
		});
		const testId = createdTest?.id;

		if (!testId) {
			throw new Error(
				`Expected created test id for testId "${testResult.testId}" and urlSlug "${testResult.urlSlug}", but none was returned.`
			);
		}

		return testId;
	}
}

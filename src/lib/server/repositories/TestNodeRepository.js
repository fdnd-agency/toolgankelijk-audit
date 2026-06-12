import { BaseRepository } from './BaseRepository.js';

export class TestNodeRepository extends BaseRepository {
	static COLLECTION = 'toolgankelijk_test_node';

	async storeTestNode(testNode) {
		let failureSummary = String(testNode.failureSummary ?? '');
		if (failureSummary.length > 1000) {
			failureSummary = failureSummary.slice(0, 997) + '...';
		}

		// Truncate html to 255 characters to match Directus max_length
		let html = String(testNode.html ?? '');
		if (html.length > 255) {
			html = html.slice(0, 252) + '...';
		}
		const createdNode = await this.create(TestNodeRepository.COLLECTION, {
			test_id: testNode.testId,
			html: html,
			target: testNode.target,
			failure_summary: failureSummary
		});
		const nodeId = createdNode?.id;

		if (!nodeId) {
			throw new Error(
				`Expected created node id for test ID "${testNode.testId}" and target "${testNode.target}", but none was returned.`
			);
		}

		return nodeId;
	}
}

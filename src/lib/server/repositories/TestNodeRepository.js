import { BaseRepository } from './BaseRepository.js';

export class TestNodeRepository extends BaseRepository {
	static COLLECTION = 'toolgankelijk_test_node';

	async storeTestNode(testNode) {
		const failureSummary = String(testNode.failureSummary ?? '');
		console.debug('Debug test node payload:', {
			testId: testNode.testId,
			target: testNode.target,
			failureSummaryLength: failureSummary.length,
			failureSummaryPreview: failureSummary.slice(0, 200)
		});

		const createdNode = await this.create(TestNodeRepository.COLLECTION, {
			test_id: testNode.testId,
			html: testNode.html,
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

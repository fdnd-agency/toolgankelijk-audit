import { BaseRepository } from './BaseRepository.js';

export class SuccessCriteriaRepository extends BaseRepository {
	static COLLECTION = 'toolgankelijk_success_criteria';

	async getSuccessCriteriumIdByIndex(index) {
		const matchedSuccessCriterium = await this.getFirstByQuery(SuccessCriteriaRepository.COLLECTION, {
			filter: { index: { _eq: index } },
			fields: ['id']
		});

		if (!matchedSuccessCriterium?.id) {
			throw new Error(`Expected success criterium id for index "${index}", but none was returned.`);
		}

		return matchedSuccessCriterium.id;
	}
}

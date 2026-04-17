import { BaseRepository } from './BaseRepository.js';

export class CheckCriteriaLinkRepository extends BaseRepository {
	static COLLECTION = 'toolgankelijk_check_toolgankelijk_success_criteria';

	async getLink(checkId, successCriteriumId) {
		const existingLink = await this.getFirstByQuery(CheckCriteriaLinkRepository.COLLECTION, {
			filter: {
				toolgankelijk_check_id: { _eq: checkId },
				toolgankelijk_success_criteria_id: { _eq: successCriteriumId }
			},
			fields: ['id']
		});

		if (!existingLink?.id) {
			throw new Error(
				`Expected check-criterion link for check "${checkId}" and criterium "${successCriteriumId}", but none was returned.`
			);
		}

		return existingLink;
	}

	async createLink(checkId, successCriteriumId) {
		await this.create(CheckCriteriaLinkRepository.COLLECTION, {
			toolgankelijk_check_id: checkId,
			toolgankelijk_success_criteria_id: successCriteriumId
		});
	}

	async deleteLinkById(linkId) {
		await this.remove(CheckCriteriaLinkRepository.COLLECTION, linkId);
	}
}

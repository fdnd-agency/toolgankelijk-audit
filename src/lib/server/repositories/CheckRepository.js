import { BaseRepository } from './BaseRepository.js';

export class CheckRepository extends BaseRepository {
	static COLLECTION = 'toolgankelijk_check';

	async getCheckIdByUrlId(urlId) {
		const matchedCheck = await this.getFirstByQuery(CheckRepository.COLLECTION, {
			filter: { url: { _eq: urlId } },
			fields: ['id']
		});

		if (!matchedCheck?.id) {
			throw new Error(`Expected check id for url id "${urlId}", but none was returned.`);
		}

		return matchedCheck.id;
	}
	async createForUrl(urlId) {
		const createdCheck = await this.create(CheckRepository.COLLECTION, { url: urlId });
		const checkId = createdCheck?.id;

		if (!checkId) {
			throw new Error(`Expected created check id for url id "${urlId}", but none was returned.`);
		}

		return checkId;
	}
}

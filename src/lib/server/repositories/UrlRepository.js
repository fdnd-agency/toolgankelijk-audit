import { BaseRepository } from './BaseRepository.js';

export class UrlRepository extends BaseRepository {
	static COLLECTION = 'toolgankelijk_url';

	async getUrlIdBySlug(urlSlug) {
		const matchedUrl = await this.getFirstByQuery(UrlRepository.COLLECTION, {
			filter: { slug: { _eq: urlSlug } },
			fields: ['id']
		});

		if (!matchedUrl?.id) {
			throw new Error(`Expected URL id for slug "${urlSlug}", but none was returned.`);
		}

		return matchedUrl.id;
	}
}

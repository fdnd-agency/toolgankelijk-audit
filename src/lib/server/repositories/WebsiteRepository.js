import { BaseRepository } from './BaseRepository.js';

export class WebsiteRepository extends BaseRepository {
	static COLLECTION = 'toolgankelijk_website';

	async getAllUrlsOfEveryPartner() {
		try {
			const websites = await this.getAllByQuery(WebsiteRepository.COLLECTION, {
				fields: ['slug', 'urls.slug', 'urls.url'],
				limit: -1
			});

			return (websites ?? []).map((website) => ({
				websiteSlug: website.slug,
				urls: (website.urls ?? []).map((url) => ({
					url: url.url,
					urlSlug: url.slug
				}))
			}));
		} catch (error) {
			console.error('Failed to fetch all URLs of every partner:', error);
			return [];
		}
	}
}

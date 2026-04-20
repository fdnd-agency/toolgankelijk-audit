import { requestWithRetry } from '$lib/server/utils/RequestRetry.js';
import { getDirectusClient } from '$lib/server/utils/Directus.js';
import { readItems, createItem, deleteItem } from '@directus/sdk';

export class BaseRepository {
	constructor({ client } = {}) {
		this.directus = client ?? getDirectusClient();
	}

	/**
	 * Makes a request to the Directus API and returns the response.
	 * returns the response if successful.
	 * throws an error if the request fails after max attempts.
	 */
	async request(operation) {
		return requestWithRetry(() => this.directus.request(operation));
	}

	/**
	 * Gets the item by id and returns it as an object.
	 * returns an empty array if no item is found.
	 */
	async getById(collection, id, fields = ['*']) {
		const items = await this.getFirstByQuery(collection, {
			filter: { id: { _eq: id } },
			fields,
			limit: 1
		});
		return items?.[0] ?? [];
	}

	/**
	 * Gets the first item by query and returns it as an object.
	 * returns an empty array if no item is found.
	 */
	async getFirstByQuery(collection, query = {}) {
		const effectiveQuery = { ...query, limit: 1 };
		const items = await this.request(readItems(collection, effectiveQuery));
		return items?.[0] ?? [];
	}

	/**
	 * Gets all items by query and returns them as an array.
	 * returns an empty array if no items are found.
	 */
	async getAllByQuery(collection, query) {
		const items = await this.request(readItems(collection, query));
		return items ?? [];
	}

	/**
	 * Creates an item and returns the created record (by default only `{ id }`).
	 */
	async create(collection, data, query) {
		const effectiveQuery = query ?? { fields: ['id'] };
		return this.request(createItem(collection, data, effectiveQuery));
	}

	/**
	 * Deletes an item and returns true if successful.
	 */
	async remove(collection, itemId) {
		await this.request(deleteItem(collection, itemId));
		return true;
	}
}

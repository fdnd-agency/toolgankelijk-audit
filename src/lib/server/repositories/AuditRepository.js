// AuditRepository - Repository class to handle database (Hygraph) operations related to audits
import { hygraph } from '../utils/Hygraph.js';
import { gql } from 'graphql-request';
import postTestResult from '../repositories/queries/postTestResult.js';
import postTestNode from '../repositories/queries/postTestNode.js';

// AuditRepository - Repository class to handle database (Hygraph) operations related to audits
export class AuditRepository {
	async storeTestResult(urlSlug, category, testId, tags, description, help, helpUrl) {
		const variables = {
			urlSlug,
			category,
			testId,
			tags,
			description,
			help,
			helpUrl
		};

		let attempt = 0;
		const maxAttempts = 5;

		while (attempt < maxAttempts) {
			try {
				const response = await hygraph.request(postTestResult(gql), variables);
				return response.createTest.id;
			} catch (error) {
				if (error.response?.status === 429 && attempt < maxAttempts - 1) {
					const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
					console.warn(
						`Rate limit hit while storing test result. Retrying in ${delay / 1000} seconds...`
					);
					await new Promise((resolve) => setTimeout(resolve, delay));
					attempt++;
				} else {
					console.error(
						`Failed to store test result for testId ${testId} and urlSlug ${urlSlug}:`,
						error
					);
					break;
				}
			}
		}
		return null;
	}

	async storeTestNode(html, target, failureSummary, test) {
		const variables = {
			html,
			target: target.flat(),
			failureSummary,
			test
		};

		let attempt = 0;
		const maxAttempts = 5;

		while (attempt < maxAttempts) {
			try {
				const response = await hygraph.request(postTestNode(gql), variables);
				return response.createTestNode.id;
			} catch (error) {
				if (error.response?.status === 429 && attempt < maxAttempts - 1) {
					const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
					console.warn(`Rate limit hit while storing node. Retrying in ${delay / 1000} seconds...`);
					await new Promise((resolve) => setTimeout(resolve, delay));
					attempt++;
				} else {
					console.error(`Failed to store node for test ID ${test} with target ${target}:`, error);
					break;
				}
			}
		}
		return null;
	}
}

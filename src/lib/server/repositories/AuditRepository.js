// AuditRepository - Repository class to handle database (Hygraph) operations related to audits
import { gql } from 'graphql-request';
import { requestWithRetry } from '$lib/index.js';
import postTestResult from '../repositories/queries/postTestResult.js';
import postTestNode from '../repositories/queries/postTestNode.js';
import getQueryToolboard from '../repositories/queries/getToolboardData.js';
import getFirstCheck from '../repositories/queries/firstCheck.js';
import getSuccesscriteriumByIndex from '../repositories/queries/getIndexId.js';
import addCheck from '../repositories/queries/addCheck.js';
import deleteCheck from '../repositories/queries/deleteCheck.js';

// AuditRepository - Repository class to handle database (Hygraph) operations related to audits
export class AuditRepository {
	async storeTestResult(testResult) {
		try {
			const response = await requestWithRetry(postTestResult(gql), testResult);
			return response.createTest.id;
		} catch (error) {
			console.error(
				`Failed to store test result for testId ${testResult.testId} and urlSlug ${testResult.urlSlug}:`,
				error
			);
			return null;
		}
	}

	async storeTestNode(testNode) {
		try {
			const response = await requestWithRetry(postTestNode(gql), testNode);
			return response.createTestNode.id;
		} catch (error) {
			console.error(
				`Failed to store node for test ID ${testNode.testId} with target ${testNode.target}:`,
				error
			);
			return null;
		}
	}

	async saveCheck(url, urlSlug, websiteSlug, criterium) {
		const index = criterium.index;
		const response = await requestWithRetry(getSuccesscriteriumByIndex(gql), { index });
		const successCriteriumId = response.succescriterium.id;
		const toolboardData = await requestWithRetry(getQueryToolboard(gql, urlSlug));
		const currentlyStoredCheckedSuccesscriteria = toolboardData.url.checks || [];

		if (criterium.passed) {
			const isAlreadyStored = currentlyStoredCheckedSuccesscriteria.some((stored) =>
				stored.succescriteria.some((succescriterium) => succescriterium.id === successCriteriumId)
			);

			if (!isAlreadyStored) {
				const firstCheck = await requestWithRetry(getFirstCheck(gql, websiteSlug, urlSlug));
				const firstCheckId = firstCheck.website.urls[0].checks[0].id;
				const addCheckMutation = addCheck(
					gql,
					websiteSlug,
					urlSlug,
					firstCheckId,
					successCriteriumId
				);
				await requestWithRetry(addCheckMutation);
				console.log('Success criterium passed and has been stored:', successCriteriumId);
			} else {
				console.log('Success criterium passed and was already stored:', successCriteriumId);
			}
		} else {
			const isStored = currentlyStoredCheckedSuccesscriteria.some((stored) =>
				stored.succescriteria.some((succescriterium) => succescriterium.id === successCriteriumId)
			);

			if (isStored) {
				const firstCheck = await requestWithRetry(getFirstCheck(gql, websiteSlug, urlSlug));
				const firstCheckId = firstCheck.website.urls[0].checks[0].id;
				const deleteCheckMutation = deleteCheck(
					gql,
					websiteSlug,
					urlSlug,
					firstCheckId,
					successCriteriumId
				);
				await requestWithRetry(deleteCheckMutation);
				console.log("Success criterium didn't pass and has been deleted:", successCriteriumId);
			} else {
				console.log("Success criterium didn't pass and wasn't already stored:", successCriteriumId);
			}
		}
	}
}

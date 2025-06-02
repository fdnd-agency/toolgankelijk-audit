import puppeteer from 'puppeteer';
import axeCore from 'axe-core';

// Runs axe-core audit for a single URL
export async function runAuditForUrl(url) {
	const browser = await puppeteer.launch({
		executablePath: puppeteer.executablePath(),
		args: ['--no-sandbox', '--disable-setuid-sandbox']
	});
	try {
		const page = await browser.newPage();
		await page.goto(url, { waitUntil: 'networkidle2' });
		await page.addScriptTag({ content: axeCore.source });
		/*
		Note: The filter functions are defined inside the page.evaluate callback
		because page.evaluate runs in the browser context, not in Node.js. Code and variables from the
		Node.js context (outside page.evaluate) are not accessible inside the browser context.
		Therefore these functions cannot be moved outside the callback and referenced inside page.evaluate.
		If you want to reuse the filter logic in both contexts, you must duplicate the logic in both places.
		*/
		const axeResults = await page.evaluate(async () => {
			const axeResults = await window.axe.run();

			const filterNodes = (nodes) => {
				return nodes.map((node) => {
					const filteredNode = { ...node };
					delete filteredNode.any;
					delete filteredNode.all;
					delete filteredNode.none;
					delete filteredNode.impact;
					return filteredNode;
				});
			};

			const filterResults = (results) => {
				return results
					.map((result) => {
						const filteredResult = { ...result };
						delete filteredResult.impact;
						if (filteredResult.nodes) {
							filteredResult.nodes = filterNodes(filteredResult.nodes);
						}
						if (filteredResult.tags) {
							const filteredTags = filteredResult.tags
								.filter((tag) => /^wcag\d+$/i.test(tag))
								.map((tag) => {
									const digits = tag.match(/\d/g);
									if (!digits) return tag;
									if (digits.length <= 3) {
										return digits.join('.');
									}
									return `${digits[0]}.${digits[1]}.${digits.slice(2).join('')}`;
								});
							filteredResult.tags = filteredTags;
						}
						return filteredResult;
					})
					.filter((result) => result.tags && result.tags.length > 0);
			};

			return {
				inapplicable: filterResults(axeResults.inapplicable),
				passes: filterResults(axeResults.passes),
				incomplete: filterResults(axeResults.incomplete),
				violations: filterResults(axeResults.violations)
			};
		});
		await page.close();
		return axeResults;
	} finally {
		await browser.close();
	}
}

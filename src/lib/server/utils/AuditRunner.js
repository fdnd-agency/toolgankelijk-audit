import puppeteer from 'puppeteer';
import axeCore from 'axe-core';

// Runs axe-core audit for a list of URLs
export async function runAuditForUrls(urls) {
	const browser = await puppeteer.launch();
	const results = {};
	try {
		for (const url of urls) {
			const page = await browser.newPage();
			await page.goto(url, { waitUntil: 'networkidle2' });
			await page.addScriptTag({ content: axeCore.source });
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
					return results.map((result) => {
						const filteredResult = { ...result };
						delete filteredResult.impact;
						if (filteredResult.nodes) {
							filteredResult.nodes = filterNodes(filteredResult.nodes);
						}
						return filteredResult;
					});
				};

				return {
					inapplicable: filterResults(axeResults.inapplicable),
					passes: filterResults(axeResults.passes),
					incomplete: filterResults(axeResults.incomplete),
					violations: filterResults(axeResults.violations)
				};
			});
			results[url] = axeResults;
			await page.close();
		}
	} finally {
		await browser.close();
	}
	return results;
}

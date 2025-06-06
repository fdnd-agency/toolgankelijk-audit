// TestResult class - this class is the blueprint for creating test result objects.
export class TestResult {
	constructor(urlSlug, category, testId, tags, description, help, helpUrl) {
		this.urlSlug = urlSlug;
		this.category = category;
		this.testId = testId;
		this.tags = tags;
		this.description = description;
		this.help = help;
		this.helpUrl = helpUrl;
	}
}

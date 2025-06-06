// TestNode class - this class is the blueprint for creating test node objects.
export class TestNode {
	constructor(html, target, failureSummary, testId) {
		this.html = html;
		this.target = target;
		this.failureSummary = failureSummary;
		this.testId = testId;
	}
}

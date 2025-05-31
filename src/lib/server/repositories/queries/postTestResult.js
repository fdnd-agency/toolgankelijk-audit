export default function postTestResult(gql) {
	return gql`
		mutation StoreTestResults(
			$urlSlug: String!
			$category: String!
			$testId: String!
			$tags: [String!]!
			$description: String!
			$help: String!
			$helpUrl: String!
		) {
			createTest(
				data: {
					url: { connect: { slug: $urlSlug } }
					category: $category
					testId: $testId
					tags: $tags
					description: $description
					help: $help
					helpUrl: $helpUrl
				}
			) {
				id
			}
		}
	`;
}

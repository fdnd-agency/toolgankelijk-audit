export default function postTestNode(gql) {
	return gql`
		mutation StoreTestNode(
			$html: String!
			$target: [String!]!
			$failureSummary: String
			$test: ID!
		) {
			createTestNode(
				data: {
					html: $html
					target: $target
					failureSummary: $failureSummary
					test: { connect: { id: $test } }
				}
			) {
				id
			}
		}
	`;
}

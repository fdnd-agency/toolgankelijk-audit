export default function getSuccesscriteriumByIndex(gql) {
	return gql`
		query GetSuccescriteriumByIndex($index: String!) {
			succescriterium(where: { index: $index }) {
				id
			}
		}
	`;
}

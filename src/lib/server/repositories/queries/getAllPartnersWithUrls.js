export default function getAllPartnersWithTheirUrls(gql) {
	return gql`
		query GetAllPartnersWithUrls {
			websites {
				slug
				urls {
					slug
					url
				}
			}
		}
	`;
}

export default function getFirstCheck(gql, websiteSlug, urlSlug) {
	return gql`
		query checkedChecksOfUrl {
			website(where: { slug: "${websiteSlug}" }) {
				urls(where: { slug: "${urlSlug}" }) {
					checks(first: 1) {
						id
					}
				}
			}
		}
	`;
}

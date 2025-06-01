export default function getQueryToolboard(gql, slugUrl) {
	return gql`
    query Toolboard {
        url(where: {slug: "${slugUrl}"}) {
          id
          url
          slug
          checks(first: 1) {
            succescriteria(first: 100) {
              id
              index
              niveau
            }
          }
        }
        principes {
          titel
          beschrijving {
            html
          }
          richtlijnen {
            titel
            succescriteria(first: 200) {
              id
              titel
              index
              niveau
              makkelijkeCriteria {
                html
              }
              criteria {
                html
              }
            }
            index
            slug
            uitleg {
              html
            }
          }
          checklistItems {
            check
          }
          index
          slug
        }
      }
      `;
}

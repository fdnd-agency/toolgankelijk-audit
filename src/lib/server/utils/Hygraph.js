import { VITE_HYGRAPH_KEY, HYGRAPH_URL } from '$env/static/private';
import { GraphQLClient } from 'graphql-request';

// This file is used to create a GraphQL client for Hygraph with the necessary headers for authentication.
export const hygraph = new GraphQLClient(HYGRAPH_URL, {
	headers: {
		Authorization: `Bearer ${VITE_HYGRAPH_KEY}`
	}
});

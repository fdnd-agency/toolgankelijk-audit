// The SvelteKit handle function is a server-side hook that runs for every incoming HTTP request.
// It allows you to intercept, modify, or respond to requests before they reach your routes or endpoints.
export async function handle({ event, resolve }) {
	// Handle preflight requests (CORS)
	if (event.request.method === 'OPTIONS') {
		return new Response(null, {
			headers: {
				'Access-Control-Allow-Origin': 'http://localhost:5173',
				'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
				'Access-Control-Allow-Credentials': 'true'
			}
		});
	}

	// Resolve the request and add CORS headers to the response
	const response = await resolve(event);
	response.headers.set('Access-Control-Allow-Origin', 'http://localhost:5173');
	response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
	response.headers.set('Access-Control-Allow-Credentials', 'true');

	return response;
}

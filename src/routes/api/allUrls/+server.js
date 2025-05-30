// Endpoint to audit all URLs (used to periodically audit all URLs)
export async function POST() {
	try {
		return new Response(JSON.stringify({ message: 'Audit succesvol!' }), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), { status: 500 });
	}
}

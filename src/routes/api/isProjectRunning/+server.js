// Endpoint to check if the project is running
export async function GET() {
	return new Response(JSON.stringify({ status: 'ok', message: 'Project is running' }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
}

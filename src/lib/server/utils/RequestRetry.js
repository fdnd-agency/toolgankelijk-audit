// Retries transient failures for async request functions.
export async function requestWithRetry(requestFn, maxAttempts = 5) {
	let attempt = 0;
	while (attempt < maxAttempts) {
		try {
			return await requestFn();
		} catch (error) {
			const status = error.status ?? error.response?.status;
			if ((status === 429 || status === 502 || status === 504) && attempt < maxAttempts - 1) {
				const delay = Math.pow(2, attempt) * 1000;
				console.warn(
					`Rate limit or server error (status ${status}). Retrying in ${delay / 1000} seconds... (attempt ${attempt + 1})`
				);
				await new Promise((resolve) => setTimeout(resolve, delay));
				attempt++;
			} else {
				throw error;
			}
		}
	}
	throw new Error('Max retry attempts reached');
}

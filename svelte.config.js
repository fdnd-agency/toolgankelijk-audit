import adapter from '@sveltejs/adapter-node';
import { PORT } from '$env/static/private';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		vite: () => ({ server: { port: PORT } })
	}
};

export default config;

//@ts-check
import { FetchConnection, SseError, createResponse } from 'better-sse';

/**
 * @typedef {{ isConnected: boolean; push: (data: unknown, eventName?: string) => unknown }} SseSessionLike
 */

/**
 * @typedef {Object} SseResponseOptions
 * @property {number} [status]
 */

export class SSEService {
	/** @param {unknown} err @param {{ phase: string; eventType?: string; session?: SseSessionLike }} ctx */
	static handleSsePushError(err, ctx) {
		if (ctx.session?.isConnected === false || err instanceof SseError) {
			console.warn(
				`[sse] ${ctx.phase} not delivered (session inactive)` +
					(ctx.eventType ? ` [${ctx.eventType}]` : '')
			);
			return;
		}
		console.error(`[sse] ${ctx.phase} push failed:`, err);
	}

	/**
	 * Pushes data to the session, handling errors and disconnection states.
	 *
	 * @param {SseSessionLike} session
	 * @param {unknown} data
	 * @param {string} eventName
	 */
	static push(session, data, eventName = 'message') {
		if (!session.isConnected) return;
		try {
			session.push(data, eventName);
		} catch (error) {
			SSEService.handleSsePushError(error, { phase: 'event', eventType: eventName, session });
		}
	}

	/**
	 * @param {Error | unknown} error
	 */
	static errorMessage(error) {
		if (error instanceof Error) return error.message;
		if (error === undefined) return 'Stream writer rejected without a reason';
		return String(error);
	}

	/** Catches rejected writes after disconnect. */
	static ResilientFetchConnection = class ResilientFetchConnection extends FetchConnection {
		/** @type {TextEncoder} */
		static #textEncoder = new TextEncoder();

		/** @param {string} chunk */
		sendChunk = (chunk) => {
			const encoded = ResilientFetchConnection.#textEncoder.encode(chunk);
			// @ts-ignore
			void this.writer.write(encoded).catch((err) => {
				console.warn(`[sse] stream write skipped: ${SSEService.errorMessage(err)}`);
			});
		};

		cleanup = () => {
			// @ts-ignore
			void this.writer.close().catch((err) => {
				console.warn(`[sse] stream close skipped: ${SSEService.errorMessage(err)}`);
			});
		};
	};

	/**
	 * @param {import('better-sse').Session} session
	 */
	static closeSession(session) {
		if (!session.isConnected) return;
		try {
			// @ts-ignore - onDisconnected is private in Session
			session.onDisconnected?.();
		} catch (err) {
			console.error('[sse] failed to close session:', err);
		}
	}

	/**
	 * Creates a `better-sse` response.
	 *
	 * @param {Request} request
	 * @param {(session: import('better-sse').Session) => void | Promise<void>} callback
	 * @param {SseResponseOptions} options
	 */
	static createSseResponse(request, callback, { status = 200 } = {}) {
		const connection = new SSEService.ResilientFetchConnection(request, null, {
			statusCode: status,
			headers: {
				'Content-Type': 'text/event-stream; charset=utf-8',
				Connection: 'keep-alive',
				'Cache-Control': 'no-cache'
			}
		});

		return createResponse(connection, async (session) => {
			try {
				await callback(session);
			} catch (err) {
				console.error('[sse] session task:', err);
			} finally {
				SSEService.closeSession(session);
			}
		});
	}
}
export const SseService = SSEService;

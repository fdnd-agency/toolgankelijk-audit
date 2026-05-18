//@ts-check
import { FetchConnection, SseError, createResponse } from 'better-sse';

/**
 * @typedef {{ isConnected: boolean; push: (data: unknown, eventName?: string) => unknown }} SseSessionLike
 * @typedef {AsyncIterable<{ type?: string } & Record<string, unknown>>} AuditEventSource
 * @typedef {(err: unknown) => { type?: string } & Record<string, unknown>} MapAuditError
 */

/**
 * @typedef {Object} AuditSseResponseOptions
 * @property {Record<string, string>} [headers] merged onto default SSE response headers
 * @property {number | null} [retry] SSE `retry:` field in ms; omit with `null` (default `2000`)
 * @property {number | null} [keepAlive] comment ping interval in ms; omit with `null` (default `10000`)
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
	 * Drains audit events; skips writes after disconnect.
	 *
	 * @param {SseSessionLike} session
	 * @param {AuditEventSource} source
	 * @param {MapAuditError} onError
	 */
	static async drainAuditSourceToSession(session, source, onError) {
		try {
			for await (const update of source) {
				if (session.isConnected) {
					const eventType = update.type ?? 'message';
					try {
						session.push(update, eventType);
					} catch (err) {
						SSEService.handleSsePushError(err, { phase: 'event', eventType, session });
					}
				}
			}
		} catch (err) {
			if (!session.isConnected) return;
			try {
				const payload = onError(err);
				const body = payload ?? { type: 'audit_failed', message: 'Unknown error' };
				session.push(body, body.type ?? 'audit_failed');
			} catch (e2) {
				SSEService.handleSsePushError(e2, { phase: 'error', session });
				console.error('[sse] onError or push after source failure:', e2, 'source error:', err);
			}
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
	 * @typedef {Object} CreateAuditSseResponseOptions
	 * @property {AuditEventSource} source
	 * @property {MapAuditError} onError
	 * @property {number} [status]
	 * @property {AuditSseResponseOptions} [sessionOptions]
	 */

	/**
	 * Creates a `better-sse` response and drains audit events.
	 *
	 * @param {Request} request
	 * @param {CreateAuditSseResponseOptions} options
	 */
	static createAuditSseResponse(request, { source, onError, status = 200, sessionOptions = {} }) {
		const connection = new SSEService.ResilientFetchConnection(request, null, {
			...sessionOptions,
			statusCode: status,
			headers: {
				'Content-Type': 'text/event-stream; charset=utf-8',
				...(sessionOptions.headers ?? {})
			}
		});

		return createResponse(connection, (session) => {
			void (async () => {
				try {
					await SSEService.drainAuditSourceToSession(session, source, onError);
				} catch (err) {
					console.error('[sse] drainAuditSourceToSession:', err);
				} finally {
					SSEService.closeSession(session);
				}
			})().catch((err) => console.error('[sse] audit stream task:', err));
		});
	}
}

export const createAuditSseResponse = SSEService.createAuditSseResponse;

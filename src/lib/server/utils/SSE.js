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

/** @param {unknown} err @param {{ phase: string; eventType?: string; session?: SseSessionLike }} ctx */
function handleSsePushError(err, ctx) {
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
export async function drainAuditSourceToSession(session, source, onError) {
	try {
		for await (const update of source) {
			if (session.isConnected) {
				const eventType = update.type ?? 'message';
				try {
					session.push(update, eventType);
				} catch (err) {
					handleSsePushError(err, { phase: 'event', eventType, session });
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
			handleSsePushError(e2, { phase: 'error', session });
			console.error('[sse] onError or push after source failure:', e2, 'source error:', err);
		}
	}
}

function errorMessage(error) {
	if (error instanceof Error) return error.message;
	if (error === undefined) return 'Stream writer rejected without a reason';
	return String(error);
}

/** Catches rejected writes after disconnect. */
class SafeFetchConnection extends FetchConnection {
	sendChunk = (chunk) => {
		const encoded = FetchConnection.encoder.encode(chunk);
		void this.writer.write(encoded).catch((err) => {
			console.warn(`[sse] stream write skipped: ${errorMessage(err)}`);
		});
	};

	cleanup = () => {
		void this.writer.close().catch((err) => {
			console.warn(`[sse] stream close skipped: ${errorMessage(err)}`);
		});
	};
}

/**
 * @param {import('better-sse').Session} session
 */
function closeSession(session) {
	if (!session.isConnected) return;
	try {
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
export function createAuditSseResponse(
	request,
	{ source, onError, status = 200, sessionOptions = {} }
) {
	const connection = new SafeFetchConnection(request, undefined, {
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
				await drainAuditSourceToSession(session, source, onError);
			} catch (err) {
				console.error('[sse] drainAuditSourceToSession:', err);
			} finally {
				closeSession(session);
			}
		})().catch((err) => console.error('[sse] audit stream task:', err));
	});
}

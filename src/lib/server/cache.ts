const store = new Map<string, { value: unknown; expires: number }>();
const inflight = new Map<string, Promise<unknown>>();

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
	const hit = store.get(key);
	if (hit && hit.expires > Date.now()) return hit.value as T;

	const pending = inflight.get(key);
	if (pending) return pending as Promise<T>;

	const promise = load()
		.then((value) => {
			store.set(key, { value, expires: Date.now() + ttlMs });
			return value;
		})
		.catch((err) => {
			const stale = store.get(key);
			if (stale) {
				console.error(`cached(): refresh failed for "${key}", serving stale value`, err);
				return stale.value as T;
			}
			throw err;
		})
		.finally(() => inflight.delete(key));

	inflight.set(key, promise);
	return promise;
}

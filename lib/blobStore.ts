import { getStore } from '@netlify/blobs';

export interface StoredRoom<T = any> {
  data: T;
  etag: string;
}

// In-memory strong-consistency fallback cache for local dev & testing without Netlify env
const localMemoryStore = new Map<string, { data: string; etag: string }>();

function generateEtag(): string {
  return 'w/' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

/**
 * Checks whether Netlify Blobs is configured with credentials in the current environment
 */
function isNetlifyBlobsAvailable(): boolean {
  return !!(
    process.env.NETLIFY_BLOBS_CONTEXT ||
    process.env.NETLIFY_PURGE_API_TOKEN ||
    (process.env.SITE_ID && process.env.NETLIFY_API_TOKEN)
  );
}

/**
 * Get Netlify Blobs Store with strong consistency
 */
function getBlobStore() {
  return getStore({
    name: 'hallucination_ground_rooms',
    consistency: 'strong'
  });
}

/**
 * Read room state using strong consistency
 */
export async function getRoomFromStore<T = any>(roomCode: string): Promise<StoredRoom<T> | null> {
  const code = roomCode.toUpperCase().trim();

  if (isNetlifyBlobsAvailable()) {
    try {
      const store = getBlobStore();
      const res = await store.getWithMetadata(code, {
        type: 'json',
        consistency: 'strong'
      });

      if (!res || !res.data) return null;
      return {
        data: res.data as T,
        etag: res.etag || generateEtag()
      };
    } catch (err: any) {
      // If error occurs, fallback to memory
      console.warn('Netlify Blobs get error, using fallback:', err?.message || err);
    }
  }

  // Fallback strong-consistency store
  const item = localMemoryStore.get(code);
  if (!item) return null;
  return {
    data: JSON.parse(item.data) as T,
    etag: item.etag
  };
}

/**
 * Save room state using conditional write (optimistic locking with etag)
 * Returns { success: true, newEtag } or { success: false, conflict: true }
 */
export async function setRoomInStore<T = any>(
  roomCode: string,
  data: T,
  expectedEtag?: string
): Promise<{ success: boolean; newEtag?: string; conflict?: boolean }> {
  const code = roomCode.toUpperCase().trim();

  if (isNetlifyBlobsAvailable()) {
    try {
      const store = getBlobStore();

      if (expectedEtag) {
        // Netlify Blobs conditional write using strong consistency and onlyIfMatch
        const res = await store.setJSON(code, data, { onlyIfMatch: expectedEtag });
        if ((res as any)?.modified === false) {
          return { success: false, conflict: true };
        }
        return { success: true, newEtag: res?.etag || generateEtag() };
      } else {
        const res = await store.setJSON(code, data);
        return { success: true, newEtag: res?.etag || generateEtag() };
      }
    } catch (err: any) {
      if (err?.status === 412 || err?.name === 'BlobPreconditionFailedError' || err?.message?.includes('Precondition') || err?.message?.includes('modified')) {
        return { success: false, conflict: true };
      }
      console.warn('Netlify Blobs write error, falling back:', err?.message || err);
    }
  }

  // Fallback strong-consistency conditional write
  const existing = localMemoryStore.get(code);
  if (expectedEtag && existing && existing.etag !== expectedEtag) {
    // Etag mismatch -> conditional write rejected
    return { success: false, conflict: true };
  }

  const newEtag = generateEtag();
  localMemoryStore.set(code, {
    data: JSON.stringify(data),
    etag: newEtag
  });

  return { success: true, newEtag };
}

/**
 * Atomically update room with automatic conflict retry (up to 4 attempts)
 */
export async function atomicUpdateRoom<T = any>(
  roomCode: string,
  mutator: (current: T) => T | Promise<T>
): Promise<T> {
  const code = roomCode.toUpperCase().trim();
  const maxRetries = 4;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const stored = await getRoomFromStore<T>(code);
    if (!stored) {
      throw new Error(`Room ${code} not found`);
    }

    const updatedData = await mutator(stored.data);
    const result = await setRoomInStore(code, updatedData, stored.etag);

    if (result.success) {
      return updatedData;
    }

    // Small backoff before retrying
    await new Promise(res => setTimeout(res, 20 + Math.random() * 40));
  }

  throw new Error(`Concurrent update conflict for room ${code}. Please try again.`);
}

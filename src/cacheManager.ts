// src/cacheManager.ts
export class CacheManager {
    private cache = new Map<string, { data: any; timestamp: number }>();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5분

    set(key: string, data: any): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    get(key: string): any | null {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp > this.CACHE_DURATION) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    clear(): void {
        this.cache.clear();
    }
}
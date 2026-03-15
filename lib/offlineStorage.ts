export const CACHE_NAME = "edu-video-cache";

export async function cacheVideo(url: string, lessonId: string): Promise<boolean> {
    try {
        const cache = await caches.open(CACHE_NAME);
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");
        await cache.put(generateCacheKey(lessonId), response);
        return true;
    } catch (error) {
        console.error("Failed to cache video:", error);
        return false;
    }
}

export async function removeCachedVideo(lessonId: string): Promise<boolean> {
    try {
        const cache = await caches.open(CACHE_NAME);
        return await cache.delete(generateCacheKey(lessonId));
    } catch (error) {
        console.error("Failed to delete cached video:", error);
        return false;
    }
}

export async function checkIsCached(lessonId: string): Promise<boolean> {
    try {
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match(generateCacheKey(lessonId));
        return !!response;
    } catch (error) {
        console.error("Failed to check cache:", error);
        return false;
    }
}

export async function getCachedVideoUrl(lessonId: string): Promise<string | null> {
    try {
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match(generateCacheKey(lessonId));
        if (!response) return null;
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Failed to get cached video url:", error);
        return null;
    }
}

function generateCacheKey(lessonId: string) {
    return `/offline/video/${lessonId}`;
}

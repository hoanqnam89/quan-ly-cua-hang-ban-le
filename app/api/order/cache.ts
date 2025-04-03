// Cache kết quả API trong 5 phút (300000ms)
export const CACHE_DURATION = 300000;
let cachedOrders: { data: any[]; timestamp: number } | null = null;

/**
 * Lấy dữ liệu order từ cache nếu có và chưa hết hạn
 */
export function getOrderCache() {
    const now = Date.now();
    if (cachedOrders && now - cachedOrders.timestamp < CACHE_DURATION) {
        return cachedOrders.data;
    }
    return null;
}

/**
 * Lưu dữ liệu order vào cache
 */
export function setOrderCache(data: any[]) {
    cachedOrders = { data, timestamp: Date.now() };
}

/**
 * Vô hiệu hóa cache order
 */
export function invalidateOrderCache() {
    cachedOrders = null;
} 
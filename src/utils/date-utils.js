/**
 * 日期工具类
 * 提供各种日期操作和格式化功能
 */

/**
 * 将日期转换为YYYY-MM-DD格式
 * @param {String|Date} dateString - 需要格式化的日期字符串或日期对象
 * @returns {String} 格式化后的日期字符串，格式为YYYY-MM-DD
 */
export function formatDate(dateString) {
    if (!dateString) return '';
    
    // 判断是否已经是格式化的日期字符串 (YYYY-MM-DD)
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('日期格式化错误:', error);
        return dateString;
    }
}

/**
 * 将日期转换为YYYY-MM-DD HH:mm:ss格式
 * @param {String|Date} dateString - 需要格式化的日期字符串或日期对象
 * @returns {String} 格式化后的日期时间字符串，格式为YYYY-MM-DD HH:mm:ss
 */
export function formatDateTime(dateString) {
    if (!dateString) return '';
    
    // 判断是否已经是格式化的日期时间字符串 (YYYY-MM-DD HH:mm:ss)
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
        return dateString;
    }
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
        console.error('日期时间格式化错误:', error);
        return dateString;
    }
}

/**
 * 判断字符串是否为有效日期
 * @param {String} dateString - 需要判断的日期字符串
 * @returns {Boolean} 是否为有效日期
 */
export function isValidDate(dateString) {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

/**
 * 获取当前日期的字符串表示，格式为YYYY-MM-DD
 * @returns {String} 当前日期的字符串表示
 */
export function getCurrentDate() {
    const now = new Date();
    return formatDate(now);
}

/**
 * 获取当前日期时间的字符串表示，格式为YYYY-MM-DD HH:mm:ss
 * @returns {String} 当前日期时间的字符串表示
 */
export function getCurrentDateTime() {
    const now = new Date();
    return formatDateTime(now);
}

export default {
    formatDate,
    formatDateTime,
    isValidDate,
    getCurrentDate,
    getCurrentDateTime
}; 
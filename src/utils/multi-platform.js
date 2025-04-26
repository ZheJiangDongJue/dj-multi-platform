
const detectDeviceHelper = {
    /**
     * 检测设备类型
     * 使用屏幕尺寸和用户代理结合的方式判断设备类型
     * 特别处理安卓平板的情况
     * @returns {'mobile'|'tablet'|'desktop'} 设备类型
     */
    detectDeviceType() {
        const userAgent = navigator.userAgent;

        // 获取屏幕尺寸
        const screenWidth = window.innerWidth || document.documentElement.clientWidth;
        const screenHeight = window.innerHeight || document.documentElement.clientHeight;
        const screenSize = Math.min(screenWidth, screenHeight);

        // 获取设备像素比
        const pixelRatio = window.devicePixelRatio || 1;

        // 检查是否明确标识为平板
        const isExplicitTablet = /ipad|tablet/i.test(userAgent);

        // 检查是否为安卓设备
        const isAndroid = /android/i.test(userAgent);

        // 检查是否明确标识为移动设备
        const isExplicitMobile = /mobile|iphone|ipod/i.test(userAgent);

        // 基于屏幕尺寸的平板判断（7英寸以上通常被视为平板）
        // 使用最小边长 >= 600px 作为平板的判断标准
        const isTabletBySize = screenSize >= 600;

        // 判断逻辑
        if (isExplicitTablet) {
            return 'tablet'; // 明确标识为平板
        } else if (isAndroid && !isExplicitMobile && isTabletBySize) {
            return 'tablet'; // 安卓设备，未明确标识为手机，且屏幕尺寸符合平板标准
        } else if (isTabletBySize && pixelRatio < 2) {
            return 'tablet'; // 大屏幕且像素密度较低，可能是平板
        } else if (/mobile|android|ios|iphone|ipod/i.test(userAgent) && !isTabletBySize) {
            return 'mobile'; // 移动设备且屏幕较小
        } else if (screenSize >= 1024) {
            return 'desktop'; // 大屏幕设备视为桌面
        } else {
            // 默认情况下，使用屏幕尺寸判断
            return isTabletBySize ? 'tablet' : 'mobile';
        }
    },

    /**
     * 获取设备的详细信息
     * @returns {Object} 设备详细信息
     */
    getDeviceInfo() {
        const userAgent = navigator.userAgent;
        const screenWidth = window.innerWidth || document.documentElement.clientWidth;
        const screenHeight = window.innerHeight || document.documentElement.clientHeight;
        const pixelRatio = window.devicePixelRatio || 1;

        return {
            userAgent,
            screenWidth,
            screenHeight,
            pixelRatio,
            isAndroid: /android/i.test(userAgent),
            isIOS: /iphone|ipad|ipod/i.test(userAgent),
            isMobileExplicit: /mobile/i.test(userAgent),
            isTabletExplicit: /ipad|tablet/i.test(userAgent),
            deviceType: this.detectDeviceType()
        };
    }
}

export default detectDeviceHelper;
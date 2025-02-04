function detectDeviceType() {
    const userAgent = navigator.userAgent;

    if (/mobile|android|ios|iphone|ipod/i.test(userAgent) && !/ipad|tablet/i.test(userAgent)) {
        return 'mobile'; // 手机
    } else if (/ipad|tablet/i.test(userAgent)) {
        return 'tablet'; // 平板
    } else {
        return 'desktop'; // 电脑
    }
}

export default detectDeviceType;
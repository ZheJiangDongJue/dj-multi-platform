const ConvertMap = {
    // MaterialPage: "/material",
    LoginPage: "/login",
    ProcessAssemblyFlowBill: "/zzlck",
    BatchReceiveProcessAssemblyFlow: "/pljszzlck",
    BatchCompleteProcessAssemblyFlow: "/plwgzzlck",
}

import { Toast } from 'vant';

const PageNameToRouterConverter = {
    // 是否使用嵌套路由模式
    useNestedMode: false,
    
    HasPage(pageName) {
        let v = ConvertMap[pageName];
        return v !== undefined;
    },
    
    Convert(pageName) {
        let v = ConvertMap[pageName];
        if (!PageNameToRouterConverter.HasPage(pageName)) {
            Toast('没有该功能对应的页面')
            return undefined;
        }
        return v;
    },
    
    // 转换为嵌套路由格式
    ConvertNested(pageName) {
        let router = PageNameToRouterConverter.Convert(pageName);
        if (router === undefined) {
            return undefined;
        }
        
        // 移除开头的斜杠，作为子路由路径
        return router.replace('/', '');
    },
    
    ConvertBack(router) {
        for (const key in ConvertMap) {
            if (Object.prototype.hasOwnProperty.call(ConvertMap, key)) {
                const element = ConvertMap[key];
                if (element == router) {
                    return key;
                }
            }
        }
    }
}

export default PageNameToRouterConverter
const ConvertMap = {
    // MaterialPage: "/material",
    LoginPage: "/login",
}

import { Toast } from 'vant';

const PageNameToRouterConverter = {
    HasPage(pageName){
        let v = ConvertMap[pageName];
        return v !== undefined;
    },
    Convert(pageName) {
        let v = ConvertMap[pageName];
        if (!PageNameToRouterConverter.HasPage(pageName)) {
            Toast('没有该功能对应的页面')
        }
        return v;
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
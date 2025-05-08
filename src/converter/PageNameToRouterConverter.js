const ConvertMap = {
    // MaterialPage: "/material",
    LoginPage: "/login",
    ProcessAssemblyFlowBill: "/zzlck",
    BatchReceiveProcessAssemblyFlow: "/pljszzlck",
    BatchCompleteProcessAssemblyFlow: "/plwgzzlck",
    ViewportDemo: "/viewport-demo",
    BillPageTemplateDemo: "/bill-template-demo",
    DeviceDetectionTest: "/device-detection-test",
    ScreenInfoDemo: "/screen-info-demo",
    AndroidBridgeDemo: "/android-bridge-demo",
    ScanCodeDemo: "/scan-code-demo",
}

import { Toast } from 'vant';

const PageNameToRouterConverter = {
    // 是否使用嵌套路由模式
    useNestedMode: true,

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

        // 根据模块分类获取模块路径
        const moduleInfo = this.getModuleInfo(pageName);
        if (!moduleInfo) {
            // 如果没有模块信息，则使用原来的方式
            return router.replace('/', '');
        }

        // 返回格式：模块路由/功能路由
        return `${moduleInfo.moduleRoute}/${router.replace('/', '')}`;
    },

    // 获取页面所属的模块信息
    getModuleInfo(pageName) {
        // 定义模块映射关系
        const moduleMap = {
            // 工艺系统模块
            'ProcessAssemblyFlowBill': { moduleName: '工艺系统', moduleRoute: 'technology' },
            'BatchReceiveProcessAssemblyFlow': { moduleName: '工艺系统', moduleRoute: 'technology' },
            'BatchCompleteProcessAssemblyFlow': { moduleName: '工艺系统', moduleRoute: 'technology' },
            // 示例模块
            'ViewportDemo': { moduleName: '示例', moduleRoute: 'example' },
            'BillPageTemplateDemo': { moduleName: '示例', moduleRoute: 'example' },
            'DeviceDetectionTest': { moduleName: '示例', moduleRoute: 'example' },
            'ScreenInfoDemo': { moduleName: '示例', moduleRoute: 'example' },
            'AndroidBridgeDemo': { moduleName: '示例', moduleRoute: 'example' },
            'ScanCodeDemo': { moduleName: '示例', moduleRoute: 'example' },
            // 可以继续添加其他模块...
        };

        return moduleMap[pageName];
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
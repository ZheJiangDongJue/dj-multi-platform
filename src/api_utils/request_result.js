// 请求结果
class RequestResult {
    constructor(data = null, err = null) {
        this.data = data;
        this.err = err;

        // 可选的类型检查 (使用typeof或更严格的检查)
        if (this.err && typeof this.err !== 'object') {
            console.warn("err should be an error object or null");
            // 或者抛出错误: throw new Error("err should be an error object or null");
        }
    }
}

export default RequestResult;
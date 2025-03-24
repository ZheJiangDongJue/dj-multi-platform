
export class ApiMessagePack {
    Status: number;
    DetailCode: number;
    Message: string;
    Data: object;

    constructor(status: number, detailCode: number, message: string, data: object) {
        this.Status = status;
        this.DetailCode = detailCode;
        this.Message = message;
        this.Data = data;
    }
}
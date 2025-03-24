export class DbChangedPackResult {
    id: number;
    AccountId: number;
    IsSuccess: boolean;
    ErrorMessage: string;
    Objects: { [key: string]: object };
    AddItems: object[];
    UpdateItems: object[];
    DeleteItems: object[];

    constructor() {
        this.id = 0;
        this.AccountId = 0;
        this.IsSuccess = false;
        this.ErrorMessage = "";
        this.Objects = {};
        this.AddItems = [];
        this.UpdateItems = [];
        this.DeleteItems = [];
    }
}


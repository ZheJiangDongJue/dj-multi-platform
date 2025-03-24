
export class TableRecord {
    TableName: string | undefined;
    id: number | undefined;

    constructor(tableName: string, id: number) {
        this.TableName = tableName;
        this.id = id;
    }
}


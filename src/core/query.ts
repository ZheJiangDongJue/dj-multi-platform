enum JoinType {
    Inner,
    Left,
    Right,
    FullOuter // Though not all databases support FULL OUTER JOIN
}

interface JoinInfo {
    JoinType: JoinType;
    TableName: string;
    ShortName: string;
    On: string;
}

export class Query {
    TableName: string | undefined;
    ShortName: string | undefined;
    Where: string[] | undefined;
    Order: string | undefined;
    JoinInfos: JoinInfo[] | undefined;
    GroupBy: string | undefined;
    Having: string | undefined;
    Select: string | undefined;

    /**
     * Page number
     */
    PageNumber: number | null = null;

    /**
     * Items per page
     */
    PageSize: number | null = null;

    /**
     * Similar to 'top 20'
     */
    SelectMode: string | undefined;

    // /**
    //  * Persistent Where conditions, added to every query
    //  */
    // PermanentWhere: Condition[] = [];
    //
    // /**
    //  * Persistent Join information, added to every query
    //  */
    // PermanentJoinInfos: JoinInfo[] = [];

    AddWhere(where: string): this {
        if (!this.Where) {
            this.Where = [];
        }
        this.Where.push(where);
        return this;
    }

    AddJoin(joinType: JoinType, tableName: string, shortName: string, on: string): this {
        if (!this.JoinInfos) {
            this.JoinInfos = [];
        }
        this.JoinInfos.push({
            JoinType: joinType,
            TableName: tableName,
            ShortName: shortName,
            On: on,
        });
        return this;
    }

    AnyWhere(): boolean {
        return this.Where !== undefined && this.Where.length > 0;
    }

    AnyJoin(): boolean {
        return this.JoinInfos !== undefined && this.JoinInfos.length > 0;
    }
}

export { JoinType };
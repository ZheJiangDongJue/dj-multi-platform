enum JoinType {
    Inner,
    Left,
    Right,
    Full,
    Cross,
}

class JoinInfo {
    TableName: string | undefined;
    ShortName: string | undefined;
    JoinType: JoinType | undefined;
    On: string | undefined;
}

export class DataGetterEffectPack {
    /// <summary>
    /// 
    /// </summary>
    Key: string | undefined;

    /// <summary>
    /// 值
    /// </summary>
    /// <example>
    /// '1','2','3'
    /// </example>
    Value: string | undefined;

    AttachWhere: string | undefined;
    AttachJoinInfo: JoinInfo = new JoinInfo;
}

export class DataGetterPack {
    /// <summary>
    /// 额外附加的,前端看需求在发包的时候设置,一般情况下是空值
    /// </summary>
    AttachWhere: string | undefined;
    EffectPack: Array<DataGetterEffectPack> = [];
}
// 权限的枚举值
const Permissions = {
    浏览: 0x00000001,
    新增: 0x00000002,
    修改: 0x00000004,
    删除: 0x00000008,
    占位1: 0x00000010,
    占位2: 0x00000020,
    占位3: 0x00000040,
    占位4: 0x00000080,
    启用: 0x00000100,
    反启用: 0x00000200,
    占位5: 0x00000400,
    导出: 0x00000800,
    打印: 0x00001000,
    打印模板设计: 0x00002000,
    安全数据可见: 0x00004000,
    系统化设计: 0x00008000,
    审批: 0x00010000,
    反审批: 0x00020000,
    已审变更: 0x00040000,
    结案: 0x00080000,
    反结案: 0x00100000,
    冻结: 0x00200000,
    解冻: 0x00400000,
    确认: 0x00800000,
    反确认: 0x01000000,
    占位8: 0x02000000,
    占位9: 0x04000000,
    占位10: 0x08000000,
    占位11: 0x10000000,
    临时_明细中仓库可修改: 0x20000000,
    安全数据可修改: 0x40000000,
};
export enum ControlMode {
    None = 0,
    Readonly = 1 << 0,
    Disable = 1 << 1,
    Hide = 1 << 2,
    Required = 1 << 3,
    FieldUpdateForForm = 1 << 4,
    ParticipateInFiltering = 1 << 5,
    UseInPrintReport = 1 << 6,
    IsBillMainDataView = 1 << 7,
    IsBillSecondaryDataView = 1 << 8,
}
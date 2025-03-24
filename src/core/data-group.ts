// 假设以下类型已存在（根据您的实际类型定义补充）
type SystemPage = any;
type SystemView = any;
type SystemDataView = any;
type SystemDataViewField = any;
type SystemType = any;
type SystemField = any;
type SystemControlFieldAttach = any;
type SystemBillInfo = any;
type SystemSettingForTextBox = any;
type SystemSettingForNumber = any;
type SystemSettingForButton = any;
type SystemSettingForEnumComboBox = any;
type SystemSettingForCustomEnumControl = any;
type SystemSettingForComboBox = any;
type SystemSettingForDataGrid = any;
type SystemSettingForDateTime = any;
type SystemSettingForPanel = any;
type SystemSettingForStepProgressBar = any;
type SystemViewWithFeatureAttach = any;
type SystemControlDataGridAttach = any;
type SystemCascadingUpdate = any;
type SystemCascadingUpdateField = any;
type SystemFieldMapping = any;
type SystemFieldMappingField = any;
type SpecialFieldType = any;

class ControlSettingGroup {
  TextBoxes: { [key: number]: SystemSettingForTextBox } = {};
  Numbers: { [key: number]: SystemSettingForNumber } = {};
  Buttons: { [key: number]: SystemSettingForButton } = {};
  EnumComboBoxes: { [key: number]: SystemSettingForEnumComboBox } = {};
  CustomEnumControls: { [key: number]: SystemSettingForCustomEnumControl } = {};
  ComboBoxes: { [key: number]: SystemSettingForComboBox } = {};
  DataGrids: { [key: number]: SystemSettingForDataGrid } = {};
  DateTimes: { [key: number]: SystemSettingForDateTime } = {};
  Panels: { [key: number]: SystemSettingForPanel } = {};
  StepProgressBars: { [key: number]: SystemSettingForStepProgressBar } = {};
}

class AttachGroup {
  /** Key: ViewUID */
  FeatureAttach: { [key: number]: SystemViewWithFeatureAttach } = {};
  /** Key: ControlUID */
  ControlDataGridAttach: { [key: number]: SystemControlDataGridAttach } = {};
}

class MechanismPrefab {
  /** Key: PageUID */
  CascadingUpdates: { [key: number]: SystemCascadingUpdate[] } = {};
  /** Key: CascadingUpdateUID */
  CascadingUpdateFields: { [key: number]: SystemCascadingUpdateField[]} = {};
  /** Key: FieldMappingUID */
  FieldMappings: { [key: number]: SystemFieldMapping[] } = {};
  FieldMappingFields: { [key: number]: SystemFieldMappingField[] } = {};
}

// 核心接口转换
export class DataGroup {
  /** Key: UID */
  PageByUid: { [key: number]: SystemPage } = {};
  /** Key: Name */
  PageByName: { [key: string]: SystemPage } = {};
  Views: { [key: number]: SystemView } = {};
  DataViews: { [key: number]: SystemDataView } = {};
  DataViewFields: { [key: number]: SystemDataViewField[] } = {};

  /** Key: TableName */
  TypeByTableName: { [key: string]: SystemType } = {};

  /** Key: UID */
  TypeByUid: { [key: number]: SystemType } = {};

  /** Key: TypeUid, FieldName */
  TypeFields: { [key: number]: { [fieldName: string]: SystemField } } = {};

  SettingGroup: ControlSettingGroup = new ControlSettingGroup();
  MechanismPrefab: MechanismPrefab = new MechanismPrefab();
  AttachGroup: AttachGroup = new AttachGroup();

  /** Key: 控件UID */
  ControlFieldAttachs: { [key: number]: SystemControlFieldAttach } = {};

  /** 特殊字段类型映射 */
  SpecialFields: { [key in SpecialFieldType]?: string[] } = {};

  /** Key: 单据头类型UID */
  BillInfos: { [key: number]: SystemBillInfo } = {};
}
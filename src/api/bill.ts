import api_helper from '../utils/api_helper';
import { getGlobalContext } from '@/utils/global';
import { ApiMessagePack } from './core/ApiMessagePack';
import { DbChangedPackResult } from './core/DbChangePackResult';
const context = getGlobalContext();

const Api = {
    getPreviousBillid: (tableName: string, billid: number): Promise<ApiMessagePack> => api_helper.get('/billapi/getpreviousbillid', { dbName: context.dbName, tableName, billid }) as Promise<ApiMessagePack>,
    getNextBillid: (tableName: string, billid: number): Promise<ApiMessagePack> => api_helper.get('/billapi/getnextbillid', { dbName: context.dbName, tableName, billid }) as Promise<ApiMessagePack>,
    generalBillSave: (tableName: string, bill: any, details: Array<any>): Promise<DbChangedPackResult> => api_helper.post('/billapi/generalbillsave', { DbName: context.dbName, TableName: tableName, User: context.userInfo, Bill: JSON.stringify(bill), Details: JSON.stringify(details) }) as Promise<DbChangedPackResult>,
    generalBillApproval: (tableName: string, billid: number, isApprove: boolean): Promise<ApiMessagePack> => api_helper.post('/billapi/generalbillapproval', { DbName: context.dbName, TableName: tableName, User: context.userInfo, BillId: billid, IsApprove: isApprove }) as Promise<ApiMessagePack>,
    generalBillDelete: (tableName: string, billid: number): Promise<DbChangedPackResult> => api_helper.post('/billapi/generalbilldelete', { DbName: context.dbName, TableName: tableName, User: context.userInfo, BillId: billid }) as Promise<DbChangedPackResult>,
    getBillDetails: (tableName: string, billid: number): Promise<ApiMessagePack> => api_helper.get('/billapi/getbilldetails', { dbName: context.dbName, tableName, billid }) as Promise<ApiMessagePack>,
}

export default Api
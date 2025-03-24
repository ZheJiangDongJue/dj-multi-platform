import api_helper from '../utils/api_helper';
import { getGlobalContext } from '@/utils/global';
import { ApiMessagePack } from './core/ApiMessagePack';
const context = getGlobalContext();

const Api = {
    /**用组装流程卡明细的id获取组装工序接收单 */
    getAssemblyProcessReceiveDocumentByProcessAssemblyFlowDetailId: (processAssemblyFlowDetailid: number): Promise<ApiMessagePack> => api_helper.get('/craftapi/getassemblyprocessreceivedocumentbyprocessassemblyflowdetailid', { dbName: context.dbName, processAssemblyFlowDetailid }) as Promise<ApiMessagePack>,
    /**用组装流程卡明细的id获取组装工序完工单 */
    getAssemblyProcessCompletionDocumentByProcessAssemblyFlowDetailId: (processAssemblyFlowDetailid: number): Promise<ApiMessagePack> => api_helper.get('/craftapi/getassemblyprocesscompletiondocumentbyprocessassemblyflowdetailid', { dbName: context.dbName, processAssemblyFlowDetailid }) as Promise<ApiMessagePack>,
    /**检查或创建组装流程卡 */
    checkOrCreateProcessAssemblyFlow: (innerKey: string, user: string): Promise<ApiMessagePack> => api_helper.get('/craftapi/checkorcreateprocessassemblyflow', { dbName: context.dbName, user, innerKey }) as Promise<ApiMessagePack>,
    /**获取组装流程卡下一个要接收的工序可接收数量 */
    getProcessAssemblyFlowNextReceiptDetailQty: (billid: number): Promise<ApiMessagePack> => api_helper.get('/craftapi/getprocessassemblyflownextreceiptdetailqty', { dbName: context.dbName, billid }) as Promise<ApiMessagePack>,
    /**获取组装流程卡下一个要完工的工序可完工数量 */
    getProcessAssemblyFlowNextCompletionDetailQty: (billid: number): Promise<ApiMessagePack> => api_helper.get('/craftapi/getprocessassemblyflownextcompletiondetailqty', { dbName: context.dbName, billid }) as Promise<ApiMessagePack>,
    /**组装流程卡明细接收 */
    receiveProcessAssemblyFlowDocument: (processAssemblyFlowDetailid: number): Promise<ApiMessagePack> => api_helper.post('/craftapi/receiveprocessassemblyflowdocument', { DbName: context.dbName, User: context.userInfo, Detailid: processAssemblyFlowDetailid }) as Promise<ApiMessagePack>,
    /**组装流程卡明细完工 */
    completeProcessAssemblyFlowDocument: (processAssemblyFlowDetailid: number): Promise<ApiMessagePack> => api_helper.post('/craftapi/completeprocessassemblyflowdocument', { DbName: context.dbName, User: context.userInfo, Detailid: processAssemblyFlowDetailid }) as Promise<ApiMessagePack>,
    /**组装流程卡批量接收 */
    processAssemblyFlowBatchReceipt: (billInfos: string): Promise<ApiMessagePack> => api_helper.post('/craftapi/processassemblyflowbatchreceiptwithdto', { DbName: context.dbName, User: context.userInfo, BillInfos: billInfos }) as Promise<ApiMessagePack>,
    /**组装流程卡批量完工 */
    processAssemblyFlowBatchCompletion: (billInfos: string): Promise<ApiMessagePack> => api_helper.post('/craftapi/processassemblyflowbatchcompletionwithdto', { DbName: context.dbName, User: context.userInfo, BillInfos: billInfos }) as Promise<ApiMessagePack>,
    /**准备并获取组装流程卡接收 */
    prepareAssemblyFlowCardReceive: (dailyPlanId: number): Promise<ApiMessagePack> => api_helper.post('/craftapi/prepareassemblyflowcardreceive', { DbName: context.dbName, User: context.userInfo, DailyPlanId: dailyPlanId }) as Promise<ApiMessagePack>,
    /**准备并获取组装流程卡完工 */
    prepareAssemblyFlowCardCompletion: (dailyPlanId: number): Promise<ApiMessagePack> => api_helper.post('/craftapi/prepareassemblyflowcardcompletion', { DbName: context.dbName, User: context.userInfo, DailyPlanId: dailyPlanId }) as Promise<ApiMessagePack>,
    /**批量接收组装工序接收单 */
    batchReceive: (items: any[]): Promise<ApiMessagePack> => api_helper.post('/craftapi/batchreceive', { DbName: context.dbName, User: context.userInfo, Items: items }) as Promise<ApiMessagePack>,
    /**批量完工组装工序完工单 */
    batchCompletion: (items: any[]): Promise<ApiMessagePack> => api_helper.post('/craftapi/batchcompletion', { DbName: context.dbName, User: context.userInfo, Items: items }) as Promise<ApiMessagePack>
}

export default Api
import Vue from 'vue';

const context = new Vue()

function Extend() {
    context.$EventBus.$on('OpenPreviousBill', (page_vm) => {
        
        page_vm.business.OpenBill(14);
        return;
        // if (this.page_vm == undefined) return;
        // var createTimeFieldNames = this.page_vm.rootDataGroup.SpecialFields[SpecialFieldType.CreateTime];
    })
    context.$EventBus.$on('NewBill', (page_vm) => {
        page_vm.business.NewBill();
    })
}
export default Extend
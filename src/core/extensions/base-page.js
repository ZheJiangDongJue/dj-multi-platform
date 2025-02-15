import Vue from 'vue';

const context = new Vue()

function Extend() {
    context.$EventBus.$on('Save', (page_vm) => {
        console.log(page_vm);
    })
    context.$EventBus.$on('Refresh', (page_vm) => {
        for (const [, value] of page_vm.nameToControlViewModel.entries()) {
            value.Refresh();
        }
    })
}
export default Extend
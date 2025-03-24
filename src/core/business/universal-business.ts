import UniversalPageViewModel from "../universal-page-vm";
import { BusinessBase } from "./business-base";

export class UniversalBusiness implements BusinessBase {
    page_vm: UniversalPageViewModel | undefined;

    constructor(page_vm: UniversalPageViewModel) {
        this.page_vm = page_vm;
    }

    setup(): void {
    }
}
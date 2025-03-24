import UniversalPageViewModel from "../universal-page-vm";

export interface BusinessBase {
    page_vm: UniversalPageViewModel | undefined;

    setup(): void;
}
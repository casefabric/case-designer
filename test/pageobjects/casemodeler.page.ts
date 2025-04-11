import { $ } from '@wdio/globals';
import idePage from './ide.page';

export class CaseModelerPage {
    public get shapebox() {
        return idePage.currentModelEditor.$(".shapebox");
    }
    public get modelList() {
        return $('.divModelList');
    }
}

export default new CaseModelerPage();

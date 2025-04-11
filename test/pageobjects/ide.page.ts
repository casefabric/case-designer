import { $ } from '@wdio/globals';
import Page from "./page";

export class IDEPage extends Page {
    public get currentModelEditor() {
        return $(`.model-editor-base[style*="display: block;"]`);
    }
    public modelEditor(modelName: string) {
        return $(`.model-editor-base[model="${modelName}"]`);
    }
    public get modelList() {
        return $('.divModelList');
    }
}

export default new IDEPage();

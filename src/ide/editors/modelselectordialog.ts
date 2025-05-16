import $ from "jquery";
import ModelDefinition from "../../repository/definition/modeldefinition";
import Repository from "../../repository/repository";
import ServerFile from "../../repository/serverfile/serverfile";
import Dialog from "../editors/dialog";
import IDE from "../ide";
import ModelEditorMetadata from "../modeleditor/modeleditormetadata";

export default class ModelSelectorDialog extends Dialog {
    selectedItem?: ServerFile<ModelDefinition>;
    repository: Repository;
    typeMetadata: ModelEditorMetadata;
    htmlDialog?: JQuery<HTMLElement>;
    constructor(public ide: IDE, label: string, public type: string, private currentFile?: ServerFile<ModelDefinition>) {
        super(ide, label);
        this.repository = ide.repository;
        this.selectedItem = undefined;
        this.typeMetadata = ModelEditorMetadata.types.find(meta => meta.fileType == this.type)!;
    }

    renderDialog(dialogHTML: JQuery<HTMLElement>) {
        this.htmlDialog = $(`
            <form class="model-selector">
                <div class="tree"></div>
                <br/>
                <input type="submit" class='buttonOk' value="OK"/>
                <button class='buttonCancel'>Cancel</button>
                <button class='buttonNew'>New ...</button>
            </form>
        `);
        dialogHTML.append(this.htmlDialog);
        this.repository.list
            .filter(file => file.fileType == this.type)
            .forEach(file => this.renderDefinition(file, dialogHTML.find('.tree')));
        dialogHTML.find('.buttonOk').on('click', e => this.ok());
        dialogHTML.find('.buttonCancel').on('click', e => this.cancel());
        dialogHTML.find('.buttonNew').on('click', e => this.newModel());
    }

    async newModel() {
        await this.typeMetadata.openCreateModelDialog((fileName: string) => {
            this.selectedItem = this.repository.getFile(fileName);
            this.closeModalDialog(this.selectedItem);
        });
    }

    renderDefinition(file: ServerFile<ModelDefinition>, container: JQuery<HTMLElement>) {
        const html = $(
            `<div>
                <div class='summary'>
                    <img class="icon" src="${this.typeMetadata?.icon}" />
                    ${file.name}
                </div>
            </div>`);
        container?.append(html);
        html.find('.summary').on('click', e => {
            container.find('.selected-model').removeClass('selected-model');
            this.selectedItem = file;
            $(e.target).addClass('selected-model');
        });
        html.find('.summary').on('dblclick', e => {
            this.ok();
        });

        const selected = file == this.currentFile;
        if (selected) {
            this.selectedItem = file;
            html.find('.summary').addClass('selected-model');
        }
    }

    ok() {
        this.closeModalDialog(this.selectedItem);
    }

    cancel() {
        this.closeModalDialog(undefined);
    }
}

import $ from "jquery";
import ModelDefinition from "../../repository/definition/modeldefinition";
import ServerFile from "../../repository/serverfile/serverfile";
import IDE from "../ide";
import ModelSelectorDialog from "./modelselectordialog";

export default class ModelSelectorControl extends HTMLElement {
    constructor(
        public ide: IDE,
        public selectedItem: ServerFile<ModelDefinition> | undefined,
        public modelType: string,
        public sourceModel: ModelDefinition,
        public modelChanged: (file: ServerFile<ModelDefinition> | null) => void) {
        super();

        this.render();
    }

    render() {
        const html = $(`<div class="modelselect" style="display: flex; align-items: center; justify-content: space-between;">
                            <input style='cursor: text; pointer-events: none' disabled id="modelImplementation" type="text" value="${this.selectedItem ? this.selectedItem.name : ''}"></input>
                            <img id="zoomButton" class="zoombt"></img>
                            <img id="removeButton" class="removeReferenceButton"></img>
                        </div>`);
        html.on('click', e => {
            new ModelSelectorDialog(this.ide, 'Select a model to be used as task implementation', this.modelType, this.selectedItem, this.sourceModel)
                .showModalDialog((file: ServerFile<ModelDefinition>) => {
                    if (file) {
                        this.modelChanged(file);
                    }
                });
        });
        html.find('#removeButton').on('click',
            e => {
                this.modelChanged(null);
            });
        // Also make the html a drop target for drag/dropping elements from the repository browser
        html.on('pointerover',
            e => this.ide.repositoryBrowser.setDropHandler(dragData => this.modelChanged(dragData.file),
                dragData => dragData.file.fileType == this.modelType));

        html.on('pointerout', e => this.ide.repositoryBrowser.removeDropHandler());
        $(this).append(html);
    }
}

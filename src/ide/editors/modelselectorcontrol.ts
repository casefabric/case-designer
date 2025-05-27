import $ from "jquery";
import ModelDefinition from "../../repository/definition/modeldefinition";
import ServerFile from "../../repository/serverfile/serverfile";
import ModelSelectorDialog from "./modelselectordialog";

export default class ModelSelectorControl extends HTMLElement {
    valueElement?: JQuery<HTMLInputElement>;
    constructor() {
        super();
    }

    connectedCallback() {
        const modelType = this.attributes.getNamedItem('modeltype')!.value;
        const sourceModelId = this.attributes.getNamedItem('sourcemodel')?.value;
        const selectedModelId = $(this).val() as string | undefined | null ?? undefined;

        const selectedModelName = selectedModelId ? window.ide.repository.get(selectedModelId)?.name : '';

        const html = $(`<div class="modelselect" style="display: flex; align-items: center; justify-content: space-between;">
                                <input class="modelselectvalue" style='cursor: text; pointer-events: none' disabled id="modelImplementation" type="text" value="${selectedModelName}"></input>
                                <img id="zoomButton" class="zoombt"></img>
                                <img id="removeButton" class="removeReferenceButton"></img>
                            </div>`);
        this.valueElement = html.find('.modelselectvalue');
        html.on('click', e => {
            new ModelSelectorDialog(
                'Select a model to be used as task implementation',
                modelType,
                selectedModelId,
                sourceModelId)
                .showModalDialog((file: ServerFile<ModelDefinition>) => {
                    if (file) {
                        this.changeValue(file);
                    }
                });
        });
        html.find('#removeButton').on('click', e => {
            this.changeValue(undefined);
            e.stopPropagation(); // Prevent the click event from propagating to the parent div
        });

        // Also make the html a drop target for drag/dropping elements from the repository browser
        html.on('pointerover',
            e => window.ide.repositoryBrowser.setDropHandler(
                dragData => this.changeValue(dragData.file),
                dragData => dragData.file.fileType == modelType));
        html.on('pointerout', e => window.ide.repositoryBrowser.removeDropHandler());

        $(this).append(html);
    }

    private changeValue(file?: ServerFile<ModelDefinition>) {
        this.valueElement!.val(file?.name ?? '');
        $(this).val(file?.fileName ?? '');
        $(this).trigger('change');
    }
}

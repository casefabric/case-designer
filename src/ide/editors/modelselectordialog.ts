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
    searchBox?: JQuery<HTMLElement>;
    selectionTree?: JQuery<HTMLElement>;

    constructor(public ide: IDE, label: string, public type: string, private currentFile?: ServerFile<ModelDefinition>) {
        super(ide, label);
        this.repository = ide.repository;
        this.selectedItem = undefined;
        this.typeMetadata = ModelEditorMetadata.types.find(meta => meta.fileType == this.type)!;
    }

    renderDialog(dialogHTML: JQuery<HTMLElement>) {
        this.htmlDialog = $(`
            <form class="model-selector dialog-content">
                <div class="selector-header">
                    <input type="text" class="search" placeholder="Search..."></input>
                    <button class="buttonNew">New...</button>
                </div>
                <div class="tree"></div>
            </form>
        `);
        dialogHTML.append(this.htmlDialog);
        this.selectionTree = dialogHTML.find('.tree');
        this.repository.list
            .filter(file => file.fileType == this.type)
            .forEach(file => this.renderDefinition(file, this.selectionTree!));

        //add events search model field
        this.searchBox = dialogHTML.find('.search');
        this.searchBox.on('keyup', e => this.applySearchFilter(e));
        this.searchBox.on('keydown', e => this.executeSearchFilter(e));

        dialogHTML.find('.buttonNew').on('click', e => {
            e.preventDefault();
            this.newModel();
        });
    }

    /**
         * Runs the search text agains the models currently rendered, and hides them if not matching the search criteria
         */
    applySearchFilter(e: JQuery.KeyUpEvent) {
        const searchText = this.searchBox?.val()?.toString().toLowerCase();
        // Loop through all elements, and search for the text. The elements look like <a filetype="case" name="hcmtest" href="...">hcmtest</a>
        this.selectionTree?.find('.summary').toArray().forEach(htmlElement => {
            const modelName = htmlElement.textContent?.toLowerCase();
            const containsSearchText = this.hasSearchText(searchText, modelName);
            if (htmlElement.parentElement) {
                htmlElement.parentElement.style.display = containsSearchText ? 'block' : 'none';
            }
        });
    }

    /**
     * Determines recursively whether each character of text1 is available in text2
     */
    hasSearchText(searchFor?: string, searchIn?: string): boolean {
        if (!searchFor) { // Nothing left to search for, so found a hit
            return true;
        }
        if (!searchIn) { // Nothing left to search in, so did not find it.
            return false;
        }
        const index = searchIn.indexOf(searchFor.charAt(0));
        if (index < 0) { // Did not find any results, so returning false.
            return false;
        }
        // Continue the search in the remaining parts of text2
        const remainingText2 = searchIn.substring(index + 1, searchIn.length);
        const remainingText1 = searchFor.substring(1);
        return this.hasSearchText(remainingText1, remainingText2);
    }

    /**
     * This function executes the search filter with a follow-up action.
     * On tab, select the first model.
     * On enter, open the first model.
     * On escape, remove the search filter.
     */
    executeSearchFilter(e: JQuery.KeyDownEvent) {
        const first = this.selectionTree?.find('.summary').toArray().find(element => $(element).parent().css('display') == 'block')
        if (e.keyCode == 9) { // Pressed Tab key, let's focus on first search result
            if (first) {
                $(first).trigger('click');
                e.stopPropagation();
                e.preventDefault();
            }
        } else if (e.keyCode == 13) { // Pressed Enter key, let's open the first search result
            if (first) {
                $(first).trigger('click');
                $(first).trigger('dblclick');
                e.stopPropagation();
            }
        }
    }
    /**
     * Removes the active search filtering from the model list.
     */
    removeSearchFilter() {
        this.searchBox?.val('');
        this.searchBox?.find('.summary').css('display', 'block');
    }



    async newModel() {
        const oldCallback = this.callback!; // Save the old callback

        this.callback = async (item: undefined) => {
            await this.typeMetadata.openCreateModelDialog((fileName: string) => {
                if (fileName) {
                    this.selectedItem = this.repository.getFile(fileName);
                    oldCallback(this.selectedItem);
                }
            });

        }
        this.closeModalDialog(undefined);
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

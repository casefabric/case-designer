import $ from "jquery";
import "jquery-ui";
import ModelDefinition from "../../repository/definition/modeldefinition";
import Repository from "../../repository/repository";
import ServerFile from "../../repository/serverfile/serverfile";
import DragData from "../dragdrop/dragdata";
import ServerFileDragData from "../dragdrop/serverfiledragdata";
import IDE from "../ide";
import ModelEditorMetadata from "../modeleditor/modeleditormetadata";
import Images from "../util/images/images";
import ModelListPanel from "./modellistpanel";

export default class RepositoryBrowser {
    repository: Repository;
    panels: ModelListPanel[] = [];
    dragData?: ServerFileDragData;
    accordion: JQuery<HTMLElement>;
    searchBox: JQuery<HTMLElement>;
    /**
     * This object handles the model browser pane on the left
     */
    constructor(public ide: IDE, public html: JQuery<HTMLElement>) {
        this.repository = this.ide.repository;
        this.html.append(
            `<div class="divModelList basicform">
                <div class="formheader">
                    <label>Repository</label>
                    <div class="btnRefresh" title="Refresh the model list">
                        <img src="${Images.Refresh}" />
                    </div>
                </div>
                <div class="formfooter">
                    <div class="divSearchBox">
                        <input style='width:100%' placeholder="Search" />
                    </div>
                </div>
                <div class="formcontainer">
                    <div class="divAccordionList">
                    </div>
                </div>
            </div>`);

        //set accordion for the various types of model lists
        this.accordion = this.html.find('.divAccordionList');
        this.accordion.accordion({
            heightStyle: 'fill',
            animate: false
        });

        //add events search model field
        this.searchBox = this.html.find('.divSearchBox input');
        this.searchBox.on('keyup', e => this.applySearchFilter(e));
        this.searchBox.on('keydown', e => this.executeSearchFilter(e));

        // Attach window resize handler and subsequently refresh the accordion
        $(window).on('resize', () => this.accordion.accordion('refresh'));

        //set refresh handle on click
        this.html.find('.btnRefresh').on('click', () => {
            this.repository.listModels().then(() => this.searchBox.val('')).catch(message => this.ide.danger(message, 5000));
        });

        // Add handler for hash changes, that should load the new model
        $(window).on('hashchange', () => this.loadModelFromBrowserLocation());

        // Now load the repository contents, and after that optionally load the first model
        this.repository.listModels().then(() => this.loadModelFromBrowserLocation()).catch(msg => this.ide.danger(msg, 5000));

        ModelEditorMetadata.types.forEach(type => type.init(this));
    }

    createModelListPanel(type: ModelEditorMetadata) {
        const panel = new ModelListPanel(this, this.accordion, type);
        this.panels.push(panel);
        return panel;
    }

    startDrag(file: ServerFile, shapeImg: string) {
        this.dragData = new ServerFileDragData(this, file, shapeImg);
    }

    /**
     * Registers a drop handler with the repository browser.
     * If an item from the browser is moved over the canvas, elements can register a drop handler
     */
    setDropHandler(dropHandler: (dragData: ServerFileDragData) => void, filter?: ((dragData: ServerFileDragData) => boolean)) {
        if (this.dragData) this.dragData.setDropHandler(<(dragData: DragData) => void>dropHandler, <(dragData: DragData) => boolean>filter);
    }

    /**
     * Removes the active drop handler and filter
     */
    removeDropHandler() {
        if (this.dragData) this.dragData.removeDropHandler();
    }

    /**
     * Checks the window.location hash and loads the corresponding model.
     */
    loadModelFromBrowserLocation() {
        this.refreshAccordionStatus();

        // Ask the IDE to open the model.
        this.ide.editorRegistry.open(this.currentFileName);
    }

    get currentFileName() {
        // Splice: take "myMap/myModel.case" out of something like "http://localhost:2081/#myMap/myModel.case"
        //  Skip anything that is behind the optional question mark
        return window.location.hash.slice(1).split('?')[0];
    }

    refreshAccordionStatus() {
        // Select the currently opened model. Should we also open the right accordion with it?
        //  Also: this logic must also be invoked when we refresh the contents of the accordion.
        //  That requires that we also know what the current model is.
        this.accordion.find('.model-item').removeClass('modelselected');
        this.accordion.find('.model-item[fileName="' + this.currentFileName + '"]').addClass('modelselected');
        // Also select the corresponding accordion tab
        $(this.accordion.find('.model-item[fileName="' + this.currentFileName + '"]').closest('.file-container')).prev('h3')[0]?.click();
    }

    /**
     * returns true when the modelName is valid
     */
    isValidEntryName(entryName: string) {
        if (!entryName || entryName == '') {
            this.ide.danger('Please enter a name for the model.');
        } else if (/\s/.test(entryName)) {
            this.ide.danger('The model name should not contain spaces');
        } else if (!/^[a-zA-Z0-9_/]+$/.test(entryName)) {
            this.ide.danger('The model name should not contain invalid characters (like !@#$%^&* etc)');
        } else {
            // Everything ok then, return true;
            return true;
        }
        // Something in the above tests was wrong, otherwise we would not have reached this point. So return false.
        return false;
    }

    /**
     * Runs the search text agains the models currently rendered, and hides them if not matching the search criteria
     */
    applySearchFilter(e: JQuery.KeyUpEvent) {
        const searchText = this.searchBox.val()?.toString().toLowerCase();
        // Loop through all elements, and search for the text. The elements look like <a filetype="case" name="hcmtest" href="...">hcmtest</a>
        this.accordion.find('a').toArray().forEach(htmlElement => {
            const modelName = htmlElement.textContent?.toLowerCase();
            const containsSearchText = this.hasSearchText(searchText, modelName);
            if (htmlElement.parentElement) htmlElement.parentElement.style.display = containsSearchText ? 'block' : 'none';
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
        const first = this.accordion.find('a').toArray().find(element => $(element).parent().css('display') == 'block')
        if (e.keyCode == 9) { // Pressed Tab key, let's focus on first search result
            if (first) {
                $(first).trigger('focus');
                e.stopPropagation();
                e.preventDefault();
            }
        } else if (e.keyCode == 27) { // Pressed Escape key, let's undo the search filter
            this.removeSearchFilter();
        } else if (e.keyCode == 13) { // Pressed Enter key, let's open the first search result
            if (first) {
                window.location.hash = ($(first).attr('name') + '.' + $(first).attr('filetype'));
            }
        }
    }

    /**
     * Removes the active search filtering from the model list.
     */
    removeSearchFilter() {
        this.searchBox.val('');
        this.accordion.find('div').css('display', 'block');
    }

    async delete(file: ServerFile, fromModel: ModelDefinition | undefined = undefined) {
        const usage = fromModel
            ? file.usage.filter(x => x.definition?.id != fromModel.id)
            : file.usage;

        if (usage.length) {
            this.ide.danger(`Cannot delete '${file.fileName}' because the model is used in ${usage.length} other model${usage.length == 1 ? '' : 's'}<p></p>` +
                `${usage.length ? usage.map(u => '- ' + u.fileName).join('<p></p>') : ''}`);
        } else {
            const text = `Are you sure you want to delete '${file.fileName}'?`;
            if (confirm(text) === true) {
                await this.ide.repository.delete(file.fileName);
                // Tell editor registry to remove any editors for this file.
                this.ide.editorRegistry.remove(file.fileName);
            }
        }
    }

    async rename(file: ServerFile) {
        const prompter = (previousProposal: string = ''): string | null => {
            const warningMsg = previousProposal !== file.name ? `\n   ${file.fileType} '${previousProposal}' already exists` : '';
            const text = `Specify a new name for ${file.fileType} '${file.name}'${warningMsg}`;
            const newName = prompt(text, previousProposal);
            if (newName && newName !== file.name && this.ide.repository.hasFile(newName + '.' + file.fileType)) {
                return prompter(newName)
            } else {
                return newName;
            }
        }
        // const text = `Specify a new name for ${this.type} '${file.name}'`;
        const newName = prompter(file.name);
        if (!newName) {
            // User canceled the rename action.
            return;
        }
        const oldName = file.name;
        const oldFileName = file.fileName;
        if (newName == oldName) {
            // No need to update any information to the client, it is simply the same name
            return;
        } else {
            if (this.isValidEntryName(newName)) {
                const newFileName = newName + '.' + file.fileType;
                if (this.ide.repository.hasFile(newFileName)) {
                    this.ide.danger(`Cannot rename ${file.fileName} to ${newFileName} as that name already exists`, 3000);
                    return;
                }
                await file.rename(newFileName);
                // Check if the file that is being renamed is currently visible, and if so, change the hash and refresh the editor
                if (this.currentFileName === oldFileName) {
                    window.location.hash = newFileName;
                    if (this.ide.editorRegistry.currentEditor) {
                        this.ide.editorRegistry.currentEditor.refresh();
                    }
                }
                file.usage.forEach(usingFile => {
                    const editor = this.ide.editorRegistry.editors.find(editor => editor.file === usingFile);
                    if (editor) {
                        editor.refresh();
                    }
                });
            }
        }

    }
}

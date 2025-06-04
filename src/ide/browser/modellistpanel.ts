import $ from "jquery";
import "jquery-ui";
import IDE from "../ide";
import ModelEditorMetadata from "../modeleditor/modeleditormetadata";
import Images from "../util/images/images";
import ModelListItem from "./modellistitem";
import RepositoryBrowser from "./repositorybrowser";

export default class ModelListPanel {
    ide: IDE;
    htmlPanel: JQuery<HTMLElement>;
    container: JQuery<HTMLElement>;
    items: ModelListItem[] = [];

    constructor(public repositoryBrowser: RepositoryBrowser, public accordion: JQuery<HTMLElement>, public type: ModelEditorMetadata) {
        this.accordion = accordion;
        this.repositoryBrowser = repositoryBrowser;
        this.ide = repositoryBrowser.ide;
        this.type = type;

        this.htmlPanel = $(
            `<h3 filetype="${type.fileType}">${type.description}
                <img class="plus-icon" src="${Images.Plus}" title="Create new ${type} ..."/>
            </h3>
            <div><div class="file-container file-list-${type.fileType}"></div></div>`);

        this.accordion.append(this.htmlPanel);
        this.accordion.accordion('refresh');
        this.container = this.htmlPanel.find('.file-container');
        this.htmlPanel.find('.plus-icon').on('click', e => this.create(e));

        this.ide.repository.onListRefresh(() => this.setModelList());
    }

    /**
     * Re-creates the items in the accordion for this panel
     * 
     */
    setModelList() {
        const files = this.type.modelList;
        // Drop all items that are not in the list
        this.items.filter(item => files.findIndex(file => file.fileName === item.file.fileName) === -1).forEach(item => item.removeItem());
        // Refresh existing items (sets the color to red if there is an error)
        this.items.forEach(item => item.refresh());

        // First create a big HTML string with for each model an <a> element
        let previous: ModelListItem | undefined;
        files.forEach(file => {
            const item = this.items.find(item => item.file.fileName === file.fileName);
            if (item !== undefined) {
                previous = item;
            } else {
                const newItem = new ModelListItem(this, file, previous);
                if (previous) {
                    previous.html.after(newItem.html);
                }
                else {
                    this.container.append(newItem.html);
                }
                previous = newItem;
            }
        });

        this.repositoryBrowser.refreshAccordionStatus();
    }

    /**
     * Creates a new model based on name
     */
    async create(e: JQuery.ClickEvent<HTMLElement, undefined, HTMLElement, HTMLElement>) {
        e.stopPropagation();
        return this.type.openCreateModelDialog();
    }
}

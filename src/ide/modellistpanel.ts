import $ from "jquery";
import "jquery-ui";
import ModelDefinition from "../repository/definition/modeldefinition";
import ServerFile from "../repository/serverfile/serverfile";
import IDE from "./ide";
import ModelEditorMetadata from "./modeleditor/modeleditormetadata";
import RepositoryBrowser from "./repositorybrowser";
import HtmlUtil from "./util/htmlutil";
import Images from "./util/images/images";

export default class ModelListPanel {
    ide: IDE;
    htmlPanel: JQuery<HTMLElement>;
    container: JQuery<HTMLElement>;

    constructor(public repositoryBrowser: RepositoryBrowser, public accordion: JQuery<HTMLElement>, public type: ModelEditorMetadata) {
        this.accordion = accordion;
        this.repositoryBrowser = repositoryBrowser;
        this.ide = repositoryBrowser.ide;
        this.type = type;

        this.htmlPanel = $(
            `<h3 filetype="${type.fileType}">${type.description}
                <img class="plus-icon" src="${Images.Plus}" title="Create new ${type} ..."/>
            </h3>
            <div class="file-container file-list-${type.fileType}"></div>`);

        this.accordion.append(this.htmlPanel);
        this.accordion.accordion('refresh');
        this.container = this.accordion.find('.file-list-' + type.fileType);
        this.htmlPanel.find('.plus-icon').on('click', e => this.create(e));

        this.ide.repository.onListRefresh(() => this.setModelList());
    }

    /**
     * Re-creates the items in the accordion for this panel
     * 
     */
    setModelList() {
        const files = this.type.modelList;
        // First create a big HTML string with for each model an <a> element
        const urlPrefix = window.location.origin + window.location.pathname + '#';

        // Clean current file list
        HtmlUtil.clearHTML(this.container);

        files.forEach(file => {
            const error = file.metadata.error;
            const usageTooltip = `${file.name} used in ${file.usage.length} other model${file.usage.length == 1 ? '' : 's'}\n${file.usage.length ? file.usage.map(u => '- ' + u.fileName).join('\n') : ''}`;
            const tooltip = error ? error : usageTooltip;
            const nameStyle = error ? 'style="color:red"' : '';
            const modelURL = urlPrefix + file.fileName;
            const optionalDeployIcon = this.type.supportsDeploy ? `<img class="action-icon deploy-icon" src="${Images.Deploy}" title="Deploy ${file.name} ..."/>` : '';
            const html = $(`<div class="model-item" title="${tooltip}" fileName="${file.fileName}">
                                <img class="menu-icon" src="${this.type.icon}" />
                                <a name="${file.name}" fileType="${file.fileType}" href="${modelURL}"><span ${nameStyle}>${file.name}</span></a>
                                <img class="action-icon delete-icon" src="${Images.Delete}" title="Delete model ..."/>
                                <img class="action-icon rename-icon" src="${Images.Rename}" title="Rename model ..."/>
                                ${optionalDeployIcon}
                            </div>`);
            this.container.append(html);
            // Add event handler for dragging.
            html.on('pointerdown', e => {
                e.preventDefault();
                e.stopPropagation();
                this.repositoryBrowser.startDrag(file, this.type.icon);
            });
            html.find('.delete-icon').on('click', e => this.delete(file));
            html.find('.rename-icon').on('click', e => this.rename(file));
            html.find('.deploy-icon').on('click', e => this.deploy(file));
        });

        this.repositoryBrowser.refreshAccordionStatus();
    }

    /**
     * Delete a file, when a .case file is deleted also delete the .dimensions file. 
     */
    async delete(file: ServerFile<ModelDefinition>) {
        await this.repositoryBrowser.delete(file);
    }

    /**
     * Rename a file
     * all references to the model in other models will be renamed as well.
     */
    async rename(file: ServerFile<ModelDefinition>) {
        await this.repositoryBrowser.rename(file);
    }

    deploy(file: ServerFile<ModelDefinition>) {
        window.location.hash = file.fileName + '?deploy=true';
    }

    /**
     * Creates a new model based on name
     */
    async create(e: JQuery.ClickEvent<HTMLElement, undefined, HTMLElement, HTMLElement>) {
        e.stopPropagation();
        return this.type.openCreateModelDialog();
    }
}

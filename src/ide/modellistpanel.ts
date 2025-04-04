import $ from "jquery";
import "jquery-ui";
import ModelDefinition from "../repository/definition/modeldefinition";
import ServerFile from "../repository/serverfile/serverfile";
import IDE from "./ide";
import ModelEditorMetadata from "./modeleditor/modeleditormetadata";
import RepositoryBrowser from "./repositorybrowser";
import HtmlUtil from "./util/htmlutil";
import Images from "./util/images/images";
import treecontrols, { branchIdAttribute, collapsedClass, expanderClass, parentBranchIdAttribute } from "./util/treecontrols";

export default class ModelListPanel {
    ide: IDE;
    htmlPanel: JQuery<HTMLElement>;
    container: JQuery<HTMLElement>;

    private urlPrefix = window.location.origin + window.location.pathname + '#';


    constructor(public repositoryBrowser: RepositoryBrowser, public accordion: JQuery<HTMLElement>, public type: ModelEditorMetadata) {
        this.accordion = accordion;
        this.repositoryBrowser = repositoryBrowser;
        this.ide = repositoryBrowser.ide;
        this.type = type;

        this.htmlPanel = $(
            `<h3 filetype="${type.fileType}">${type.description}
                <img class="plus-icon" src="${Images.Plus}" title="Create new ${type} ..."/>
            </h3>
            <div class="file-container file-list-${type.fileType}"/>`);

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

        // Clean current file list
        HtmlUtil.clearHTML(this.container);


        const rootFolder = new Branch("root", "root");
        files.map(file => {
            const fileNameFolderParts: string[] = file.fileName.split('\\');
            let fileFolder = rootFolder;

            fileNameFolderParts
                .slice(0, fileNameFolderParts.length - 1)
                .forEach(fileNamePart => {
                    let folder = fileFolder.folders.find(folder => folder.name === fileNamePart);
                    if (folder == undefined) {
                        folder = new Branch(fileNamePart, fileFolder.id + "/" + fileNamePart, fileFolder.level + 1);
                        fileFolder.folders.push(folder);
                    }
                    fileFolder = folder;
                });
            fileFolder.files.push(file);
        })


        rootFolder.folders.forEach(subFolder => this.renderFolder(subFolder, rootFolder));
        rootFolder.files.forEach(file => this.renderFile(file, rootFolder));

        treecontrols(this.container);

        ModelListPanel.selectModel(this.repositoryBrowser.accordion, this.repositoryBrowser.currentFileName);
    }


    static selectModel(accordion: JQuery<HTMLElement>, currentFileName: string) {
        // Select the currently opened model. Should we also open the right accordion with it?
        //  Also: this logic must also be invoked when we refresh the contents of the accordion.
        //  That requires that we also know what the current model is.
        accordion.find('.model-item').removeClass('modelselected');
        accordion.find(`.model-item[fileName="${HtmlUtil.cssEscape(currentFileName)}"]`).addClass('modelselected');
        // Also select the corresponding accordion tab
        const $container = $(accordion.find(`.model-item[fileName="${HtmlUtil.cssEscape(currentFileName)}"]`).closest('.file-container'));
        $container.prev('h3')[0]?.click();

        // and open the tree
        const name = currentFileName;
        const nameParts = name.split('\\');
        const folderParts = nameParts.slice(0, nameParts.length - 1);
        let currentFolderId = "root";
        folderParts.forEach(folderName => {
            currentFolderId += `/${folderName}`
            var $currentFolderElement = $container.find(`.model-folder[${branchIdAttribute}="${currentFolderId}"]`);
            const $expander = $currentFolderElement.find(`.${expanderClass}`);
            if ($expander.hasClass(collapsedClass)) {
                $currentFolderElement.trigger("click");
            }
        });
    }

    renderFolder(folder: Branch, parent?: Branch) {
        const html = $(
            `<div class="model-folder" style="padding-left: ${15 * folder.level}px;" 
                ${branchIdAttribute}=${folder.id} ${parentBranchIdAttribute}=${parent?.id} title="${folder.name}" fileName="${folder.name}">
                <span class="foldername">${folder.name}</span>
            </div>`);
        this.container.append(html);

        folder.folders.forEach(subFolder => this.renderFolder(subFolder, folder));
        folder.files.forEach(file => this.renderFile(file, folder));
    }

    renderFile(file: ServerFile<ModelDefinition>, parent?: Branch) {
        const error = file.metadata.error;
        const usageTooltip = `${file.name} used in ${file.usage.length} other model${file.usage.length == 1 ? '' : 's'}\n${file.usage.length ? file.usage.map(u => '- ' + u.fileName).join('\n') : ''}`;
        const tooltip = error ? error : usageTooltip;
        const nameStyle = error ? 'style="color:red"' : '';
        const modelURL = this.urlPrefix + file.fileName;
        const optionalDeployIcon = this.type.supportsDeploy ? `<img class="action-icon deploy-icon" src="${Images.Deploy}" title="Deploy ${file.name} ..."/>` : '';

        const simpleFileName = file.name.split('/').join("\\").split('\\').pop();
        const html = $(`<div class="model-item" ${parentBranchIdAttribute}=${parent?.id} title="${tooltip}" fileName="${file.fileName}">
                            <span style="padding-left: ${15 * (parent?.level ?? 0) + 10}px;" >
                                <img class="menu-icon" src="${this.type.icon}" />
                                <a name="${file.name}" fileType="${file.fileType}" href="${modelURL}">
                                    <span ${nameStyle}>${simpleFileName}</span>
                                </a>
                            </span>
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

    }

    /**
     * Delete a file, when a .case file is deleted also delete the .dimensions file. 
     */
    async delete(file: ServerFile<ModelDefinition>) {
        if (file.usage.length) {
            this.ide.danger(`Cannot delete '${file.fileName}' because the model is used in ${file.usage.length} other model${file.usage.length == 1 ? '' : 's'}\n${file.usage.length ? file.usage.map(u => '- ' + u.fileName).join('\n') : ''}`);
        } else {
            const text = `Are you sure you want to delete '${file.fileName}'?`;
            if (confirm(text) === true) {
                await this.ide.repository.delete(file.fileName);
                if (file.fileType === 'case') {
                    // When we delete a .case model we also need to delete the .dimensions
                    await this.ide.repository.delete(file.name + '.dimensions');
                }
                // Tell editor registry to remove any editors for this file.
                this.ide.editorRegistry.remove(file.fileName);
            }
        }
    }

    /**
     * Rename a file
     * all references to the model in other models will be renamed as well.
     */
    async rename(file: ServerFile<ModelDefinition>) {
        const prompter = (previousProposal: string = ''): string | null => {
            const warningMsg = previousProposal !== file.name ? `\n   ${this.type} '${previousProposal}' already exists` : '';
            const text = `Specify a new name for ${this.type} '${file.name}'${warningMsg}`;
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
            if (this.repositoryBrowser.isValidEntryName(newName)) {
                const newFileName = newName + '.' + file.fileType;
                if (this.ide.repository.hasFile(newFileName)) {
                    this.ide.danger(`Cannot rename ${file.fileName} to ${newFileName} as that name already exists`, 3000);
                    return;
                }
                await file.rename(newFileName);
                // Check if the file that is being renamed is currently visible, and if so, change the hash and refresh the editor
                if (this.repositoryBrowser.currentFileName === oldFileName) {
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
class Branch {
    files: ServerFile<ModelDefinition>[] = [];
    folders: Branch[] = [];

    constructor(public name: string, public id: string, public level: number = 0) { }
}

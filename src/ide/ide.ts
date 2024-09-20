'use strict';
import ModelEditorRegistry from "./modeleditor/modeleditorregistry";
import Importer from "@repository/import/importer";
import Repository from "@repository/repository";
import $ from "jquery";
import CoverPanel from "./coverpanel";
import IDEFooter from "./idefooter";
import IDEHeader from "./ideheader";
import IDEMain from "./idemain";
import MessageBox from "./messagebox";
import ModelEditor from "./modeleditor/modeleditor";
import ModelEditorMetadata from "./modeleditor/modeleditormetadata";
import RepositoryBrowser from "./repositorybrowser";
import SettingsEditor from "./settings/settingseditor";

export default class IDE {
    editors: Array<ModelEditor> = [];
    editorRegistry: ModelEditorRegistry;
    repository: Repository;
    html: JQuery<HTMLElement>;
    header: IDEHeader;
    main: IDEMain;
    footer: IDEFooter;
    messageBox: MessageBox;
    coverPanel: CoverPanel;
    settingsEditor: SettingsEditor;
    private _dragging: any;

    constructor() {
        this.editorRegistry = new ModelEditorRegistry(this);
        this.repository = new Repository();
        this.html = $('body');
        this.header = new IDEHeader(this);
        this.main = new IDEMain(this);
        this.footer = new IDEFooter(this);
        this.messageBox = new MessageBox(this);
        this.coverPanel = new CoverPanel(this); // Helper to show/hide status messages while loading models from the repository
        this.settingsEditor = new SettingsEditor(this);

        // Repository object handles the interaction with the server
        this.html.on('keydown', e => {
            if (e.which == 83 && e.altKey) { // ALT S
                this.settingsEditor.show();
            }
        });

        // Scan for pasted text. It can upload and re-engineer a deployed model into a set of files
        this.html.on('paste', e => this.handlePasteText(e))
    }

    back() {
        // Simplistic. Buggy. But nice and simple for now. Better would be to hash all locations we've been and go back properly
        history.back();
    }

    handlePasteText(e: JQuery.TriggeredEvent) {
        const pastedText = (<any>e).originalEvent.clipboardData.getData('text/plain');
        const importer = new Importer(this.repository, pastedText);
        if (importer.files.length > 0) {
            console.log(`Found ${importer.files.length} files to import`)
            const fileNames = importer.files.map(file => file.fileName);
            if (confirm('Press OK to upload the following ' + fileNames.length + ' files\n\n- ' + (fileNames.join('\n- ')))) {
                importer.uploadFiles();
            }
        }
    }

    get repositoryBrowser(): RepositoryBrowser {
        return this.main.repositoryBrowser;
    }

    /** @returns {JQuery<HTMLElement>} The element in which the editors can be added */
    get divModelEditors() {
        return this.main.divModelEditors;
    }

    /**
     * @returns Determines if someone is drag/dropping an item across the IDE.
     */
    get dragging(): boolean {
        return this._dragging;
    }

    set dragging(dragging) {
        this._dragging = dragging;
    }

    /**
     * 
     * @returns fileName of the new model
     */
    createNewModel(modelType: string, newModelName: string, newModelDescription: string, callback: Function): string | undefined {
        const editorMetadata = ModelEditorMetadata.types.find(type => type.modelType == modelType);
        if (!editorMetadata) {
            const msg = 'Cannot create new models of type ' + modelType;
            console.error(msg);
            this.danger(msg);
            return;
        }
        return editorMetadata.createNewModel(this, newModelName, newModelDescription, callback);
    }

    /**
     * Shows a green success message.
     * @param message text to be displayed
     * @param delay message is automatically remove after this number of microsec  
     */
    success(message: string, delay = 0) {
        this.messageBox.createMessage(message, 'success', delay);
    }

    /** 
     * Shows a blue info message.
     * @param message text to be displayed
     * @param delay message is automatically remove after this number of microsec  
     */
    info(message: string, delay = 0) {
        this.messageBox.createMessage(message, 'info', delay);
    }

    /** 
     * Shows a yellow warning message.
     * @param message text to be displayed
     * @param delay message is automatically remove after this number of microsec  
     */
    warning(message: string, delay = 0) {
        this.messageBox.createMessage(message, 'warning', delay);
    }

    /** 
     * Shows a red danger message.
     * @param message text to be displayed
     * @param delay message is automatically remove after this number of microsec  
     */
    danger(message: string, delay = 0) {
        this.messageBox.createMessage(message, 'danger', delay);
    }
}

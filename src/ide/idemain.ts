import $ from "jquery";
import ServerFile from "../repository/serverfile/serverfile";
import RepositoryBrowser from "./browser/repositorybrowser";
import CoverPanel from "./coverpanel";
import IDE from "./ide";
import CaseModelEditor from "./modeleditor/case/casemodeleditor";
import HumantaskModelEditor from "./modeleditor/humantask/humantaskmodeleditor";
import ModelEditor from "./modeleditor/modeleditor";
import ModelEditorMetadata from "./modeleditor/modeleditormetadata";
import ProcessModelEditor from "./modeleditor/process/processmodeleditor";
import TypeModelEditor from "./modeleditor/type/typemodeleditor";
import ModelTabs from "./modeltabs";
import LeftSplitter from "./splitter/leftsplitter";

export default class IDEMain {
    html: JQuery<HTMLElement>;
    repositoryBrowser: RepositoryBrowser;
    private divModelEditors: JQuery<HTMLElement>;
    private tabs: ModelTabs;
    coverPanel: CoverPanel;
    editors: Array<ModelEditor> = [];

    /**
     * Constructs the footer of the IDE element.
     */
    constructor(public ide: IDE) {
        this.ide = ide;
        this.registerEditors();
        this.html = $(
            `<div class="ide-main" id="ideMain">
                <div class="repository-browser basicbox"></div>
                <div class="model-editors">
                    <div class='model-tabs'></div>
                    <div class='editors'></div>
                </div>
            </div>`
        );
        this.ide.html.append(this.html);

        // Now set the pointers on the this object;
        this.repositoryBrowser = new RepositoryBrowser(ide, this.html.find('.repository-browser'));
        this.divModelEditors = this.html.find('.editors');
        this.coverPanel = new CoverPanel(this, this.html.find('.model-editors'), 'main'); // Helper to show/hide status messages while loading models from the repository
        this.tabs = new ModelTabs(this, this.html.find('.model-tabs'));

        // Make a splitter between repository browser and the fixed editors div; it should also reposition the case model editor's splitter each time
        new LeftSplitter(this.html, '15%');

        // Add handler for hash changes, that should load the new model
        $(window).on('hashchange', () => this.loadModelFromBrowserLocation());

        // Now load the repository contents, and after that optionally load the first model
        this.ide.repository.listModels().then(() => this.loadModelFromBrowserLocation()).catch(msg => this.ide.danger(msg, 5000));
    }

    /**
     * Checks the window.location hash and loads the corresponding model.
     */
    private loadModelFromBrowserLocation() {
        this.ide.navigator.navigate(window.location.hash);
        this.open(this.currentFileName);
        this.repositoryBrowser.refreshAccordionStatus(this.ide.navigator.hash.fileName);
    }

    get currentFileName() {
        // Splice: take "myMap/myModel.case" out of something like "http://localhost:2081/#myMap/myModel.case"
        //  Skip anything that is behind the optional question mark
        return this.ide.navigator.hash.fileName;
    }

    private registerEditors() {
        // Register the known editors, e.g. HumanTaskEditor, CaseModelEditor, ProcessModelEditor
        CaseModelEditor.register();
        HumantaskModelEditor.register();
        ProcessModelEditor.register();
        TypeModelEditor.register();
    }

    private addEditor<ME extends ModelEditor>(editor: ME): ME {
        this.editors.push(editor);
        this.tabs.addTab(editor);
        this.divModelEditors.append(editor.html);
        return editor;
    }

    private showEditor(editor: ModelEditor) {
        editor.visible = true;
        this.tabs.select(editor);
    }

    /**
     * Return the editor that renders the file, or undefined if that editor is not found.
     * Casts the return value to the given type for ease of use
     * @param file 
     * @returns 
     */
    getEditor<M extends ModelEditor>(file: ServerFile): M | undefined {
        return <M>this.editors.find(editor => editor.file.fileName === file.fileName);
    }

    /** 
     * Returns the editor that is currently active, if any
     */
    get currentEditor(): ModelEditor | undefined {
        return this.editors.find(editor => editor.visible);
    }

    /**
     * Determines the type of the file name and opens the corresponding editor.
     */
    open(fileName: string) {
        if (!fileName) {
            // Simply no model to load; but hide all existing editors.
            this.editors.forEach(editor => editor.visible = false);
            this.coverPanel.show('Please, open or create a model.');
            return;
        }

        const serverFile = this.ide.repository.get(fileName);
        if (!serverFile) {
            this.ide.danger(`File ${fileName} does not exist and cannot be opened`, 2000);
            if (this.editors.length === 0) {
                this.coverPanel.show('Please, open or create a model.');
            }
            return;
        }

        const editorMetadata = ModelEditorMetadata.types.find(type => type.supportsFile(serverFile));

        // Check if this file type has a model editor.
        if (!editorMetadata) {
            this.ide.danger(`File type ${serverFile.fileType} has no editor associated with it`, 3000);
            if (this.editors.length === 0) {
                this.coverPanel.show('Please, open or create a model.');
            }
            return;
        }

        // In case of subsequent loadings, we have to close the console group of the previous one
        console.groupEnd();
        console.group(fileName);

        // Show the editor with the fileName (if available), hide all the ones with a different fileName
        const existingEditor = this.editors.find(editor => editor.fileName == fileName);
        this.editors.forEach(editor => editor.visible = (editor === existingEditor));

        //show model name on browser tab
        document.title = 'Dynamic Case Management - ' + serverFile.name;

        // If we already have an editor for the fileName, no need to go further in the loading logic
        if (existingEditor) {
            this.showEditor(existingEditor);
            return;
        }

        // By default open the cover panel. If the model is present and loads,
        //  the cover panel will be closed.
        this.coverPanel.show('Opening ' + fileName);

        // Now create and load the new editor
        const editor = this.addEditor(editorMetadata.createEditor(this.ide, serverFile));
        editor.initialize();
    }

    remove(fileName: string) {
        this.editors.filter(editor => editor.fileName === fileName).forEach(editor => {
            editor.destroy();
        });
    }
}

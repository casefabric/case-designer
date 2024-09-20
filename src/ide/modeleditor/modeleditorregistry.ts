// BIG TODO HERE - Apparently we must import ElementRegistry here, instead of only inside the CaseModelEditor - totally unclear why.
//  ALSO the order or import (first ElementRegistry, then CaseModelEditorMetadata) is important for the code not to cause an issue.
import ElementRegistry from "./case/elements/elementregistry";
import CaseModelEditorMetadata from "./case/casemodeleditormetadata";
import HumantaskModelEditorMetadata from "./humantask/humantaskmodeleditormetadata";
import ProcessModelEditorMetadata from "./process/processtaskmodeleditormetadata";
import IDE from "@ide/ide";
import ModelEditor from "./modeleditor";
import ModelEditorMetadata from "./modeleditormetadata";

export default class ModelEditorRegistry {
    editors: Array<ModelEditor> = [];

    /**
     * 
     * @param {IDE} ide 
     */
    constructor(public ide: IDE) {
        this.ide = ide;

        // Register the known editors, e.g. HumanTaskEditor, CaseModelEditor, ProcessModelEditor
        CaseModelEditorMetadata.register();
        HumantaskModelEditorMetadata.register();
        ProcessModelEditorMetadata.register();
        // BIG TODO HERE: the below registration should take place inside CaseModelEditor only
        ElementRegistry.initialize();
    }

    register(editor: ModelEditor) {
        this.editors.push(editor);
    }


    /**
     * Determines the type of the file name and opens the corresponding editor.
     */
    open(fileName: string) {
        if (!fileName) {
            // Simply no model to load; but hide all existing editors.
            this.editors.forEach(editor => editor.visible = false);
            this.ide.coverPanel.show('Please, open or create a model.');
            return;
        }

        const serverFile = this.ide.repository.get(fileName);
        if (!serverFile) {
            this.ide.danger(`File ${fileName} does not exist and cannot be opened`, 2000);
            if (this.editors.length === 0) {
                this.ide.coverPanel.show('Please, open or create a model.');
            }
            return;
        }

        const editorMetadata = ModelEditorMetadata.types.find(type => type.supportsFile(serverFile));

        // Check if this file type has a model editor.
        if (!editorMetadata) {
            this.ide.danger(`File type ${serverFile.fileType} has no editor associated with it`, 3000);
            if (this.editors.length === 0) {
                this.ide.coverPanel.show('Please, open or create a model.');
            }
            return;
        }

        // In case of subsequent loadings, we have to close the console group of the previous one
        console.groupEnd();
        console.group(fileName);

        // Show the editor with the fileName (if available), hide all the ones with a different fileName
        const existingEditor = this.editors.find(editor => editor.fileName == fileName);
        this.editors.forEach(editor => editor.visible = (editor === existingEditor));
        if (existingEditor) existingEditor.visible = true;

        //show model name on browser tab
        document.title = 'Cafienne IDE - ' + serverFile.name;

        // If we already have an editor for the fileName, no need to go further in the loading logic
        if (existingEditor) {
            return;
        }

        if (serverFile.metadata.error) {
            this.ide.coverPanel.show('Cannot open ' + fileName + '\nError: ' + serverFile.metadata.error);
            return;
        }

        // By default open the cover panel. If the model is present and loads,
        //  the cover panel will be closed.
        this.ide.coverPanel.show('Opening ' + fileName);

        // Now create and load the new editor
        editorMetadata.createEditor(this.ide, serverFile).loadModel();
    }

    remove(fileName: string) {
        this.editors.filter(editor => editor.fileName === fileName).forEach(editor => editor.destroy());
    }
}

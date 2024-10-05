import RepositoryBrowser from "@ide/repositorybrowser";
import ServerFile from "@repository/serverfile";
import IDE from "../ide";
import ModelEditor from "./modeleditor";

export default class ModelEditorMetadata {
    public static types: Array<ModelEditorMetadata> = [];

    /**
     * Registers a type of editor, e.g. HumanTaskEditor, CaseModelEditor, ProcessModelEditor
     */
    public static registerEditorType(editorMetadata: ModelEditorMetadata) {
        this.types.push(editorMetadata);
    }


    public ide?: IDE;

    /**
     * Initializes metadata for a type of ModelEditor within the IDE
     * @param {IDE} ide 
     */
    init(repositoryBrowser: RepositoryBrowser) {
        const ide = repositoryBrowser.ide;
        this.ide = ide;
        repositoryBrowser.createModelListPanel(this);
    }

    /**
     * Whether the metadata is associated with this kind of file
     * @param {ServerFile} file 
     */
    supportsFile(file: ServerFile) {
        throw new Error('This method must be implemented in ' + this.constructor.name);
    }

    /**
     * Create an editor for this file
     * @param {IDE} ide 
     * @param {ServerFile} file 
     * @returns {ModelEditor}
     */
    createEditor(ide: IDE, file: ServerFile): ModelEditor {
        throw new Error('This method must be implemented in ' + this.constructor.name);
    }

    get supportsDeploy() {
        return false;
    }

    /** @returns {Array<ServerFile>} */
    get modelList(): Array<ServerFile> {
        throw new Error('This method must be implemented in ' + this.constructor.name);
    }

    /**
     * Returns the image that can be used when rendering a server file that this editor can load
     */
    get icon(): string {
        throw new Error('This method must be implemented in ' + this.constructor.name);
    }

    get description(): string {
        throw new Error('This method must be implemented in ' + this.constructor.name);
    }

    get modelType(): string {
        throw new Error('This method must be implemented in ' + this.constructor.name);
    }

    toString() {
        return this.description.substring(0, this.description.length - 1).toLowerCase();
    }

    /**
     * Create a new model with the specified model name.
     * @param {IDE} ide 
     * @param {String} newModelName 
     * @param {String} newModelDescription 
     * @param {Function} callback 
     * @returns {String} fileName of the new model
     */
    createNewModel(ide: IDE, newModelName: string, newModelDescription: string, callback: Function): string {
        throw new Error('This method must be implemented in ' + this.constructor.name);
    }
}

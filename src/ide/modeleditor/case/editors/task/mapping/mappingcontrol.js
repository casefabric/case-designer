import ParameterMappingDefinition from "../../../../../../repository/definition/cmmn/contract/parametermappingdefinition";
import TableRenderer from "../../tableeditor/tablerenderer";
import TaskMappingsEditor from "../taskmappingseditor";

export default class MappingControl extends TableRenderer {
    /**
     * 
     * @param {TaskMappingsEditor} editor 
     * @param {JQuery<HTMLElement>} htmlParent 
     */
    constructor(editor, htmlParent) {
        super(editor.task.canvas, htmlParent);
        this.editor = editor;
        this.task = editor.task;
        this.taskDefinition = this.task.definition;
    }

    /**
     * @returns {Array<ParameterMappingDefinition>} The task input parameters (for usage in the parameters editor)
     */
    get data() {
        throw new Error('This method must be implemented in ' + this.constructor.name);
    }
}

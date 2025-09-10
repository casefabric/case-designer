import CaseDefinition from "../../../../repository/definition/cmmn/casedefinition";
import Dimensions from "../../../../repository/definition/dimensions/dimensions";
import CaseModelEditor from "../casemodeleditor";
import Action from "./action";

export default class UndoManager {
    performingBufferAction: boolean = false;
    private currentAction?: Action;

    constructor(public editor: CaseModelEditor) { }

    /**
     * Clears the action buffer, and prepares it for the new content.
     * This typically only happens when we open a new case model
     */
    resetActionBuffer(caseDefinition: CaseDefinition, dimensions: Dimensions): void {
        this.performingBufferAction = false;
        this.currentAction = undefined;

        // First action is to add what we have to the undo/redo buffer.
        this.addCaseAction(caseDefinition, dimensions);
    }

    /**
     * Save model and upload to server; but only if there are new changes.
     * @param forceSave Saving case model is only done on the changes with respect to the previous save action. For creating a new model we have to forcefully save.
     */
    async saveDefinition(definition: CaseDefinition, dimensions: Dimensions, forceSave: boolean = false) {
        const newAction = this.addCaseAction(definition, dimensions);
        if (newAction) {
            if (forceSave) {
                await newAction.forceSave();
            } else {
                await newAction.save();
            }
        } else {
            // See also console.warn in addCaseAction
            console.warn('Nothing to save for this case model change?!')
        }
    }

    private addCaseAction(caseDefinition: CaseDefinition, dimensions: Dimensions) {
        if (this.performingBufferAction) {
            // This is not supposed to happen. But order of events and invocations is not so easy, so keeping it for safety reasons if you start changing this code
            console.warn('Adding case action while performing buffer action');
            return;
        }

        // Creating a new action makes it also the current action.
        //  Note that the actual action may not resolve in changes, and in such a case, the currentAction will return itself and remain the same.
        this.currentAction = new Action(this, caseDefinition, dimensions, this.currentAction as Action | undefined);
        this.editor.updateUndoRedoButtons();
        return this.currentAction as Action;
    }

    getUndoCount() {
        return this.currentAction?.undoCount || 0;
    }

    async undo() {
        if (!this.editor.case) return; // Function currently only enabled in CaseModelEditor

        if (this.currentAction) {
            this.currentAction = await this.currentAction.undo();
        } else {
            console.log('No undo available');
        }
        this.editor.updateUndoRedoButtons();
    }

    getRedoCount() {
        return this.currentAction?.redoCount || 0;
    }

    async redo() {
        if (!this.editor.case) return; // Function currently only enabled in CaseModelEditor

        if (this.currentAction && this.currentAction.nextAction) {
            this.currentAction = await this.currentAction.nextAction.redo();
        } else {
            console.log('No redo availalbe');
        }
        this.editor.updateUndoRedoButtons();
    }
}

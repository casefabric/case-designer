import GraphicalModelDefinition from "../../../../repository/definition/graphicalmodeldefinition";
import ModelEditor from "../../../modeleditor/modeleditor";
import Action from "./action";

export default class UndoManager {
    performingBufferAction: boolean = false;
    private currentAction?: Action;

    constructor(public editor: ModelEditor) { }

    /**
     * Clears the action buffer, and prepares it for the new content.
     * This typically only happens when we open a new model
     */
    resetActionBuffer(definition: GraphicalModelDefinition): void {
        this.performingBufferAction = false;
        this.currentAction = undefined;

        // First action is to add what we have to the undo/redo buffer.
        this.addAction(definition);
    }

    /**
     * Save model and upload to server; but only if there are new changes.
     * @param forceSave Saving model is only done on the changes with respect to the previous save action. For creating a new model we have to forcefully save.
     */
    async saveDefinition(definition: GraphicalModelDefinition, forceSave: boolean = false) {
        const newAction = this.addAction(definition);
        if (newAction) {
            if (forceSave) {
                await newAction.forceSave();
            } else {
                await newAction.save();
            }
        } else {
            // See also console.warn in addAction
            console.warn('Nothing to save for this model change?!')
        }
    }

    private addAction(definition: GraphicalModelDefinition) {
        if (this.performingBufferAction) {
            // This is not supposed to happen. But order of events and invocations is not so easy, so keeping it for safety reasons if you start changing this code
            console.warn('Adding action while performing buffer action');
            return;
        }

        // Creating a new action makes it also the current action.
        //  Note that the actual action may not resolve in changes, and in such a case, the currentAction will return itself and remain the same.
        this.currentAction = new Action(this, definition, this.currentAction as Action | undefined);
        this.editor.updateUndoRedoButtons();
        return this.currentAction as Action;
    }

    getUndoCount() {
        return this.currentAction?.undoCount || 0;
    }

    async undo() {
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
        if (this.currentAction && this.currentAction.nextAction) {
            this.currentAction = await this.currentAction.nextAction.redo();
        } else {
            console.log('No redo availalbe');
        }
        this.editor.updateUndoRedoButtons();
    }
}

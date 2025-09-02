import GraphicalModelDefinition from "../../../../repository/definition/graphicalmodeldefinition";
import ServerFile from "../../../../repository/serverfile/serverfile";
import ModelEditor from "../../../modeleditor/modeleditor";
import State from "./state";
import UndoRedoBox from "./undoredobox";

export default class UndoManager {
    restoringState: boolean = false;
    private currentState?: State;
    private _undoBox?: UndoRedoBox;

    constructor(file: ServerFile<any>, public editor: ModelEditor) {
        this.currentState = new State(this, file.definition!, undefined);
    }

    set undoBox(undoBox: UndoRedoBox | undefined) {
        this._undoBox = undoBox;
        this.updateUndoRedoButtons();
    }

    updateUndoRedoButtons(undoCount: number = this.getUndoCount(), redoCount: number = this.getRedoCount()): void {
        // Only update the buttons once the model is loaded.
        this._undoBox?.updateButtons(undoCount, redoCount);
    }

    /**
     * Clears the state buffer, and prepares it for the new content.
     * This typically only happens when we open a new model
     */
    resetBuffer(definition: GraphicalModelDefinition): void {
        this.restoringState = false;
        this.currentState = undefined;

        // First state is to add what we have to the undo/redo buffer.
        this.setState(definition);
    }

    /**
     * Save model and upload to server; but only if there are new changes.
     */
    saveModel(definition: GraphicalModelDefinition) {
        const newState = this.setState(definition);
        if (newState) {
            newState.save();
        } else {
            console.warn('Nothing to save for this model change?!')
        }
    }

    private setState(definition: GraphicalModelDefinition) {
        if (this.restoringState) {
            // This is not supposed to happen. But order of events and invocations is not so easy, so keeping it for safety reasons if you start changing this code
            console.warn('Adding state while performing buffer restore');
            return;
        }

        // Creating a new state makes it also the current state.
        //  Note that the actual state may not result in changes, and in such a case, the currentState will return itself and remain the same.
        this.currentState = new State(this, definition, this.currentState);
        this.updateUndoRedoButtons();
        return this.currentState;
    }

    getUndoCount() {
        if (this.currentState) {
            return this.currentState.undoCount;
        } else {
            return 0;
        }
    }

    async undo() {
        if (this.currentState) {
            this.currentState = await this.currentState.undo();
        } else {
            console.log('No undo available');
        }
        this.updateUndoRedoButtons();
    }

    getRedoCount() {
        if (this.currentState) {
            return this.currentState.redoCount;
        } else {
            return 0;
        }
    }

    async redo() {
        if (this.currentState && this.currentState.nextState) {
            this.currentState = await this.currentState.nextState.redo();
        } else {
            console.log('No redo availalbe');
        }
        this.updateUndoRedoButtons();
    }
}

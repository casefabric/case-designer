import GraphicalModelDefinition from "../../../../repository/definition/graphicalmodeldefinition";
import DimensionsFile from "../../../../repository/serverfile/dimensionsfile";
import ServerFile from "../../../../repository/serverfile/serverfile";
import UndoManager from "./undomanager";

export default class State {
    private modelString: string;
    private dimensionsString: string;
    private modelFile: ServerFile<any>;
    private dimensionsFile: DimensionsFile;
    private modelChanged: boolean;
    private dimensionsChanged: boolean;
    private next?: State;
    private saved?: boolean;

    constructor(public undoManager: UndoManager, public definition: GraphicalModelDefinition, public previousState?: State) {
        this.modelString = definition.toXMLString();
        const dimensions = definition.dimensions!;
        this.dimensionsString = dimensions.toXMLString();
        this.modelFile = definition.file as ServerFile<any>;
        this.dimensionsFile = dimensions.file;
        this.modelChanged = false;
        this.dimensionsChanged = false;

        if (previousState) {
            // Update flags if we have previous states
            this.modelChanged = previousState.modelString != this.modelString;
            this.dimensionsChanged = previousState.dimensionsString != this.dimensionsString;
            if (!this.modelChanged && !this.dimensionsChanged && previousState) {
                // If no changes, then just return the previous state instead of this new one.
                //  Note: if that previousState was different w.r.t. it's predecessor, then we should not keep saving.
                //  This is why the state keeps track of a "saved" flag (see logic in save() method).
                return previousState;
            }

            // Also make ourselves the next state of the previous one.
            previousState.nextState = this;
        }
    }

    get nextState(): State | undefined {
        return this.next;
    }

    set nextState(state: State | undefined) {
        this.next = state;
    }

    /**
     * Returns the number of previous states available before this state.
     */
    get undoCount(): number {
        return this.previousState ? this.previousState.undoCount + 1 : 0;
    }

    /**
     * Returns the number of next states available behind this state.
     */
    get redoCount(): number {
        return this.nextState ? this.nextState.redoCount + 1 : 0;
    }

    async undo() {
        if (this.previousState) {
            // Undo means we have to restore the previous state.
            //  But for saving the result of that state we have to use our change flags, because we are moving back.
            return this.previousState.restore('undo', this.modelChanged, this.dimensionsChanged);
        } else {
            console.log('No undo available');
            return Promise.resolve(this);
        }
    }

    async redo() {
        // For redo we can suffice with our own change flags for saving
        return this.restore('redo');
    }

    /**
     * Restores this specific state again, i.e., tells the editor to load the model
     * corresponding with this state, and also invokes the save logic on the state.
     * Note that the save logic depends on the direction of the resore: for undo, the save flags
     * has to be taken from the current state, for redo it has to be taken from the next state.
     * (See the actual implementations of undo and redo above) 
     */
    async restore(direction: string, modelChanged: boolean = this.modelChanged, dimensionsChanged: boolean = this.dimensionsChanged): Promise<State> {
        console.groupCollapsed("Performing " + direction + " on state " + this.undoCount);
        this.undoManager.restoringState = true;
        // Parse the sources again into a definition and load that in the editor.
        this.modelFile.source = this.modelString;
        this.dimensionsFile.source = this.dimensionsString;
        this.dimensionsFile.parse();
        this.modelFile.parse();

        if (this.modelFile.definition) {
            this.undoManager.editor.loadDefinition(this.modelFile.definition);
        }

        // Reset the "saved" flag.
        this.saved = false;
        await this.save(modelChanged, dimensionsChanged);
        this.undoManager.restoringState = false;
        console.groupEnd();
        return this;
    }

    /**
     * Trigger save logic on the state. Executes two independent save actions,
     * one on the definition and one on the dimensions file; but only if they changed.
     * The flags indicate whether they have changed, and take the values of the state itself by default.
     */
    async save(modelChanged: boolean = this.modelChanged, dimensionsChanged: boolean = this.dimensionsChanged) {
        if (this.saved) {
            // We keep track of a "saved" flag. This is required, because the constructor call
            //  may return the previous state, and hence, if there is a change, the save logic is invoked again.
            return;
        }
        if (modelChanged) {
            this.modelFile.source = this.modelString;
            await this.modelFile.save();
        }
        if (dimensionsChanged) {
            this.dimensionsFile.source = this.dimensionsString;
            await this.dimensionsFile.save();
        }
        this.saved = true;
    }

    /**
     * Forceful save. Required for creating new models.
     */
    async forceSave() {
        this.save(true, true);
    }
}

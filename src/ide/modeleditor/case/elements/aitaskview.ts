import AITaskDefinition from "../../../../repository/definition/cmmn/caseplan/task/aitaskdefinition";
import ShapeDefinition from "../../../../repository/definition/dimensions/shape";
import Images from "../../../util/images/images";
import StageView from "./stageview";
import TaskView from "./taskview";

export default class AITaskView extends TaskView<AITaskDefinition> {
    definition: AITaskDefinition;

    /**
     * Create a new AITaskView at the given coordinates.
     */
    static create(stage: StageView, x: number, y: number): AITaskView {
        const definition = stage.definition.createPlanItem(AITaskDefinition);
        const shape = stage.case.diagram.createShape(x, y, 140, 80, definition.id);
        return new AITaskView(stage, definition, shape);
    }

    /**
     * Creates a new AITaskView element.
     */
    constructor(parent: StageView, definition: AITaskDefinition, shape: ShapeDefinition) {
        super(parent, definition, shape);
        this.definition = definition;
    }

    getImplementationList() {
        return this.editor.ide.repository.getAITasks();
    }

    /**
     * Returns the element type image for this task
     */
    get imageURL() {
        return Images.AI;
    }

    get fileType() {
        return 'ai';
    }

    get isProcessTask() {
        return true;
    }

    get color() {
        return 'rgba(113, 153, 255, 1)';
    }
}

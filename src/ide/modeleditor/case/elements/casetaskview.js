import PlanItem from "../../../../repository/definition/cmmn/caseplan/planitem";
import CaseTaskDefinition from "../../../../repository/definition/cmmn/caseplan/task/casetaskdefinition";
import ShapeDefinition from "../../../../repository/definition/dimensions/shape";
import Images from "../../../util/images/images";
import StageView from "./stageview";
import TaskView from "./taskview";

export default class CaseTaskView extends TaskView {
    /**
     * 
     * @param {StageView} stage 
     * @param {*} x 
     * @param {*} y 
     */
    static create(stage, x, y) {
        const definition = stage.definition.createPlanItem(CaseTaskDefinition);
        const shape = stage.case.diagram.createShape(x, y, 140, 80, definition.id);
        return new CaseTaskView(stage, definition, shape);
    }

    /**
     * Creates a new CaseTaskView element.
     * @param {StageView} parent 
     * @param {PlanItem} definition
     * @param {CaseTaskDefinition} definition 
     * @param {ShapeDefinition} shape 
     */
    constructor(parent, definition, shape) {
        super(parent, definition, shape);
        this.definition = definition;
    }

    get implementationType() {
        return 'case';
    }

    /**
     * Returns the element type image for this task
     */
    get imageURL() {
        return Images.CaseTask;
    }

    get fileType() {
        return 'case';
    }

    get isCaseTask() {
        return true;
    }
}

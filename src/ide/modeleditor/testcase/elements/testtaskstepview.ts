import HumanTaskDefinition from "../../../../repository/definition/cmmn/caseplan/task/humantaskdefinition";
import ShapeDefinition from "../../../../repository/definition/dimensions/shape";
import TaskStepDefinition from "../../../../repository/definition/testcase/taskstepdefinition";
import Halo from '../../../editors/modelcanvas/halo/halo';
import TestTaskStepProperties from "./properties/testtaskstepproperties";
import TestPlanView from "./testplanview";
import TestStepView from "./teststepview";

export default class TestTaskStepView extends TestStepView<TaskStepDefinition> {
    static create(plan: TestPlanView, x: number, y: number) {
        const definition: TaskStepDefinition = plan.definition.createDefinition(TaskStepDefinition);
        plan.definition.testSteps.push(definition);
        const shape = plan.canvas.diagram.createShape(x, y, 100, 100, definition.id);
        return new TestTaskStepView(plan, definition, shape);
    }

    constructor(parent: TestPlanView, definition: TaskStepDefinition, shape: ShapeDefinition) {
        super(parent, definition, shape);
    }

    createProperties() {
        return new TestTaskStepProperties(this);
    }

    createHalo(): Halo {
        return new Halo(this);
    }

    get title(): string {
        return "Task";
    }


    getVariantTypeSchema() {
        const caseDefinition = this.definition.modelDefinition?.testplan?.testFixture?.caseRef.getDefinition();
        const currentTask = caseDefinition?.elements.find(element => element.id === this.definition.taskDefinitionId);
        if (currentTask && currentTask.constructor.name === 'HumanTaskDefinition') {
            const currentTaskDef = currentTask as HumanTaskDefinition;
            const parameters = currentTaskDef.outputs;

            return this.generateSchema(parameters);
        }
        return undefined;
    }
}

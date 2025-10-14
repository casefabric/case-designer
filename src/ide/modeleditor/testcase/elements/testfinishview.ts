import ShapeDefinition from "../../../../repository/definition/dimensions/shape";
import FinishStepDefinition from "../../../../repository/definition/testcase/finishstepdefinition";
import Halo from '../../../editors/modelcanvas/halo/halo';
import TestCaseProperties from "./properties/testcaseproperties";
import TestPlanView from "./testplanview";
import TestStepView from "./teststepview";

export default class TestFinishStepView extends TestStepView<FinishStepDefinition> {
    static create(plan: TestPlanView, x: number, y: number) {
        const definition: FinishStepDefinition = plan.definition.createDefinition(FinishStepDefinition);
        plan.definition.testSteps.push(definition);
        const shape = plan.canvas.diagram.createShape(x, y, 100, 100, definition.id);
        return new TestFinishStepView(plan, definition, shape);
    }

    constructor(parent: TestPlanView, definition: FinishStepDefinition, shape: ShapeDefinition) {
        super(parent, definition, shape);
    }

    createProperties() {
        return new TestCaseProperties(this);
    }

    createHalo(): Halo {
        return new Halo(this);
    }

    get title(): string {
        return "Finish";
    }
}

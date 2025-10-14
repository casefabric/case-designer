import ShapeDefinition from "../../../../repository/definition/dimensions/shape";
import StartStepDefinition from "../../../../repository/definition/testcase/startstepdefinition";
import Util from "../../../../util/util";
import Halo from '../../../editors/modelcanvas/halo/halo';
import TestCaseProperties from "./properties/testcaseproperties";
import TestPlanView from "./testplanview";
import TestStepView from "./teststepview";


export default class TestStartStepView extends TestStepView<StartStepDefinition> {
    static create(plan: TestPlanView, x: number, y: number) {
        const definition: StartStepDefinition = plan.definition.createDefinition(StartStepDefinition);
        plan.definition.testSteps.push(definition);
        const shape = plan.canvas.diagram.createShape(x, y, 100, 100, definition.id);
        return new TestStartStepView(plan, definition, shape);
    }

    constructor(parent: TestPlanView, definition: StartStepDefinition, shape: ShapeDefinition) {
        super(parent, definition, shape);
    }

    createProperties() {
        return new TestCaseProperties(this);
    }

    createHalo(): Halo {
        return new Halo(this);
    }

    get title(): string {
        return "Start";
    }

    get isStartStep(): boolean {
        return true;
    }

    getVariantTypeSchema() {
        const caseDefinition = this.definition.modelDefinition?.testplan?.testFixture?.caseRef.getDefinition();

        if (!caseDefinition) {
            return undefined;
        }
        if (caseDefinition.startCaseSchema.value && caseDefinition.startCaseSchema.value != null) {
            return Util.parseJSON(caseDefinition.startCaseSchema.value).object;
        }

        return this.generateSchema(caseDefinition.inputParameters);
    }

}

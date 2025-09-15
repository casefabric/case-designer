import ShapeDefinition from "../../../../repository/definition/dimensions/shape";
import StartStepDefinition from "../../../../repository/definition/testcase/startstepdefinition";
import ElementView from '../../../editors/modelcanvas/elementview';
import Halo from '../../../editors/modelcanvas/halo/halo';
import Properties from '../../../editors/modelcanvas/properties';
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
        return new Properties(this);
    }

    createHalo(): Halo {
        return new Halo(this);
    }

    get title(): string {
        return "Start";
    }

    moved(x: number, y: number, newParent: ElementView) {
    }

    /**
     * A planningTable has a fixed position on its parent, it cannot be moved.
     * Position cursor is not relevant
     */
    moving(x: number, y: number) {
        super.moving(x, y);
    }

    resizing(w: number, h: number): void {
        super.resizing(w, h);
    }
}


import ShapeDefinition from "../../../../repository/definition/dimensions/shape";
import FixtureDefinition from '../../../../repository/definition/testcase/testfixturedefintion';
import ServerFile from "../../../../repository/serverfile/serverfile";
import ElementView from '../../../editors/modelcanvas/elementview';
import Halo from '../../../editors/modelcanvas/halo/halo';
import FixtureProperties from "./properties/fixtureproperties";
import TestCaseElementView from "./testcaseelementview";
import TestPlanView from "./testplanview";


export default class FixtureView extends TestCaseElementView<FixtureDefinition> {
    static create(plan: TestPlanView, x: number, y: number): FixtureView {
        const definition: FixtureDefinition = plan.definition.createDefinition(FixtureDefinition);
        plan.definition.testFixture = definition;
        const shape = plan.canvas.diagram.createShape(x, y, 140, 80, definition.id);
        return new FixtureView(plan, definition, shape);
    }

    constructor(parent: TestPlanView, definition: FixtureDefinition, shape: ShapeDefinition) {
        super(parent.canvas, parent, definition, shape);
    }

    createProperties() {
        return new FixtureProperties(this);
    }

    createHalo(): Halo {
        return new Halo(this);
    }

    get markup() {
        return `<g @selector="scalable">
                    <rect @selector='body' rx="5" ry="5" width="60" height="20" ></rect>
                </g>`;
    }

    get markupAttributes() {
        return {
        };
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

    changeCaseReference(file?: ServerFile) {
        this.definition.caseRef.update(file?.fileName ?? '');
        this.refreshText();
        this.canvas.editor.completeUserAction();
    }
}

import ShapeDefinition from "../../../../repository/definition/dimensions/shape";
import TestStepDefinition from "../../../../repository/definition/testcase/teststepdefinition";
import ElementView from '../../../editors/modelcanvas/elementview';
import Halo from '../../../editors/modelcanvas/halo/halo';
import Properties from '../../../editors/modelcanvas/properties';
import TestCaseElementView from "./testcaseelementview";
import TestPlanView from "./testplanview";


export default abstract class TestStepView<S extends TestStepDefinition> extends TestCaseElementView<S> {

    constructor(parent: TestPlanView, definition: S, shape: ShapeDefinition) {
        super(parent.canvas, parent, definition, shape);
    }

    createProperties() {
        return new Properties(this);
    }

    createHalo(): Halo {
        return new Halo(this);
    }

    get markup() {
        return `<g @selector="scalable">
                    <path @selector="body"
                        d=" M 2 0
                            A 98 196 0 0 0 198 1
                            L 2 1"
                        fill="none"
                        stroke="black"
                        stroke-width="2"
                    />
                </g>
                <text @selector="title" y="30" font-size="30" text-anchor="middle" fill="black">${this.title}</text>`;
    }

    abstract get title(): string;

    get markupAttributes() {
        return {
            title: {
                ref: 'body',
                x: 'calc(w/2)',
            }
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
}

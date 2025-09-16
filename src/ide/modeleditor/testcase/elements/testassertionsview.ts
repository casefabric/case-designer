import { g } from "@joint/core";
import ShapeDefinition from "../../../../repository/definition/dimensions/shape";
import TestStepAssertionSetDefinition from "../../../../repository/definition/testcase/teststepassetionsetdefinition";
import TestStepDefinition from "../../../../repository/definition/testcase/teststepdefinition";
import ElementView from '../../../editors/modelcanvas/elementview';
import Halo from '../../../editors/modelcanvas/halo/halo';
import Properties from '../../../editors/modelcanvas/properties';
import TestCaseHalo from "./halo/testcasehalo";
import TestCaseElementView from "./testcaseelementview";
import TestStepView from "./teststepview";


export default class TestStepAssertionsView extends TestCaseElementView<TestStepAssertionSetDefinition> {
    static typeDescription = 'Assertions';

    constructor(public parent: TestStepView<TestStepDefinition>, definition: TestStepAssertionSetDefinition, shape: ShapeDefinition) {
        super(parent.canvas, parent, definition, shape);
        this.__resizable = false;
    }

    createProperties() {
        return new Properties(this);
    }

    createHalo(): Halo {
        return new TestCaseHalo(this);
    }

    get markup() {
        return `<g @selector="scalable">
                    <path @selector='body' d=" 
                        M 50 50 
                        L 100 50 
                        A 50 50 0 0 0 0 50 
                        Z"></path>
                </g>`;
    }

    get markupAttributes() {
        return {
        };
    }

    moved(x: number, y: number, newParent: ElementView) {
    }

    moving(x: number, y: number) {
        super.moving(x, y);

        // Keep the variant on the top boundary of its parent step
        const parentElement = this.parent.xyz_joint;
        const sX = this.position.x;
        const sY = this.position.y;
        const sW = this.size.width;
        const sH = this.size.height;

        const shapeCenterBottom = new g.Point(sX + (sW / 2), sY + sH);
        const boundaryPoint = new g.Point(parentElement.position().x + (parentElement.size().width / 2), parentElement.position().y);

        const sentryTranslateX = boundaryPoint.x - shapeCenterBottom.x;
        const sentryTranslateY = boundaryPoint.y - shapeCenterBottom.y;

        if (sentryTranslateX != 0 || sentryTranslateY != 0) {
            this.xyz_joint.translate(sentryTranslateX, sentryTranslateY);
        }

    }

    resizing(w: number, h: number): void {
        super.resizing(w, h);
    }

    get isVariant() {
        return true;
    }
}

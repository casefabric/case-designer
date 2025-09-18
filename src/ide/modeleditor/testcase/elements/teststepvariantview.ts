import { g } from "@joint/core";
import ShapeDefinition from "../../../../repository/definition/dimensions/shape";
import TestStepDefinition from "../../../../repository/definition/testcase/teststepdefinition";
import TestStepVariantDefinition from "../../../../repository/definition/testcase/teststepvariantdefinition";
import ElementView from '../../../editors/modelcanvas/elementview';
import Halo from '../../../editors/modelcanvas/halo/halo';
import TestStepVariantHalo from "./halo/teststepvarianthalo";
import TextCaseProperties from "./properties/testcaseproperties";
import TestCaseElementView from "./testcaseelementview";
import TestStepView from "./teststepview";


export default class TestStepVariantView extends TestCaseElementView<TestStepVariantDefinition> {
    static create(step: TestStepView<TestStepDefinition>, x: number, y: number) {
        const definition: TestStepVariantDefinition = step.definition.createDefinition(TestStepVariantDefinition);
        step.definition.variants.push(definition);
        const shape = step.canvas.diagram.createShape(x, y, 30, 30, definition.id);
        return new TestStepVariantView(step, definition, shape);
    }

    constructor(public parent: TestStepView<TestStepDefinition>, definition: TestStepVariantDefinition, shape: ShapeDefinition) {
        super(parent.canvas, parent, definition, shape);
        this.__resizable = false;
    }

    createProperties() {
        return new TextCaseProperties(this);
    }

    createHalo(): Halo {
        return new TestStepVariantHalo(this);
    }

    get markup() {
        return `<g @selector="scalable">
                    <polygon @selector='body' points="10,0 27,0 37,17 27,34 10,34 0,17"></polygon>
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

        // Keep the variant on the boundary of its parent step, see TestStepView.resizing()
        const parentElement = this.parent.xyz_joint;
        const sX = this.position.x;
        const sY = this.position.y;
        const sH = this.size.height;
        const sW = this.size.width;

        const shapeCenter = new g.Point(sX + (sW / 2), sY + (sH / 2));
        const boundaryPoint = parentElement.getBBox().pointNearestToPoint(shapeCenter);

        const sentryTranslateX = boundaryPoint.x - shapeCenter.x;
        const sentryTranslateY = boundaryPoint.y - shapeCenter.y;

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

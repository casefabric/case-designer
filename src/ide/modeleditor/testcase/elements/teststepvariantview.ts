import { g } from "@joint/core";
import ShapeDefinition from "../../../../repository/definition/dimensions/shape";
import TestStepDefinition from "../../../../repository/definition/testcase/teststepdefinition";
import TestStepVariantDefinition from "../../../../repository/definition/testcase/teststepvariantdefinition";
import ElementView from '../../../editors/modelcanvas/elementview';
import Halo from '../../../editors/modelcanvas/halo/halo';
import TestStepVariantHalo from "./halo/teststepvarianthalo";
import TestCaseProperties from "./properties/testcaseproperties";
import TestCaseElementView from "./testcaseelementview";
import TestStepView from "./teststepview";


export default class TestStepVariantView extends TestCaseElementView<TestStepVariantDefinition> {
    static create(step: TestStepView<TestStepDefinition>, x: number, y: number) {
        const definition: TestStepVariantDefinition = step.createNewVariantDefinition();
        const shape = step.canvas.diagram.createShape(x, y, 30, 30, definition.id);
        return new TestStepVariantView(step, definition, shape);
    }

    constructor(public parent: TestStepView<TestStepDefinition>, definition: TestStepVariantDefinition, shape: ShapeDefinition) {
        super(parent.canvas, parent, definition, shape);
        this.__resizable = false;
    }

    createProperties() {
        return new TestCaseProperties(this);
    }

    createHalo(): Halo {
        return new TestStepVariantHalo(this);
    }

    get markup() {
        return `<g @selector="rotatable">
                    <g @selector="scalable">
                        <circle @selector='body' cx='15' cy='15' r='15'></circle>
                    </g>
                    <text @selector='label' text-anchor='middle' x='15' y='20' font-size='12px' font-family='Arial, helvetica, sans-serif'>V</text>
                </g>`;
    }

    get markupAttributes() {
        return {
            body: {
                fill: '#ffffff',
            },
        };
    }

    moved(x: number, y: number, newParent: ElementView) {
    }

    moving(sX: number, sY: number) {
        super.moving(sX, sY);

        // Keep the variant on the boundary of its parent step, see TestStepView.resizing()
        const parentElement = this.parent.xyz_joint;
        const sH = this.size.height;
        const sW = this.size.width;
        const shapeCenter = new g.Point(sX + (sW / 2), sY + (sH / 2));

        let targetX = shapeCenter.x;
        if (targetX < this.parent.shape.x) {
            targetX = this.parent.shape.x;
        } else if (targetX > this.parent.shape.x + this.parent.shape.width) {
            targetX = this.parent.shape.x + this.parent.shape.width;
        }

        const parentCenter = new g.Point(parentElement.position().x + (parentElement.size().width / 2),
            parentElement.position().y + (parentElement.size().height / 2));

        const offCenterX = Math.abs(parentCenter.x - targetX);
        const relativeOffCenterX = offCenterX / (parentElement.size().width / 2);

        // calculate targetY based on relativeOffCenterX on the lower half ellipse of the parent
        const targetY = parentElement.position().y + parentElement.size().height -
            (parentElement.size().height * (1 - Math.sqrt(1 - (relativeOffCenterX * relativeOffCenterX))));

        const translateX = Math.round(targetX - (this.xyz_joint.position().x + this.xyz_joint.size().width / 2));
        const translateY = Math.round(targetY - shapeCenter.y);
        if (translateX != 0 || translateY != 0) {
            this.xyz_joint.translate(translateX, translateY);
        }

    }

    resizing(w: number, h: number): void {
        super.resizing(w, h);
    }

    get isVariant() {
        return true;
    }
}

import { g } from "@joint/core";
import ShapeDefinition from "../../../../repository/definition/dimensions/shape";
import TestStepDefinition from "../../../../repository/definition/testcase/teststepdefinition";
import TestStepVariantDefinition from "../../../../repository/definition/testcase/teststepvariantdefinition";
import ElementView from '../../../editors/modelcanvas/elementview';
import Halo from '../../../editors/modelcanvas/halo/halo';
import Properties from '../../../editors/modelcanvas/properties';
import TestCaseElementView from "./testcaseelementview";
import TestPlanView from "./testplanview";
import TestStepVariantView from "./teststepvariantview";


export default abstract class TestStepView<S extends TestStepDefinition> extends TestCaseElementView<S> {

    constructor(parent: TestPlanView, definition: S, shape: ShapeDefinition) {
        super(parent.canvas, parent, definition, shape);

        for (const variant of definition.variants) {
            // TODO logic location for added variant
            this.addVariantView(variant, def => this.canvas.diagram.createShape(20, 20, 30, 30, def.id));
        }
    }

    private addVariantView(definition: TestStepVariantDefinition, shapeBuilder: (definition: TestStepVariantDefinition) => ShapeDefinition) {
        // Only add the new plan item if we do not yet visualize it
        if (!this.__childElements.find(planItemView => planItemView.definition.id == definition.id)) {
            // Check whether we can find a shape for the definition.
            const shape = this.canvas.diagram.getShape(definition) ?? shapeBuilder(definition);
            if (!shape) {
                console.warn(`Error: missing shape definition for ${definition.constructor.name} named "${definition.name}" with id "${definition.id}"`);
                return;
            }
            // Add a view based on the definition with its shape
            const child = this.__addChildElement(this.createVariantView(definition, shape));
            child.changeParent(this);

            return child;
        }
    }

    createVariantView(definition: TestStepVariantDefinition, shape: ShapeDefinition) {
        return new TestStepVariantView(this, definition, shape);
    }

    createChildView(viewType: Function, x: number, y: number): ElementView<any> {
        if (viewType == TestStepVariantView) {
            return this.__addChildElement(TestStepVariantView.create(this, x, y));
        } else {
            return super.createChildView(viewType, x, y);
        }
    }
    __canHaveAsChild(elementType: Function) {
        return elementType == TestStepVariantView;
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
        this.__childElements.filter(child => (<TestCaseElementView<any>>child).isVariant).forEach((variantView: any) => {

            // keep the variant on the boundary of its parent step, see TestStepVariantView.moving()

            //get the current position of variant (the centre)
            const x = variantView.shape.x + variantView.shape.width / 2;
            const y = variantView.shape.y + variantView.shape.height / 2;
            const middleOfVariant = new g.Point(x, y);
            //find the side of the step the variant is nearest to and re-position variant,
            // but only if it is on the right or bottom side (because we're only resizing, not re-positioning)
            const nearestSide = this.xyz_joint.getBBox().sideNearestToPoint(middleOfVariant);
            if (nearestSide == 'right') {
                variantView.moving(this.shape.x + this.shape.width, y);
            } else if (nearestSide == 'bottom') {
                variantView.moving(x, this.shape.y + this.shape.height);
            }
        });

    }

}

import CaseParameterDefinition from "../../../../repository/definition/cmmn/contract/caseparameterdefinition";
import ParameterDefinition from "../../../../repository/definition/contract/parameterdefinition";
import ShapeDefinition from "../../../../repository/definition/dimensions/shape";
import TestStepAssertionSetDefinition from "../../../../repository/definition/testcase/teststepassetionsetdefinition";
import TestStepDefinition from "../../../../repository/definition/testcase/teststepdefinition";
import TestStepVariantDefinition from "../../../../repository/definition/testcase/teststepvariantdefinition";
import ElementView from '../../../editors/modelcanvas/elementview';
import Halo from '../../../editors/modelcanvas/halo/halo';
import Properties from '../../../editors/modelcanvas/properties';
import TestStepProperties from "./properties/teststepproperties";
import TestStepAssertionsView from "./testassertionsview";
import TestCaseElementView from "./testcaseelementview";
import TestPlanView from "./testplanview";
import TestStepVariantView from "./teststepvariantview";


export default abstract class TestStepView<S extends TestStepDefinition = TestStepDefinition> extends TestCaseElementView<S> {
    assertionView: TestStepAssertionsView | undefined;

    constructor(parent: TestPlanView, definition: S, shape: ShapeDefinition) {
        super(parent.canvas, parent, definition, shape);

        for (const variant of definition.variants) {
            // TODO logic location for added variant
            this.addVariantView(variant, def => {
                const size = 30;
                return this.canvas.diagram.createShape(shape.x + (shape.width / 2) - (size / 2), shape.y + shape.height - (size / 2), size, size, def.id);
            });
        }

        if (definition.assertionSet) {
            this.assertionView = this.addAssertionSetView(definition.assertionSet, def => this.canvas.diagram.createShape(50, 50, 40, 20, def.id));
        }
    }

    createNewVariantDefinition(): TestStepVariantDefinition {
        return this.definition.createNewVariantDefinition();
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
            const child = this.__addChildElement(new TestStepVariantView(this, definition, shape));
            child.changeParent(this);

            // enforce constraints
            child.moving(child.shape.x, child.shape.y);

            return child;
        }
    }
    private addAssertionSetView(definition: TestStepAssertionSetDefinition, shapeBuilder: (definition: TestStepAssertionSetDefinition) => ShapeDefinition) {
        // Only add the new plan item if we do not yet visualize it
        if (!this.__childElements.find(planItemView => planItemView.definition.id == definition.id)) {
            // Check whether we can find a shape for the definition.
            const shape = this.canvas.diagram.getShape(definition) ?? shapeBuilder(definition);
            if (!shape) {
                console.warn(`Error: missing shape definition for ${definition.constructor.name} named "${definition.name}" with id "${definition.id}"`);
                return;
            }
            // Add a view based on the definition with its shape
            const child = this.__addChildElement(new TestStepAssertionsView(this, definition, shape));
            child.changeParent(this);

            // enforce constraints
            child.moving(child.shape.x, child.shape.y);

            return child;
        }
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


    createProperties(): Properties {
        return new TestStepProperties(this);
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
                <text @selector="title" y="30" font-size="30" text-anchor="middle" fill="black">${this.title}</text>
                <text @selector="label" y="50" text-anchor="middle" fill="black">${this.name}</text>`;
    }

    abstract get title(): string;

    get markupAttributes() {
        return {
            title: {
                ref: 'body',
                x: 'calc(w/2)',
            },
            label: {
                ref: 'body',
                x: 'calc(w/2)',
            },
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
        const sX = this.xyz_joint.position().x;
        const oldWidth = this.xyz_joint.size().width;

        super.resizing(w, h);

        const relativeWidthChange = w / oldWidth;

        this.__childElements.filter(child => (<TestCaseElementView<any>>child).isVariant).forEach((child) => {
            const variantView = <TestStepVariantView>child;

            //get the current x-position of variant (the centre)
            const vX = variantView.shape.x + variantView.shape.width / 2;

            const targetX = sX + ((vX - (sX + (variantView.shape.width / 2))) * relativeWidthChange);

            const translateX = Math.round(targetX - variantView.xyz_joint.position().x);
            if (translateX != 0) {
                variantView.xyz_joint.translate(translateX, 0);
            }
        });

        this.assertionView?.moving(this.assertionView.shape.x, this.assertionView.shape.y);

    }

    get isStep(): boolean {
        return true;
    }

    getVariantTypeSchema(): any {
        return undefined;
    }

    generateSchema(inputs: CaseParameterDefinition[]): any {
        return ParameterDefinition.generateSchema(this.name, inputs);
    }

}

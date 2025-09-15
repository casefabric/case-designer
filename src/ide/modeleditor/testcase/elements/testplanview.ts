import ShapeDefinition from "../../../../repository/definition/dimensions/shape";
import ElementDefinition from "../../../../repository/definition/elementdefinition";
import CaseFileStepDefinition from "../../../../repository/definition/testcase/casefilestepdefinition";
import FinishStepDefinition from "../../../../repository/definition/testcase/finishstepdefinition";
import StartStepDefinition from "../../../../repository/definition/testcase/startstepdefinition";
import FixtureDefinition from "../../../../repository/definition/testcase/testfixturedefintion";
import TestPlanDefinition from "../../../../repository/definition/testcase/testplandefinition";
import Util from "../../../../util/util";
import ElementView from '../../../editors/modelcanvas/elementview';
import Halo from '../../../editors/modelcanvas/halo/halo';
import Properties from '../../../editors/modelcanvas/properties';
import TestCaseCanvas from '../testcasecanvas';
import FixtureView from "./fixtureview";
import TestPlanHalo from "./halo/testplanhalo";
import TestCaseElementView from "./testcaseelementview";
import TestFileStepView from "./testfilestepview";
import TestFinishStepView from "./testfinishview";
import TestStartStepView from "./teststartstepview";
import TestStepView from "./teststepview";


export default class TestPlanView extends TestCaseElementView<TestPlanDefinition> {
    fixtureView: FixtureView;
    static typeDescription = 'Test Plan';

    static createNew(canvas: TestCaseCanvas, x = 10, y = 10) {
        if (!canvas.definition.testplan) {
            canvas.definition.testplan = canvas.definition.createDefinition(TestPlanDefinition);
        }
        const shape = canvas.diagram.createShape(x, y, 100, 60, canvas.definition.testplan.id);
        return new TestPlanView(canvas, canvas.definition.testplan, shape);
    }

    constructor(public canvas: TestCaseCanvas, definition: TestPlanDefinition, shape: ShapeDefinition) {
        super(canvas, undefined, definition, shape);

        this.fixtureView = this.addPlanItem(definition.testFixture, (def) => {
            return this.canvas.diagram.createShape(20, 20, 60, 20, def.id);
        }) as FixtureView;

        for (const stepDef of definition.testSteps) {
            this.addPlanItem(stepDef, (def) => {
                return this.canvas.diagram.createShape(20, 60 + this.__childElements.length * 60, 100, 30, def.id);
            });
        }
    }

    private addPlanItem<E extends ElementDefinition>(definition: E, shapeBuilder: (definition: E) => ShapeDefinition) {
        // Only add the new plan item if we do not yet visualize it
        if (!this.__childElements.find(planItemView => planItemView.definition.id == definition.id)) {
            // Check whether we can find a shape for the definition.
            const shape = this.canvas.diagram.getShape(definition) ?? shapeBuilder(definition);
            if (!shape) {
                console.warn(`Error: missing shape definition for ${definition.constructor.name} named "${definition.name}" with id "${definition.id}"`);
                return;
            }
            // Add a view based on the definition with its shape
            const child = this.__addChildElement(this.createPlanItemView(definition, shape));
            child.changeParent(this);

            return child;
        }
    }

    __canHaveAsChild(elementType: Function): boolean {
        return elementType == FixtureView ||
            Util.isSubClassOf(TestStepView, elementType);
    }

    createChildView(viewType: Function, x: number, y: number): ElementView<any> {
        if (Util.isSubClassOf(TestStepView, viewType)) {
            return this.__addChildElement((viewType as any).create(this, x, y));
        } else if (viewType == FixtureView) {
            return this.__addChildElement(FixtureView.create(this, x, y));
        } else { // Could (should?) be sentry
            return super.createChildView(viewType, x, y);
        }
    }

    /**
     * Creates a new view based on the plan item,
     */
    createPlanItemView(definition: ElementDefinition, shape: ShapeDefinition) {
        if (definition instanceof StartStepDefinition) {
            return new TestStartStepView(this, definition as StartStepDefinition, shape);
        }
        else if (definition instanceof CaseFileStepDefinition) {
            return new TestFileStepView(this, definition as CaseFileStepDefinition, shape);
        }
        else if (definition instanceof FinishStepDefinition) {
            return new TestFinishStepView(this, definition as FinishStepDefinition, shape);
        }
        else if (definition instanceof FixtureDefinition) {
            return new FixtureView(this, definition, shape);
        }
        else {
            throw new Error('This type of plan item cannot be instantiated into a view ' + definition.name);
        }
    }


    createProperties() {
        return new Properties(this);
    }

    createHalo(): Halo {
        return new TestPlanHalo(this);
    }

    private static headerHeight = 20;
    get markup() {
        return `<g>
                    <polyline @selector='header' points="10,${TestPlanView.headerHeight} 15,0 250,0 255,${TestPlanView.headerHeight}" ></polyline>
                    <rect @selector='body' x="0" y="${TestPlanView.headerHeight}" width="${this.shape.width}" height="${this.shape.height - TestPlanView.headerHeight}"></rect>
                    <text @selector='label' font-size="12" ></text>
                </g>`;
    }

    get markupAttributes() {
        return {
            label: {
                'ref': 'header',
                'ref-x': .5,
                'ref-y': 18,
                'x-alignment': 'middle',
                'y-alignment': 'bottom'
            },
            body: {
                height: `calc(h - ${TestPlanView.headerHeight})`,
                width: 'calc(w)',
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

        // position planningTable with respect to the parent
        const translateY = 20 - y;
        const translateX = 20 - x;

        if (translateY != 0) {
            this.xyz_joint.translate(translateX, translateY);
        }
    }

    resizing(w: number, h: number): void {
        super.resizing(w, h);
    }

    __delete() {
        super.__delete();
        delete this.canvas.testplanView;
    }

}

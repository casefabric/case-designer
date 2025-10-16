import ShapeDefinition from "../../../../repository/definition/dimensions/shape";
import TestAnnotationDefinition from "../../../../repository/definition/testcase/testannotation";
import TestTextAnnotationHalo from "./halo/testtextannotationhalo";
import TestAnnotationProperties from "./properties/testannotationproperties";
import TestCaseElementView from "./testcaseelementview";
import TestPlanView from "./testplanview";

export default class TestAnnotationView extends TestCaseElementView<TestAnnotationDefinition> {
    /**
     * Create a new TextAnnotationView at the given coordinates.
     */
    static create(plan: TestPlanView, x: number, y: number): TestAnnotationView {
        const definition = plan.canvas.definition.createTextAnnotation();
        const shape = plan.canvas.diagram.createShape(x, y, 100, 60, definition.id);
        return new TestAnnotationView(plan, definition, shape);
    }

    /**
     * Creates a new TextAnnotationView element
     */
    constructor(public parent: TestPlanView, definition: TestAnnotationDefinition, shape: ShapeDefinition) {
        super(parent.canvas, parent, definition, shape);
    }

    get text() {
        return this.definition.text;
    }

    get wrapText() {
        return true;
    }

    createProperties() {
        return new TestAnnotationProperties(this);
    }

    createHalo() {
        return new TestTextAnnotationHalo(this);
    }

    get markup() {
        return `<g @selector="scalable">
                    <rect @selector='body' width="100" height="60" rx="5" ry="5" ></rect>
                </g>
                <text @selector='label' ></text>`;
    }

    get markupAttributes() {
        return {
            body: {
                stroke: 'rgb(221, 211, 211)',
            },
            label: {
                ref: 'body',
                'ref-x': 0.5,
                'ref-y': 0.5,
                'y-alignment': 'middle',
                'x-alignment': 'middle',
            }
        };
    }

    get isTextAnnotation() {
        return true;
    }
}

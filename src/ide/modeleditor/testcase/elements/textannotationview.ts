import ShapeDefinition from "../../../../repository/definition/dimensions/shape";
import TextAnnotationDefinition from "../../../../repository/definition/testcase/textannotation";
import Halo from "../../../editors/modelcanvas/halo/halo";
import TextAnnotationProperties from "./properties/textannotationproperties";
import TestCaseElementView from "./testcaseelementview";
import TestPlanView from "./testplanview";

export default class TextAnnotationView extends TestCaseElementView<TextAnnotationDefinition> {
    /**
     * Create a new TextAnnotationView at the given coordinates.
     */
    static create(plan: TestPlanView, x: number, y: number): TextAnnotationView {
        const definition = plan.canvas.definition.createTextAnnotation();
        const shape = plan.canvas.diagram.createShape(x, y, 100, 60, definition.id);
        return new TextAnnotationView(plan, definition, shape);
    }

    /**
     * Creates a new TextAnnotationView element
     */
    constructor(public parent: TestPlanView, definition: TextAnnotationDefinition, shape: ShapeDefinition) {
        super(parent.canvas, parent, definition, shape);
    }

    get text() {
        return this.definition.text;
    }

    get wrapText() {
        return true;
    }

    createProperties() {
        return new TextAnnotationProperties(this);
    }

    createHalo() {
        return new Halo(this);
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

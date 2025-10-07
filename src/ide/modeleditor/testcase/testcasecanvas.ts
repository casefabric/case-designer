import { dia } from "@joint/core";
import Edge from "../../../repository/definition/dimensions/edge";
import ShapeDefinition from "../../../repository/definition/dimensions/shape";
import DocumentableElementDefinition from "../../../repository/definition/documentableelementdefinition";
import TestAnnotationDefinition from "../../../repository/definition/testcase/testannotation";
import TestcaseModelDefinition from "../../../repository/definition/testcase/testcasemodeldefinition";
import Connector from "../../editors/modelcanvas/connector/connector";
import ModelCanvas from "../../editors/modelcanvas/modelcanvas";
import ShapeBox from "../../editors/modelcanvas/shapebox/shapebox";
import UndoManager from "../../editors/modelcanvas/undoredo/undomanager";
import BottomSplitter from "../../splitter/bottomsplitter";
import TestRunnerForm from "./editors/testrunnerform";
import TestCaseConnector from "./elements/connector/testcaseconnector";
import TestAnnotationView from "./elements/testannotationview";
import TestCaseElementView from "./elements/testcaseelementview";
import TestPlanView from "./elements/testplanview";
import TestElementRegistry from "./shapebox/testelementregistry";
import TestcaseModelEditor from "./testcasemodeleditor";

export default class TestCaseCanvas extends ModelCanvas<TestcaseModelDefinition, DocumentableElementDefinition<TestcaseModelDefinition>, TestCaseElementView> {
    testplanView?: TestPlanView;
    divTestRunner: JQuery<HTMLElement>;
    testRunnerForm: TestRunnerForm;
    constructor(public htmlParent: JQuery<HTMLElement>,
        public editor: TestcaseModelEditor,
        public definition: TestcaseModelDefinition,
        public undoManager: UndoManager) {
        super(editor, htmlParent, definition, undoManager);

        this.divCaseModel.append('<div class="divTestRunnerContainer"></div>');
        this.divTestRunner = this.html.find('.divTestRunnerContainer');
        this.testRunnerForm = new TestRunnerForm(this.editor, this.divTestRunner);
        new BottomSplitter(this.divCaseModel, 900, 100);

        if (this.definition.testplan) {
            this.loading = true;

            let planShape = this.diagram.getShape(this.definition.testplan);
            if (!planShape) {
                planShape = this.diagram.createShape(20, 20, 800, 500, this.definition.testplan.id);
            }
            this.testplanView = new TestPlanView(this, this.definition.testplan, planShape!);
            this.loading = false;

            const jointElements = this.items.map(item => item.xyz_joint as dia.Cell).concat(this.connectors.map(c => c.xyz_joint));
            this.graph.addCells(jointElements);

            // trigger constraints
            this.items.forEach(item => {
                item.moving(item.shape.x, item.shape.y);
                item.moved(item.shape.x, item.shape.y, undefined);

                item.resizing(item.shape.width, item.shape.height);
                item.resized();
            });

            this.renderLooseShapesAndDropUnusedShapes();

            // Finally render all connectors
            this.renderConnectors();


            this.testplanView.refreshView();

            // Ensure the definition is in sync with the diagram
            // Via undoManager, since the canvas is not yet attached to the editor (editor.saveModel() would not work)
            setTimeout(() => this.undoManager.saveDefinition(this.definition));
        }
    }

    renderLooseShapesAndDropUnusedShapes() {
        const getDefinition = (shape: ShapeDefinition) => {
            const element = this.definition.getElement(shape.cmmnElementRef);
            if (element) {
                return element;
            } else {
                // But if it is not, then we should print a warning
                console.warn(`Error: found a shape without a matching definition: ${shape.toString()}`)
                return undefined;
            }
        }
        // Now render the "loose" shapes (textboxes and casefileitems) in the appropriate parent stage
        this.diagram.shapes.forEach(shape => {
            const definitionElement = getDefinition(shape);
            // Only take the textboxes not the other elements, as they are rendered from testplanview constructor.
            if (definitionElement instanceof TestAnnotationDefinition) {
                this.testplanView?.__addChildElement(new TestAnnotationView(this.testplanView, definitionElement, shape));
            }

            // Now check if we have an actually view element for this shape, if not, it means we have no corresponding definition element, and then we'll remove the shape from the Dimensions.
            const view = this.items.find(view => view.shape === shape);
            if (!view) {
                shape.removeDefinition();
            }
        });
    }


    private renderConnectors() {
        this.diagram.edges.forEach(edge => {
            const source = this.getItem(edge.sourceId);
            const target = this.getItem(edge.targetId);

            if (!source) {
                console.warn('Found illegal edge, without source ' + edge.sourceId, edge, target);
                return;
            }
            if (!target) {
                console.warn('Found illegal edge, without target ' + edge.targetId, edge, source);
                return;
            }
            source.__connect(target, edge);
        });
    }

    render(model: TestcaseModelDefinition) {
        // throw new Error("Method not implemented.");
    }

    createShapeBox(htmlElement: JQuery<HTMLElement>): ShapeBox {
        return new ShapeBox(this, new TestElementRegistry(), htmlElement);
    }

    __createConnector(source: TestCaseElementView, target: TestCaseElementView, edge: Edge): Connector {
        return new TestCaseConnector(source, target, edge);
    }

    setDropHandlers() {
        super.setDropHandlers();

        if (!this.testplanView) {
            this.shapeBox.setDropHandler(
                dragData => this.createTestPlan(dragData.event),
                dragData => dragData.shapeType == TestPlanView && !this.testplanView);
        }
    }

    createTestPlan(e: JQuery<PointerEvent>) {
        const coor = this.getCursorCoordinates(e);
        this.testplanView = TestPlanView.createNew(this, coor.x, coor.y);
        this.__addElement(this.testplanView);
        this.editor.completeUserAction();

        this.testplanView.propertiesView.show(true);
        return this.testplanView;
    }

    removeDropHandlers() {
        this.shapeBox.removeDropHandler();

        super.removeDropHandlers();
    }

}

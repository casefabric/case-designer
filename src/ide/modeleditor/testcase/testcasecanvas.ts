import { dia } from "@joint/core";
import TestcaseModelDefinition from "../../../repository/definition/testcase/testcasemodeldefinition";
import ModelCanvas from "../../editors/modelcanvas/modelcanvas";
import ShapeBox from "../../editors/modelcanvas/shapebox/shapebox";
import UndoManager from "../../editors/modelcanvas/undoredo/undomanager";
import TestPlanView from "./elements/testplanview";
import TestElementRegistry from "./shapebox/testelementregistry";
import TestcaseModelEditor from "./testcasemodeleditor";

export default class TestCaseCanvas extends ModelCanvas<TestcaseModelDefinition> {
    testplanView?: TestPlanView;
    constructor(public htmlParent: JQuery<HTMLElement>,
        public editor: TestcaseModelEditor,
        public definition: TestcaseModelDefinition,
        public undoManager: UndoManager) {
        super(editor, htmlParent, definition, undoManager);

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

            this.testplanView.refreshView();

            // Ensure the definition is in sync with the diagram
            // Via undoManager, since the canvas is not yet attached to the editor (editor.saveModel() would not work)
            setTimeout(() => this.undoManager.saveDefinition(this.definition));
        }
    }

    render(model: TestcaseModelDefinition) {
        // throw new Error("Method not implemented.");
    }

    createShapeBox(htmlElement: JQuery<HTMLElement>): ShapeBox {
        return new ShapeBox(this, new TestElementRegistry(), htmlElement);
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

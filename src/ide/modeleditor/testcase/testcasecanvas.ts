import { dia } from "@joint/core";
import TestcaseModelDefinition from "../../../repository/definition/testcase/testcasemodeldefinition";
import ModelCanvas from "../../editors/modelcanvas/modelcanvas";
import ShapeBox from "../../editors/modelcanvas/shapebox/shapebox";
import UndoManager from "../../editors/modelcanvas/undoredo/undomanager";
import FixtureView from "./elements/fixtureview";
import TestElementRegistry from "./shapebox/testelementregistry";
import TestcaseModelEditor from "./testcasemodeleditor";

export default class TestCaseCanvas extends ModelCanvas<TestcaseModelDefinition> {
    fixtureView: any;
    constructor(public htmlParent: JQuery<HTMLElement>,
        public editor: TestcaseModelEditor,
        public definition: TestcaseModelDefinition,
        public undoManager: UndoManager) {
        super(editor, htmlParent, definition, undoManager);

        if (this.definition.fixture) {
            let planShape = this.diagram.getShape(this.definition.fixture);
            if (!planShape) {
                planShape = this.diagram.createShape(30, 100, 100, 60, this.definition.fixture.id);
            }
            this.fixtureView = new FixtureView(this, this.definition.fixture, planShape!);

            const jointElements = this.items.map(item => item.xyz_joint as dia.Cell).concat(this.connectors.map(c => c.xyz_joint));
            this.graph.addCells(jointElements);

            // trigger constraints
            this.items.forEach(item => {
                item.moving(item.shape.x, item.shape.y);
                item.moved(item.shape.x, item.shape.y, undefined);

                item.resizing(item.shape.width, item.shape.height);
                item.resized();
            });

            this.fixtureView.refreshView();

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

        if (!this.fixtureView) {
            this.shapeBox.setDropHandler(
                dragData => this.createTestPlan(dragData.event),
                dragData => dragData.shapeType == FixtureView && !this.fixtureView);
        }
    }

    createTestPlan(e: JQuery<PointerEvent>) {
        const coor = this.getCursorCoordinates(e);
        this.fixtureView = FixtureView.createNew(this, coor.x, coor.y);
        this.__addElement(this.fixtureView);
        this.editor.completeUserAction();

        this.fixtureView.propertiesView.show(true);
        return this.fixtureView;
    }

    removeDropHandlers() {
        this.shapeBox.removeDropHandler();

        super.removeDropHandlers();
    }

}

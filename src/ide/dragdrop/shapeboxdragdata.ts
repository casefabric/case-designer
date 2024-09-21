import ShapeBox from "@ide/modeleditor/case/shapebox";
import DragData from "./dragdata";

export default class ShapeBoxDragData extends DragData {
    constructor(shapeBox: ShapeBox, model: string, shapeType: string, imgURL: string, fileName: string) {
        super(shapeBox.case.editor.ide, shapeBox, model, shapeType, imgURL, fileName);
    }
}

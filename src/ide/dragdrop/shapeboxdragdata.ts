import ShapeBox from "@ide/modeleditor/case/shapebox";
import DragData from "./dragdata";
import { ElementMetadata } from "@ide/modeleditor/case/elements/elementregistry";

export default class ShapeBoxDragData extends DragData {
    public shapeType: Function;

    constructor(shapeBox: ShapeBox, public metadata: ElementMetadata) {
        super(shapeBox, metadata.typeDescription, metadata.smallImage);
        this.shapeType = metadata.cmmnElementType;
    }
}

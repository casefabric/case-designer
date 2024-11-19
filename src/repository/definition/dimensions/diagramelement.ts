import ElementDefinition from "../elementdefinition";
import Dimensions from "./dimensions";

export default class DiagramElement extends ElementDefinition<Dimensions> {
    /**
     * Creates a new DiagramElement that belongs to the Dimensions object.
     */
    constructor(importNode: Element, public dimensions: Dimensions, parent?: ElementDefinition<Dimensions>) {
        super(importNode, dimensions, parent);
    }
}

import XML from "../../util/xml";
import AIModelDefinition from "../definition/ai/aimodeldefinition";
import DefinitionDeployment from "./definitiondeployment";
import Definitions from "./definitions";

export default class AIDeployment extends DefinitionDeployment {

    constructor(public definitionsDocument: Definitions, public definition: AIModelDefinition) {
        super(definitionsDocument, definition);

        // convert to CMMN compliant structure (process)
        const oldElement = this.element;
        this.element = XML.createChildElement(oldElement.ownerDocument!, 'process');
        // Copy all attributes
        Array.from(oldElement.attributes).forEach(attribute => {
            this.element.setAttribute(attribute.name, attribute.value);
        });
        // Clone all child nodes to the new process element
        Array.from(oldElement.childNodes).forEach(childNode => {
            this.element.appendChild(childNode.cloneNode(true));
        });
        // Remove the old ai element
        oldElement.parentNode?.removeChild(oldElement);
    }
}


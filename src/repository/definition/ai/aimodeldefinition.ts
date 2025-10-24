import AIFile from "../../serverfile/aifile";
import ParameterDefinition from "../contract/parameterdefinition";
import ModelDefinition from "../modeldefinition";
import ParameterizedModelDefinition from "../parameterizedmodeldefinition";
import AIImplementationDefinition from "./aiimplementationdefinition";

export default class AIModelDefinition extends ModelDefinition implements ParameterizedModelDefinition<AIModelDefinition> {
    input: ParameterDefinition<AIModelDefinition>[] = [];
    output: ParameterDefinition<AIModelDefinition>[] = [];
    implementation?: AIImplementationDefinition;
    /**
     * Imports an XML element and parses it into a in-memory definition structure.
     */
    constructor(public file: AIFile) {
        super(file);
        /** @type {Array<ParameterDefinition>} */
        this.input = this.parseElements('input', ParameterDefinition);
        /** @type {Array<ParameterDefinition>} */
        this.output = this.parseElements('output', ParameterDefinition);
        this.implementation = this.parseImplementation(AIImplementationDefinition);
    }

    get inputParameters() {
        return this.input;
    }

    get outputParameters() {
        return this.output;
    }

    findInputParameter(identifier: string) {
        return this.inputParameters.find(p => p.hasIdentifier(identifier));
    }

    findOutputParameter(identifier: string) {
        return this.outputParameters.find(p => p.hasIdentifier(identifier));
    }

    toXML() {
        const xmlDocument = super.exportModel('ai', 'input', 'output', 'implementation');
        this.exportNode.setAttribute('implementationType', 'http://www.omg.org/spec/CMMN/ProcessType/Unspecified');
        return xmlDocument;
    }
}

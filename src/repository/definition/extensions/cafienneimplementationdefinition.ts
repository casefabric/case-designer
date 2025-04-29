import { Element } from "../../../util/xml";
import ElementDefinition from "../elementdefinition";
import ModelDefinition from "../modeldefinition";
import { IMPLEMENTATION_TAG } from "../xmlserializable";
import CMMNExtensionDefinition from "./cmmnextensiondefinition";

/**
 * Simple helper class to support specific extensions to CMMN   
 */
export default class CafienneImplementationDefinition<M extends ModelDefinition> extends CMMNExtensionDefinition<M> {
    static TAG = IMPLEMENTATION_TAG;
    constructor(importNode: Element, modelDefinition: M, parent?: ElementDefinition<M>) {
        super(importNode, modelDefinition, parent);
    }
}

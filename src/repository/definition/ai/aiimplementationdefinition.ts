import XML, { Element } from "../../../util/xml";
import ElementDefinition from "../elementdefinition";
import CafienneImplementationDefinition from "../extensions/cafienneimplementationdefinition";
import AIModelDefinition from "./aimodeldefinition";

export default class AIImplementationDefinition extends CafienneImplementationDefinition<AIModelDefinition> {
    subProcessClassName: string;
    private _xml: string;

    constructor(importNode: Element, modelDefinition: AIModelDefinition, parent?: ElementDefinition<AIModelDefinition>) {
        super(importNode, modelDefinition, parent);
        this.subProcessClassName = this.parseAttribute('class');
        this._xml = XML.prettyPrint(this.importNode);
    }

    get xml() {
        return this._xml;
    }

    set xml(xml) {
        this._xml = xml;
    }

    createExportNode(parentNode: Element) {
        super.getExtensionsElement(parentNode).appendChild(XML.loadXMLString(this._xml).documentElement ?? (() => { throw new Error('No ownerDocument found'); })());
    }
}

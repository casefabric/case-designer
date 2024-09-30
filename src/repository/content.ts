import XML from "@util/xml";
import ServerFile from "./serverfile";
import ModelDefinition from "./definition/modeldefinition";

export default class Content<M extends ModelDefinition> {
    private _source: any;
    private _definition?: M;
    xml?: Element;

    constructor(public file: ServerFile<M>) {
    }

    get source() {
        return this._source;
    }

    set source(source) {
        if (this._source !== source) {
            this._definition = undefined;
            this._source = source;
            const xml = XML.parseXML(source);
            this.xml = xml ? xml.documentElement : xml;
        }
    }

    get definition(): M | undefined {
        return this._definition;
    }

    set definition(definition: M | undefined) {
        this._definition = definition;
    }
}

import { Element } from "../../../../util/xml";
import Validator from "../../../validate/validator";
import ElementDefinition from "../../elementdefinition";
import ModelDefinition from "../../modeldefinition";
import UnnamedCMMNElementDefinition from "../../unnamedcmmnelementdefinition";
import XMLSerializable from "../../xmlserializable";
import CaseDefinition from "../casedefinition";
import CaseFileItemReference from "../casefile/casefileitemreference";
import CMMNElementDefinition from "../cmmnelementdefinition";
import ExpressionDefinition from "./expressiondefinition";

/**
 * Simple class that does basic expression parsing 
 */
export default abstract class ExpressionContainer extends UnnamedCMMNElementDefinition {
    private _expression?: ExpressionDefinition;
    contextRef: CaseFileItemReference;

    constructor(importNode: Element, caseDefinition: CaseDefinition, public parent: CMMNElementDefinition) {
        super(importNode, caseDefinition, parent);
        this._expression = this.parseElement(this.expressionTagName(), ExpressionDefinition);
        this.contextRef = this.parseInternalReference('contextRef');
    }

    abstract getContextDescription(): string;

    abstract getContextElement(): CMMNElementDefinition;

    validate(validator: Validator) {
        if (!this.body || this.body.trim().length === 0) {
            validator.raiseError(this.getContextElement(), `${this.getContextDescription()} must have an expression`)
        }

        if (this.contextRef.isEmpty && this.body !== 'true' && this.body !== 'false') {
            validator.raiseWarning(this.getContextElement(), `${this.getContextDescription()} has no case file item context`);
        }
    }

    referencesElement(element: XMLSerializable) {
        return this.contextRef.references(element);
    }

    updateReferences<MD extends ModelDefinition>(element: ElementDefinition<MD>, oldId: string, newId: string, oldName: string, newName: string) {
        if (this.contextRef.references(oldId)) {
            this.contextRef.update(newId);
        }
    }

    get contextName() {
        return this.contextRef.name;
    }

    protected abstract expressionTagName(): string;

    /**
     * @returns {ExpressionDefinition}
     */
    get expression() {
        if (!this._expression) {
            this._expression = super.createDefinition(ExpressionDefinition);
        }
        return this._expression;
    }

    set language(newLanguage) {
        if (newLanguage) {
            this.expression.language = newLanguage;
        }
    }

    get language() {
        if (this.expression) return this.expression.language;
    }

    set body(newBody) {
        this.expression.body = newBody;
    }

    get body() {
        return this._expression ? this.expression.body : '';
    }

    get hasCustomLanguage() {
        return this._expression?.hasCustomLanguage;
    }

    createExportNode(parentNode: Element, tagName: string, ...propertyNames: any[]) {
        super.createExportNode(parentNode, tagName, 'contextRef', propertyNames);
        if (this._expression) {
            this._expression.createExportNode(this.exportNode, this.expressionTagName());
        }
    }
}

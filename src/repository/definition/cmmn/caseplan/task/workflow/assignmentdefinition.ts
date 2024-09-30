import CaseDefinition from "@repository/definition/cmmn/casedefinition";
import CMMNElementDefinition from "@repository/definition/cmmnelementdefinition";
import UnnamedCMMNElementDefinition from "../../../../unnamedcmmnelementdefinition";
import ExpressionDefinition from "../../../expression/expressiondefinition";

export default class AssignmentDefinition extends UnnamedCMMNElementDefinition {
    static TAG = 'assignment';
    private _expression?: ExpressionDefinition;
    contextRef: string;

    constructor(importNode: Element, caseDefinition: CaseDefinition, public parent?: CMMNElementDefinition) {
        super(importNode, caseDefinition, parent);
        this._expression = this.parseElement('condition', ExpressionDefinition);
        this.contextRef = this.parseAttribute('contextRef');
    }

    get contextName() {
        const context = this.caseDefinition.getElement(this.contextRef);
        return context ? context.name : '';
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, AssignmentDefinition.TAG, this.contextRef);
        if (this.expression) {
            // Hmmm... perhaps we should rename 'expression' to 'condition' ...
            this.expression.createExportNode(this.exportNode, 'condition');
        }
    }

    /**
     * @returns {ExpressionDefinition}
     */
    get expression() {
        if (! this._expression) {
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
}

import { Element } from "../../../../util/xml";
import ParameterDefinition from "../../contract/parameterdefinition";
import ElementDefinition from "../../elementdefinition";
import ModelDefinition from "../../modeldefinition";
import CaseDefinition from "../casedefinition";
import CaseFileItemDef from "../casefile/casefileitemdef";
import CaseFileItemReference from "../casefile/casefileitemreference";
import CMMNElementDefinition from "../cmmnelementdefinition";
import ExpressionDefinition from "../expression/expressiondefinition";

export default class CaseParameterDefinition extends ParameterDefinition<CaseDefinition> {
    bindingRef: CaseFileItemReference;
    bindingRefinement?: ExpressionDefinition;

    constructor(importNode: Element, public caseDefinition: CaseDefinition, parent: CMMNElementDefinition) {
        super(importNode, caseDefinition, parent);
        this.bindingRef = this.parseInternalReference<CaseFileItemReference>('bindingRef');
        this.bindingRefinement = this.parseElement('bindingRefinement', ExpressionDefinition);
    }

    referencesElement<MD extends ModelDefinition>(element: ElementDefinition<MD>) {
        return element.id === this.bindingRef.getDefinition()?.id;
    }

    updateReferences<MD extends ModelDefinition>(element: ElementDefinition<MD>, oldId: string, newId: string, oldName: string, newName: string) {
        if (this.bindingRef.references(oldId)) {
            this.bindingRef.update(newId);
            // Check if we also need to update the parameter name (assuming that a same name)
            if (this.name === oldName) {
                this.name = newName;
            }
        }
    }

    get binding(): CaseFileItemDef | undefined {
        return this.bindingRef.getDefinition();
    }

    get bindingName() {
        return this.bindingRef.name;
    }

    get defaultOperation() {
        return this.binding ? this.binding.isArray ? 'add' : 'update' : '';
    }

    get hasUnusualBindingRefinement() {
        return this.bindingRefinement && ['add', 'update', 'replace'].indexOf(this.bindingRefinement.body.toLowerCase()) < 0;
    }

    get bindingRefinementExpression() {
        return this.bindingRefinement ? this.bindingRefinement.body : this.defaultOperation;
    }

    set bindingRefinementExpression(expression) {
        if (expression && expression != this.defaultOperation) {
            this.getBindingRefinement().body = expression;
        } else {
            if (this.bindingRefinement) {
                this.bindingRefinement.removeDefinition();
            }
        }
    }

    /**
     * Gets or creates the bindingRefinement object.
     */
    getBindingRefinement() {
        if (!this.bindingRefinement) {
            this.bindingRefinement = super.createDefinition(ExpressionDefinition);
        }
        return this.bindingRefinement;
    }

    createExportNode(parentNode: Element, tagName: string) {
        // Parameters have different tagnames depending on their type, so this must be passed.
        super.createExportNode(parentNode, tagName, 'bindingRef', 'bindingRefinement');
    }

    addPropertyToSchema(schema: { title: string; type: string; properties: any; definitions: any; }) {
        if (!this.bindingRef) {
            return;
        }

        const property: any = {};
        property.title = this.name;
        schema.properties[this.name] = property;

        this.bindingRef.getDefinition()?.toJSONSchema(property, [], schema);

    }

}

import { Element } from "../../../util/xml";
import ElementDefinition from "../elementdefinition";
import CafienneImplementationDefinition from "../extensions/cafienneimplementationdefinition";
import ModelDefinition from "../modeldefinition";

export default class ParameterDefinition<M extends ModelDefinition = ModelDefinition> extends ElementDefinition<M> {
    required: boolean = false;
    isNew: boolean;
    typeRef: string;

    constructor(importNode: Element, caseDefinition: M, parent: ElementDefinition<M>) {
        super(importNode, caseDefinition, parent);
        this.required = this.parseImplementation(CafienneImplementationDefinition).parseBooleanAttribute('required', false);
        this.typeRef = this.parseAttribute('typeRef');
        this.isNew = false; // This property is used in the HumanTaskEditor and ProcessTaskEditor
    }

    createExportNode(parentNode: Element, tagName: string, ...propertyNames: any[]) {
        // Parameters have different tagnames depending on their type, so this must be passed.
        super.createExportNode(parentNode, tagName, 'typeRef', propertyNames);
        if (this.required) { // Required is a customization to the spec, put in an extension element
            this.createImplementationNode().setAttribute('required', 'true');
        }
    }

    addPropertyToSchema(schema: { title: string; type: string; properties: any; definitions: any; }) {
        if (!this.typeRef) {
            return;
        }

        const property: any = {};
        property.title = this.name;
        schema.properties[this.name] = property;

        const $id = this.typeRef.slice(0, this.typeRef.length - 5).replace('/', '\\'); // Strip ".type" from id
        property['$ref'] = '#/definitions/' + $id;

        const typeDef = this.modelDefinition.file.repository.
            getTypes().
            find(type => type.fileName === this.typeRef)?.definition;
        if (!typeDef) {
            return;
        }

        if (!schema.definitions[$id]) {
            const jsonTypeDefinition = {
                $id: $id,
                type: 'object'
            }
            schema.definitions[$id] = jsonTypeDefinition;
            typeDef.schema.toJSONSchema(jsonTypeDefinition, schema);
        }
    }

    static generateSchema(name: string, inputs: ParameterDefinition[]): any {
        const formSchema = {
            schema: {
                title: name,
                type: "object",
                properties: {},
                definitions: {},
            }
        };

        for (const input of inputs) {
            input.addPropertyToSchema(formSchema.schema);
        }

        return formSchema;
    }
}

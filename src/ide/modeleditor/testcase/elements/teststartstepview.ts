import CaseParameterDefinition from "../../../../repository/definition/cmmn/contract/caseparameterdefinition";
import ShapeDefinition from "../../../../repository/definition/dimensions/shape";
import StartStepDefinition from "../../../../repository/definition/testcase/startstepdefinition";
import Util from "../../../../util/util";
import ElementView from '../../../editors/modelcanvas/elementview';
import Halo from '../../../editors/modelcanvas/halo/halo';
import TestCaseProperties from "./properties/testcaseproperties";
import TestPlanView from "./testplanview";
import TestStepView from "./teststepview";


export default class TestStartStepView extends TestStepView<StartStepDefinition> {
    static create(plan: TestPlanView, x: number, y: number) {
        const definition: StartStepDefinition = plan.definition.createDefinition(StartStepDefinition);
        plan.definition.testSteps.push(definition);
        const shape = plan.canvas.diagram.createShape(x, y, 100, 100, definition.id);
        return new TestStartStepView(plan, definition, shape);
    }

    constructor(parent: TestPlanView, definition: StartStepDefinition, shape: ShapeDefinition) {
        super(parent, definition, shape);
    }

    createProperties() {
        return new TestCaseProperties(this);
    }

    createHalo(): Halo {
        return new Halo(this);
    }

    get title(): string {
        return "Start";
    }

    moved(x: number, y: number, newParent: ElementView) {
    }

    /**
     * A planningTable has a fixed position on its parent, it cannot be moved.
     * Position cursor is not relevant
     */
    moving(x: number, y: number) {
        super.moving(x, y);
    }

    resizing(w: number, h: number): void {
        super.resizing(w, h);
    }

    get isStartStep(): boolean {
        return true;
    }

    getVariantTypeSchema() {
        const caseDefinition = this.definition.modelDefinition?.testplan?.testFixture?.caseRef.getDefinition();

        if (!caseDefinition) {
            return undefined;
        }
        if (caseDefinition.startCaseSchema.value && caseDefinition.startCaseSchema.value != null) {
            return Util.parseJSON(caseDefinition.startCaseSchema.value).object;
        }

        return this.generateSchema(caseDefinition.inputParameters);
    }

    generateSchema(inputs: CaseParameterDefinition[]): any {
        const ide = this.canvas.editor.ide;

        const properties: any = {};
        const definitions: any = {};
        const formSchema = {
            schema: {
                title: this.name,
                type: "object",
                properties,
                definitions,
            }
        };

        for (const input of inputs) {
            if (!input.typeRef && !input.binding) {
                continue;
            }

            let property: any;
            if (input.typeRef) {
                const typeDef = ide.repository.
                    getTypes().
                    find(type => type.fileName === input.typeRef)?.definition;
                if (!typeDef) {
                    continue;
                }

                property = typeDef.schema?.toJSONSchema(properties, formSchema.schema);
            } else {
                const required: any[] = [];
                property = input.binding?.toJSONSchema(properties, required, formSchema.schema);
            }

            if (input.name && input.name != property.title && property.title) {
                properties[input.name] = property;
                delete properties[property.title];
                property.title = input.name;
            }
        }

        return formSchema;
    }
}

import TestcaseInstance from "../../../testharness/runner/testcaseinstance";
import { Element } from "../../../util/xml";
import DocumentableElementDefinition from "../documentableelementdefinition";
import ElementDefinition from "../elementdefinition";
import TestcaseModelDefinition from "./testcasemodeldefinition";
import TestStepAssertionSetDefinition from "./teststepassertionsetdefinition";
import TestStepPredecessorDefinition from "./teststepprecessordefinition";
import TestStepVariantDefinition from "./teststepvariantdefinition";

export default abstract class TestStepDefinition extends DocumentableElementDefinition<TestcaseModelDefinition> {
    variants: TestStepVariantDefinition[] = [];
    assertionSet?: TestStepAssertionSetDefinition;
    predecessors: TestStepPredecessorDefinition[];


    constructor(importNode: Element, testcase: TestcaseModelDefinition, parent: ElementDefinition<TestcaseModelDefinition>) {
        super(importNode, testcase, parent);

        this.variants = this.parseElements(TestStepVariantDefinition.XML_ELEMENT, TestStepVariantDefinition);
        if (this.variants.length === 0) {
            this.createNewVariantDefinition();
        }
        this.predecessors = this.parseElements(TestStepPredecessorDefinition.XML_ELEMENT, TestStepPredecessorDefinition);

        this.assertionSet = this.parseElement(TestStepAssertionSetDefinition.XML_ELEMENT, TestStepAssertionSetDefinition) ?? this.createDefaultAssertionSetDefinition();
    }

    createNewVariantDefinition() {
        const variant = this.createDefinition(TestStepVariantDefinition, undefined, this.calculateUniqueVariantName()) as TestStepVariantDefinition;
        this.variants.push(variant);

        return variant;
    }
    calculateUniqueVariantName(): string {
        let variantIndex = 'a'.charCodeAt(0);
        let variantName = String.fromCharCode(variantIndex);
        while (this.variants.find(v => v.name == variantName)) {
            variantIndex++;
            variantName = String.fromCharCode(variantIndex);
        }
        return variantName;
    }

    createPredecessor(predessor: DocumentableElementDefinition<TestcaseModelDefinition>) {
        const predecessorDefinition = this.createDefinition(TestStepPredecessorDefinition) as TestStepPredecessorDefinition;
        predecessorDefinition.sourceRef.update(predessor.id);
        this.predecessors.push(predecessorDefinition);
    }
    removePredecessor(definition: TestStepVariantDefinition) {
        const predecessorDefinition = this.predecessors.find(p => p.sourceRef.value === definition.id);
        if (predecessorDefinition) {
            this.predecessors = this.predecessors.filter(p => p !== predecessorDefinition);
            predecessorDefinition.removeDefinition();
        }
    }

    protected createDefaultAssertionSetDefinition(): TestStepAssertionSetDefinition | undefined {
        return this.createDefinition(TestStepAssertionSetDefinition) as TestStepAssertionSetDefinition;
    }

    createExportNode(parentNode: Element, tagName: string, ...propertyNames: any[]) {
        super.createExportNode(parentNode, tagName, 'variants', 'assertionSet', 'predecessors', propertyNames);
    }

    async execute(instance: TestcaseInstance, variant: TestStepVariantDefinition | null): Promise<void> {
        console.log(`Excecuting: ${this.constructor.name} with variant '${variant?.name}'`);
    }
}    

import { Element } from "../../../util/xml";
import DocumentableElementDefinition from "../documentableelementdefinition";
import AssertionDefinition, { CaseInstanceAssertionDefinition } from "./assertiondefinition";
import TestcaseModelDefinition from "./testcasemodeldefinition";
import TestStepDefinition from "./teststepdefinition";
import TestStepPredecessorDefinition from "./teststepprecessordefinition";
import TestStepVariantDefinition from "./teststepvariantdefinition";

export default abstract class TestStepAssertionSetDefinition extends DocumentableElementDefinition<TestcaseModelDefinition> {
    static XML_ELEMENT = 'assertionset';

    predecessors: TestStepPredecessorDefinition[];
    assertions: AssertionDefinition[];

    constructor(importNode: Element, testcase: TestcaseModelDefinition, public parent: TestStepDefinition) {
        super(importNode, testcase, parent);

        this.predecessors = this.parseElements(TestStepPredecessorDefinition.XML_ELEMENT, TestStepPredecessorDefinition);
        this.assertions = parent.constructor.name == 'FinishStepDefinition' ?
            [new CaseInstanceAssertionDefinition(importNode, testcase, this)] : [];
    }

    createPrecessesor(predessor: DocumentableElementDefinition<TestcaseModelDefinition>) {
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

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, TestStepAssertionSetDefinition.XML_ELEMENT, 'predecessors');
    }
}    

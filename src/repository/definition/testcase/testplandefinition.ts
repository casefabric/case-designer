import XML, { Element } from "../../../util/xml";
import DocumentableElementDefinition from "../documentableelementdefinition";
import ElementDefinition from "../elementdefinition";
import CaseFileStepDefinition from "./casefilestepdefinition";
import FinishStepDefinition from "./finishstepdefinition";
import StartStepDefinition from "./startstepdefinition";
import TaskStepDefinition from "./taskstepdefinition";
import TestcaseModelDefinition from "./testcasemodeldefinition";
import FixtureDefinition from "./testfixturedefintion";
import TestStepDefinition from "./teststepdefinition";
import UserEventStepDefinition from "./usereventstepdefinition";

export default class TestPlanDefinition extends DocumentableElementDefinition<TestcaseModelDefinition> {
    static XML_ELEMENT = 'testplan';
    testFixture: FixtureDefinition;
    testSteps: TestStepDefinition[];

    constructor(importNode: Element, testcase: TestcaseModelDefinition, parent: ElementDefinition<TestcaseModelDefinition>) {
        super(importNode, testcase, parent);

        this.testFixture = this.parseElement(FixtureDefinition.XML_ELEMENT, FixtureDefinition) ?? this.createDefinition(FixtureDefinition);
        this.testSteps = this.parseChildren();
    }
    parseChildren(): TestStepDefinition[] {
        const items: TestStepDefinition[] = [];
        const itemCreator = (element: Element, constructor: Function) => this.instantiateChild(element, constructor, items);
        const childParser = (element: Element) => {
            switch (element.tagName) {
                case StartStepDefinition.XML_ELEMENT: return itemCreator(element, StartStepDefinition);
                case CaseFileStepDefinition.XML_ELEMENT: return itemCreator(element, CaseFileStepDefinition);
                case UserEventStepDefinition.XML_ELEMENT: return itemCreator(element, UserEventStepDefinition);
                case FinishStepDefinition.XML_ELEMENT: return itemCreator(element, FinishStepDefinition);
                case TaskStepDefinition.XML_ELEMENT: return itemCreator(element, TaskStepDefinition);
                default: console.error(`Unkown tag '${element.tagName}' cannot be parsed`);
                    return;// ignore other elements
            }
        }
        XML.getChildrenByTagName(this.importNode, '*').forEach(childParser);
        return items;
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, TestPlanDefinition.XML_ELEMENT, 'testFixture', 'testSteps');
    }
}    

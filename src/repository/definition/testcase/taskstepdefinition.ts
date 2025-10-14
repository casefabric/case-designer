import { CaseService, TaskService } from "@casefabric/typescript-client";
import TestcaseInstance from "../../../testharness/runner/testcaseinstance";
import { Element } from "../../../util/xml";
import ElementDefinition from "../elementdefinition";
import TestcaseModelDefinition from "./testcasemodeldefinition";
import TestStepDefinition from "./teststepdefinition";
import TestStepVariantDefinition from "./teststepvariantdefinition";

export default class TaskStepDefinition extends TestStepDefinition {
    static XML_ELEMENT = 'taskstep';

    taskDefinitionId: string;
    taskOutput: object;

    constructor(importNode: Element, testcase: TestcaseModelDefinition, parent: ElementDefinition<TestcaseModelDefinition>) {
        super(importNode, testcase, parent);

        this.taskDefinitionId = this.parseAttribute('taskDefinitionId', 'complete');
        this.taskOutput = this.parseElementCDataToObject('taskOutput', {});
    }

    createExportNode(parentNode: Element) {
        super.createExportNode(parentNode, TaskStepDefinition.XML_ELEMENT, "taskDefinitionId");

        this.exportObjectToElementCDATA(parentNode, 'taskOutput', this.taskOutput);
    }

    async execute(instance: TestcaseInstance, variant: TestStepVariantDefinition | null): Promise<void> {
        instance.caseInstance = await CaseService.getCase(instance.tenantOwner, instance.caseInstance!.id);

        const task = instance.caseInstance.planitems.find(pi => pi.definitionId == this.taskDefinitionId);

        await TaskService.completeTask(instance.tenantOwner, task!, variant?.content);
    }
}    

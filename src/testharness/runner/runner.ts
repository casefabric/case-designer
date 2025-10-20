import { Config as CafienneClientConfig } from "@casefabric/typescript-client";
import Settings from "../../ide/settings/settings";
import CaseDefinition from "../../repository/definition/cmmn/casedefinition";
import StartStepDefinition from "../../repository/definition/testcase/startstepdefinition";
import TestcaseModelDefinition from "../../repository/definition/testcase/testcasemodeldefinition";
import TestStepDefinition from "../../repository/definition/testcase/teststepdefinition";
import Repository from "../../repository/repository";
import StepInstance from "./stepinstance";
import TestcaseInstance from "./testcaseinstance";

export default class Runner {
    repository: Repository;

    constructor(repository: Repository) {
        this.repository = repository;

        // Set the configuration for the Cafienne client
        CafienneClientConfig.CafienneService.url = Settings.serverURL + '/';
        CafienneClientConfig.TokenService.url = Settings.tokenURL;
        CafienneClientConfig.TokenService.issuer = Settings.issuerURL;
        CafienneClientConfig.Log.level = 'info';
        CafienneClientConfig.TestCase.polltimeout = 1000;
        CafienneClientConfig.CafienneService.log.request.body = false
    }

    async runTests(filePattern: string): Promise<TestcaseInstance[]> {
        console.group("Test runner");
        console.log(`Running tests for ${filePattern}`);
        const testcases = this.repository.getTestcases()
            .filter(test => test.fileName.match(filePattern))
            .map(testcase => testcase.definition)
            .filter(testcase => testcase !== undefined)
            .flatMap(testcase => [testcase, testcase, testcase, testcase]);

        const results = await this.runTestcases(testcases);

        console.groupEnd();
        return results;
    }

    async runTestsForCase(caseDefinition: CaseDefinition): Promise<string> {
        console.group(`Test runner: ${caseDefinition.name}`);

        const relevantTestCases = (this.repository.getTestcases()
            .map(testcase => testcase.definition)
            .filter(testcase => testcase !== undefined) as TestcaseModelDefinition[])
            .filter(testcase => testcase.testplan.testFixture?.caseRef.fileName === caseDefinition.id);


        await this.runTestcases(relevantTestCases);


        console.groupEnd();

        return "success";
    }

    private async runTestcases(testcases: TestcaseModelDefinition[]): Promise<TestcaseInstance[]> {
        return await Promise.all(testcases.map(x => this.runTestcase(x)));
    }

    public async runTestcase(testcase: TestcaseModelDefinition): Promise<TestcaseInstance> {
        console.log(`Running testcase: ${testcase.name}`);

        const instance = new TestcaseInstance(testcase);

        return await this.runTestcaseInstance(instance);
    }

    public getInstances(testcase: TestcaseModelDefinition) {
        const startSteps = testcase.testplan.testSteps.filter(step => step instanceof StartStepDefinition);
        const instances: TestcaseInstance[] = [];
        startSteps.forEach(start => {
            this.buildTestInstances(testcase, testcase.testplan.testSteps, [], start, instances);
        })

        return instances;
    }
    buildTestInstances(testcase: TestcaseModelDefinition,
        potentialTestSteps: TestStepDefinition[],
        pathPrefix: StepInstance[],
        current: TestStepDefinition,
        instances: TestcaseInstance[]) {

        if (current.variants.length == 0) {
            instances.push(new TestcaseInstance(testcase, [...pathPrefix, new StepInstance(current, null)]))
        }

        current.variants.forEach(variant => {
            const matchingPredecessors = potentialTestSteps.
                flatMap(step => step.predecessors).
                filter(predecessor => predecessor !== undefined).
                filter(predecessor => predecessor.sourceRef.value == variant.id);

            const newStep = new StepInstance(current, variant);

            if (matchingPredecessors.length == 0) {
                // instantiate with cloned steps
                instances.push(new TestcaseInstance(testcase, [...pathPrefix, newStep].map(step => new StepInstance(step.stepDefinition, step.variant))));
                return;
            }
            matchingPredecessors.forEach(predecessor => {

                this.buildTestInstances(
                    testcase,
                    potentialTestSteps.filter(step => step.id != predecessor.parent?.id),
                    [...pathPrefix, newStep],
                    predecessor.parent,
                    instances
                );
            });
        });
    }
    async runTestcaseInstance(instance: TestcaseInstance) {
        console.group(`Running testcase instance: ${instance.name}`);

        await instance.run();
        console.groupEnd();

        return instance;
    }
}

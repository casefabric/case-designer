import { Config as CafienneClientConfig, User } from "@casefabric/typescript-client";
import Settings from "../../ide/settings/settings";
import CaseDefinition from "../../repository/definition/cmmn/casedefinition";
import TestcaseModelDefinition from "../../repository/definition/testcase/testcasemodeldefinition";
import Repository from "../../repository/repository";
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

    private async runTestcase(testcase: TestcaseModelDefinition): Promise<TestcaseInstance> {
        console.log(`Running testcase: ${testcase.name}`);

        const adminUser = await new User("admin").login();
        console.log(`user logged in: ${adminUser}`);

        const instance = await this.setupTestcaseInstance(adminUser, testcase);

        return await instance.run();
    }

    private async setupTestcaseInstance(adminUser: User, testcase: TestcaseModelDefinition): Promise<TestcaseInstance> {
        const instance = new TestcaseInstance(adminUser, testcase);

        return instance;
    }
}

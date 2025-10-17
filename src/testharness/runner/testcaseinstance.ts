import { assertCasePlan, Case, CaseService, CaseTeam, CaseTeamUser, PlatformService, State, Tenant, TenantService, TenantUser, User } from "@casefabric/typescript-client";

import CaseDefinition from "../../repository/definition/cmmn/casedefinition";
import ExternalReference from "../../repository/definition/references/externalreference";
import TestcaseModelDefinition from "../../repository/definition/testcase/testcasemodeldefinition";
import Definitions from "../../repository/deploy/definitions";
import StepInstance from "./stepinstance";


export default class TestcaseInstance {
    tenantOwner!: TenantUser;
    tenant!: Tenant;
    caseInstance?: Case;
    adminUser!: User;
    failedStep?: StepInstance | undefined;
    setupError: unknown;
    status = "";

    constructor(public testcase: TestcaseModelDefinition, public steps: StepInstance[] = []) {
    }

    get name() {
        return this.steps.map(step => step.name).join('#');
    }

    async caseCompleted(): Promise<void> {
        await assertCasePlan(this.tenantOwner, this.caseInstance!, State.Completed);
    }

    async setupFixture(): Promise<void> {
        this.adminUser = await new User("admin").login();
        console.log(`user logged in: ${this.adminUser}`);

        // make admin user tenant owner
        this.tenantOwner = new TenantUser(this.adminUser.id);
        this.tenantOwner.isOwner = true;
        this.tenant = new Tenant("Test-tenant-" + Date.now().toFixed(), [this.tenantOwner]);

        // make sure all users are logged in
        await Promise.all(this.tenant.users.map(async (user: TenantUser) => {
            await user.login();
        }));


        await PlatformService.createTenant(this.tenantOwner, this.tenant, 204);
        await TenantService.getTenantOwners(this.adminUser, this.tenant); // just to be sure the tenant is properly created
    }

    async startCaseInstance(input?: string): Promise<void> {
        const caseOwner = new CaseTeamUser(this.tenantOwner);
        caseOwner.isOwner = true;
        const caseTeam = new CaseTeam([caseOwner]);

        if (!this.testcase.testplan?.testFixture?.caseRef || this.testcase.testplan?.testFixture?.caseRef.getDefinition() === undefined) {
            throw new Error("Testcase does not have a valid test fixture case reference");
        }
        const compiledCase = compileCase(this.testcase.testplan.testFixture.caseRef);

        const inputObject = input ? JSON.parse(input) : {};
        this.caseInstance = await CaseService.startCase(this.tenantOwner, { tenant: this.tenant, definition: compiledCase, inputs: inputObject, caseTeam, debug: true })
    }

    async run(): Promise<TestcaseInstance> {
        console.group(`Running testcase: ${this.testcase.name}`);
        this.resetState();
        this.status = "pending";

        try {
            try {
                await this.setupFixture();
            } catch (error) {
                this.status = "setup error";
                this.setupError = error;
                return this;
            }

            for (const step of this.steps) {
                await step.run(this);

                if (step.status === "failed") {
                    this.status = "failed";
                    break;
                }
            }
            this.failedStep = this.steps.find(step => step.status === 'failed');
            if (!this.failedStep) {
                this.status = "passed";
            }

        } finally {
            if (this.status == "pending") {
                this.status = "unknown";
            }
            console.groupEnd();
        }

        return this;
    }
    resetState() {
        this.failedStep = undefined;
        this.setupError = undefined;
        this.steps.forEach(step => {
            step.status = "pending";
            step.description = "";
        });
        this.caseInstance = undefined;
        this.status = "";
    }

    get description() {
        if (this.failedStep) {
            return this.failedStep.description.replace(/(\n    at.*)+/g, '');
        }
        else if (this.setupError) {
            return String(this.setupError).replace(/(\n    at.*)+/g, '')
        }
        else {
            return '';
        }
    }
}

function compileCase(caseRef: ExternalReference<CaseDefinition>): string {
    const caseDefinitionSet = new Definitions(caseRef.getDefinition()!);
    const compiledCase = caseDefinitionSet.contents();
    return compiledCase;
}


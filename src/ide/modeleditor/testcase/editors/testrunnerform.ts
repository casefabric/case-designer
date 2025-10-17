import $ from "jquery";
import Runner from "../../../../testharness/runner/runner";
import TestcaseInstance from "../../../../testharness/runner/testcaseinstance";
import HtmlUtil from "../../../util/htmlutil";
import Images from "../../../util/images/images";
import TestcaseModelEditor from "../testcasemodeleditor";
import TestImages from "../testimages";

export default class TestRunnerForm {
    runner: Runner;
    html!: JQuery<HTMLElement>;
    divTRFDetailsContainer!: JQuery<HTMLElement>;
    instanceNodes: InstanceNode[] = [];

    constructor(public editor: TestcaseModelEditor, public htmlParent: JQuery<HTMLElement>) {
        this.runner = new Runner(editor.ide.repository);

        this.renderHTML();
    }

    renderHTML() {
        //create the main element add to document
        this.html = $(
            `<div class="schemadatabox" tabindex="0">
                <div>
                    <div class="testrunnerform basicbox basicform">
                        <div class="testrunnerform-header formheader">
                            <label>Testcase Runner</label>
                        </div>
                        <div class="containerbox">
                            <div class="trf-buttons">
                                <button class="btnRunAll">Run all</button>
                            </div>
                            <div class="trf-container">
                                <div class="trf-header trf-details">
                                    <div>Path</div>
                                    <div>Result</div>
                                    <div>Instance</div>
                                </div>
                                <div class="trf-details-container">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`);
        this.html.find('.btnRunAll').on('click', async () => await this.runAll());
        this.htmlParent.append(this.html);
        this.divTRFDetailsContainer = this.html.find('.trf-details-container');

        this.onTestCaseModelDefinitionUpdate();
    }

    async runAll(): Promise<void> {
        try {
            // TODO: support parallel execution with the client library
            // const runs = this.instanceNodes.map(node => node.runInstance());
            // await Promise.all(runs);
            for (const node of this.instanceNodes) {
                await node.runInstance();
            }
        } catch (error: any) {
            this.editor.ide.danger(error.message);
        }
    }

    // TODO: trigger this on any model update
    onTestCaseModelDefinitionUpdate() {
        if (!this.editor.model) {
            return;
        }

        HtmlUtil.clearHTML(this.divTRFDetailsContainer);

        // this.instanceNodes.forEach(instanceNode => instanceNode.delete());
        let obsoleteNodes = [...this.instanceNodes];

        const instances = this.runner.getInstances(this.editor.model).
            filter((i, ix, a) => a.findIndex(j => this.sameInstance(j, i)) == ix); // uniq
        let cursor = 0;

        instances.forEach(instance => {
            const existingNodeIndex = this.instanceNodes.findIndex(node => this.sameInstance(node.instance, instance));
            if (existingNodeIndex > cursor) {
                cursor = existingNodeIndex;
            }
            const existingNode = this.instanceNodes[existingNodeIndex];
            if (existingNode) {
                obsoleteNodes.splice(obsoleteNodes.indexOf(existingNode), 1);
                existingNode.renderDetails();
            } else {
                this.instanceNodes.splice(cursor++, 0, new InstanceNode(this, this.divTRFDetailsContainer, instance));
            }
        });

        obsoleteNodes.forEach(obsoleteNode => {
            this.instanceNodes.splice(this.instanceNodes.indexOf(obsoleteNode), 1);
            obsoleteNode.delete();
        })
    }

    private sameInstance(node: TestcaseInstance, other: TestcaseInstance): unknown {
        if (node.steps.length != other.steps.length) {
            return false;
        }
        const nodeSteps = node.steps;
        const instanceSteps = other.steps;
        for (let i = 0; i < nodeSteps.length; i++) {
            if (nodeSteps[i].stepDefinition.id !== instanceSteps[i].stepDefinition.id) {
                return false;
            }
            if (nodeSteps[i].variant?.id !== instanceSteps[i].variant?.id) {
                return false;
            }
        }
        return true;
    }
}

class InstanceNode {
    html!: JQuery<HTMLElement>;
    resultElement!: JQuery<HTMLElement>;
    instanceElement!: JQuery<HTMLElement>;
    resultIconElement!: JQuery<HTMLElement>;
    constructor(public form: TestRunnerForm, public htmlParent: JQuery<HTMLElement>, public instance: TestcaseInstance) {
        this.renderDetails();
    }
    renderDetails(): void {
        if (!this.html || true) {

            this.html = $(`<div class="trf-details"></div>`);
            this.htmlParent.append(this.html);

            this.html.html(
                `<div class="input-name-container">
                <input class="path" type="text" readonly></input>
                <div class="action-icon-container">
                    <img class="action-icon run-icon" src="${Images.Settings}" title="Run"/>
                </div>
            </div>
            <div class="input-name-container">
                <img class="result-icon" />
                <input class="result" type="text" readonly></input>
            </div>
            <div class="input-name-container">
                <a style="color:blue; " class="instance"></a>
            </div>`
            );

            const pathElement = this.html.find('.path');
            this.resultElement = this.html.find('.result');
            this.resultIconElement = this.html.find('.result-icon');
            this.instanceElement = this.html.find('.instance');

            pathElement.val(this.instance.name);

            this.html.on('click', e => {
                e.stopPropagation();
                // TODO: select path in testcase model
                // this.editor.selectCFINode(this);
            });
            this.html.find('.run-icon').on('click', async () => await this.runInstance());
        }


        this.updateInstanceRunDetails();
    }
    private updateInstanceRunDetails() {
        this.resultElement.val(this.instance.status);
        this.resultElement.attr('title', this.instance.description);

        if (this.instance.status == "pending" || this.instance.status == "") {
            this.resultIconElement.removeAttr('src');
            this.resultIconElement.removeAttr('title');
        }
        else if (this.instance.status === "passed") {
            this.resultIconElement.attr('src', TestImages.Success);
            this.resultIconElement.attr('title', 'Passed');
        }
        else {
            this.resultIconElement.attr('src', TestImages.Failed);
            this.resultIconElement.attr('title', 'Failed');
        }

        if (this.instance.caseInstance) {
            this.instanceElement.text(this.instance.caseInstance.id);
            this.instanceElement.attr('href', `#${this.form.editor.model?.testplan.testFixture.caseRef}?debug=${this.instance.caseInstance.id}`);
        } else {
            this.instanceElement.text('');
            this.instanceElement.removeAttr('href');
        }
    }

    async runInstance() {
        await this.form.runner.runTestcaseInstance(this.instance);

        this.updateInstanceRunDetails();
    }

    delete() {
        HtmlUtil.removeHTML(this.html);
    }
}

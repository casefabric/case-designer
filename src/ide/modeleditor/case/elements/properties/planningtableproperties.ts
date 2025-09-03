import $ from "jquery";
import { ApplicabilityRuleDefinition } from "../../../../../repository/definition/cmmn/caseplan/planning/applicabilityruledefinition";
import Images from "../../../../util/images/images";
import PlanningTableView from "../planningtableview";
import Properties from "./properties";

export default class PlanningTableProperties extends Properties<PlanningTableView> {
    rulesTable!: JQuery<HTMLElement>;

    constructor(planningTable: PlanningTableView) {
        super(planningTable);
    }

    renderData() {
        $(this.html).css('width', '495px');
        const html = $(`<div class="planning-table">
                            <label>PlanningTable Applicability Rules</label>
                            <div>
                                <table class="planning-table-rules">
                                    <colgroup>
                                        <col width="10px" margin="2px"></col>
                                        <col width="100px" margin="2px"></col>
                                        <col width="160px" margin="2px"></col>
                                        <col width="160px" margin="2px"></col>
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th title="Press to delete this rule"></th>
                                            <th>Rule Name</th>
                                            <th>Expression</th>
                                            <th>Context</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                </table>
                            </div>
                            <span class="separator rules-and-items-separator"></span>
                            <div title="The Table Items list contains the names of discretionary items contained in this table" class="propertyBlock">
                                <label><strong>Table Items</strong></label>
                                <div class="planning-table-items">
                                </div>
                            </div>
                        </div>`);
        html.attr('title',
            `Applicability rules determine whether discretionary items can be planned.
The rules must be defined in the Planning Table.
The rules can be marked for applicability within the properties of the discretionary items.
When the discretionary items are retrieved from a case instance at runtime, the
applicability rules are executed, and only those discretionary items for which the rules result in true are returned,
since these are the items applicable for planning at that moment.`);

        this.rulesTable = html.find('.planning-table-rules');
        // Render the applicability rules
        this.view.definition.ruleDefinitions.forEach((rule: ApplicabilityRuleDefinition) => this.addApplicabilityRuleField(rule));
        this.addApplicabilityRuleField(); // Create also an empty one to allow for adding new rules

        this.view.definition.tableItems.forEach((item: any, index: number) => {
            const itemHTML = $(`<div>${index + 1}. ${item.name}<span class="separator" ></span></div>`);
            html.find('.planning-table-items').append(itemHTML);
        });

        this.htmlContainer.append(html);
        this.addIdField();
        return html;
    }

    /**
     * Adds a rule. Can be undefined, in which case an empty row is added.
     * Also adds the required event handlers to the html.
     */
    addApplicabilityRuleField(rule?: ApplicabilityRuleDefinition) {
        const ruleViewer = new ApplicabilityRuleProperties(this, rule);
        this.rulesTable.find('tbody').append(ruleViewer.html);
    }
}

class ApplicabilityRuleProperties {
    tableView: PlanningTableProperties;
    rule?: ApplicabilityRuleDefinition;
    cmmnElement: PlanningTableView;
    html: JQuery<HTMLElement>;

    constructor(tableView: PlanningTableProperties, rule?: ApplicabilityRuleDefinition) {
        this.tableView = tableView;
        this.rule = rule;
        this.cmmnElement = this.tableView.view;

        const name = rule ? rule.name : '';
        const body = rule ? rule.body : '';
        const context = rule ? rule.contextName : '';
        const html = $(`<tr class="applicability-rule">
            <td title="Delete this rule from the table">
                <button class="btnDelete delete-rule"><img src="${Images.Delete}" /></button>
            </td>
            <td title="The name of the applicability rule">
                <input class="single rule-name" value="${name}"></input>
            </td>
            <td title="Enter an expression that results in true or false">
                <textarea class="single rule-body">${body}</textarea>
            </td>
            <td title="A case file item can provide context to the rule expression evaluation">
                <div class="zoomRow zoomSingleRow">
                    <label class="valuelabel context-label">${context}</label>
                    <button class="zoombt"></button>
                    <button class="removeReferenceButton clearContextRef" title="remove the reference to the case file item"></button>
                </div>
            </td>
        </tr>`);
        html.find('.delete-rule').on('click', e => {
            if (this.rule) {
                this.rule.removeDefinition();
                this.done();
                this.show();
            }
        });
        html.find('.rule-name').on('change', e => {
            this.change(this.getRule(), 'name', (e.currentTarget as HTMLInputElement).value);
        });
        html.find('.rule-body').on('change', e => {
            this.change(this.getRule(), 'body', (e.currentTarget as HTMLTextAreaElement).value);
        });

        html.find('.zoombt').on('click', e => {
            this.cmmnElement.case.cfiEditor.open((cfi: any) => {
                this.change(this.getRule(), 'contextRef', cfi.id);
            });
        });
        html.find('.zoomRow').on('pointerover', e => {
            e.stopPropagation();
            this.cmmnElement.case.cfiEditor.setDropHandler((dragData: any) => {
                this.change(this.getRule(), 'contextRef', dragData.item.id);
            });
        });
        html.find('.zoomRow').on('pointerout', e => {
            this.cmmnElement.case.cfiEditor.removeDropHandler();
        });
        html.find('.clearContextRef').on('click', e => {
            if (this.rule) {
                this.change(this.rule, 'contextRef', undefined);
                this.show();
            }
        });

        this.html = html;
    }

    getRule(): ApplicabilityRuleDefinition {
        if (!this.rule) {
            this.rule = this.cmmnElement.definition.createNewRule();
            this.tableView.addApplicabilityRuleField();
        }
        return this.rule;
    }

    change(element: any, field: string, value: any) {
        this.tableView.change(element, field, value);
    }

    show() {
        this.tableView.show();
    }

    done() {
        this.tableView.done();
    }
}

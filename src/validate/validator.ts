import Util from "@util/util";
import Problem from "./problem";
import { CMMNError, CMMNWarning } from "./problemtype";
import CaseDefinition from "@repository/definition/cmmn/casedefinition";
import StartCaseSchemaDefinition from "@repository/definition/cmmn/startcaseschemadefinition";
import CaseParameterDefinition from "@repository/definition/cmmn/contract/caseparameterdefinition";
import CaseTeamDefinition from "@repository/definition/cmmn/caseteam/caseteamdefinition";
import TextAnnotationDefinition from "@repository/definition/artifact/textannotation";
import CaseFileDefinition from "@repository/definition/cmmn/casefile/casefiledefinition";
import TypeDefinition from "@repository/definition/type/typedefinition";
import SchemaDefinition from "@repository/definition/type/schemadefinition";
import SchemaPropertyDefinition from "@repository/definition/type/schemapropertydefinition";
import StageDefinition from "@repository/definition/cmmn/caseplan/stagedefinition";
import HumanTaskDefinition from "@repository/definition/cmmn/caseplan/task/humantaskdefinition";
import CaseTaskDefinition from "@repository/definition/cmmn/caseplan/task/casetaskdefinition";
import ProcessTaskDefinition from "@repository/definition/cmmn/caseplan/task/processtaskdefinition";
import MilestoneDefinition from "@repository/definition/cmmn/caseplan/milestonedefinition";
import UserEventDefinition from "@repository/definition/cmmn/caseplan/usereventdefinition";
import TimerEventDefinition from "@repository/definition/cmmn/caseplan/timereventdefinition";
import PlanItem from "@repository/definition/cmmn/caseplan/planitem";
import ConstraintDefinition from "@repository/definition/cmmn/caseplan/constraintdefinition";
import CriterionDefinition from "@repository/definition/cmmn/sentry/criteriondefinition";
import PlanningTableDefinition, { ApplicabilityRuleDefinition } from "@repository/definition/cmmn/caseplan/planningtabledefinition";
import TaskDefinition from "@repository/definition/cmmn/caseplan/task/taskdefinition";
import Repository from "@repository/repository";
import CaseRoleDefinition from "@repository/definition/cmmn/caseteam/caseroledefinition";
import ExitCriterionDefinition from "@repository/definition/cmmn/sentry/exitcriteriondefinition";

export default class Validator {
    _problems: Problem[];
    repository: Repository;
    caseDefinition: CaseDefinition;
    constructor(caseDefinition: CaseDefinition, repository: Repository) {
        this._problems = [];
        this.repository = repository;
        this.caseDefinition = caseDefinition;
    }

    get problems(): Problem[] {
        return this._problems;
    }

    get errors(): Problem[] {
        return this.problems.filter(p => p.isError());
    }

    get warnings(): Problem[] {
        return this.problems.filter(p => p.isWarning());
    }

    /**
     * Runs the actual validation
     * 
     * @returns {Validator} the validator object, containing the problems
     */
    static run(caseDefinition: CaseDefinition, repository:Repository): Validator {
        const validator = new Validator(caseDefinition, repository);

        //validate the case with its' properties
        validator.validateCase(caseDefinition);

        return validator;
    }

    raiseWarning(contextId: string, messageTemplate: string, parameters: string[]){
        const hash = Util.hashCode(messageTemplate);
        this._problems.push(new CMMNWarning(hash, messageTemplate).createProblem(contextId, parameters));
    }
    raiseError(contextId: string, messageTemplate: string, parameters: string[]){
        const hash = Util.hashCode(messageTemplate);
        this._problems.push(new CMMNError(hash, messageTemplate).createProblem(contextId, parameters));
    }

    validateCase(caseDefinition: CaseDefinition) {
        this.validateCaseFile(caseDefinition.caseFile);
        this.validateStageDefinition(caseDefinition.casePlan);
        this.validateCaseTeam(caseDefinition.caseTeam);
        this.validateCaseInputParameters(caseDefinition.inputParameters);
        this.validateCaseOutputParameters(caseDefinition.outputParameters);
        this.validateCaseAnnotations(caseDefinition.annotations);
        this.validateCaseStartSchema(caseDefinition.startCaseSchema);
    }
    validateCaseStartSchema(startCaseSchema: StartCaseSchemaDefinition) {
        // no validations yet
    }
    validateCaseAnnotations(annotations: TextAnnotationDefinition[]) {
        // no validations yet
    }
    validateCaseOutputParameters(outputParameters: CaseParameterDefinition[]) {
        for (let outputParameter of outputParameters) {
            this.validateParameter(outputParameter);
        }
    }
    validateParameter(outputParameter: CaseParameterDefinition) {
        if (outputParameter.name === "") 
        {
            this.raiseError(outputParameter.id, 'A case parameter has no name', []);
        }
        if (outputParameter.bindingName === "") 
            {
                this.raiseError(outputParameter.id, 'The case parameter "-par0-" is not bound', [outputParameter.name]);
            }
            if (outputParameter.bindingRef === "") 
        {
            this.raiseError(outputParameter.id, 'The case parameter "-par0-" has no type', [outputParameter.name]);
        }
    }
    validateCaseInputParameters(inputParameters: CaseParameterDefinition[]) {
        for (let inputParameter of inputParameters) {
            this.validateParameter(inputParameter);
        }
    }
    validateCaseTeam(caseTeam: CaseTeamDefinition) {
        for (let role of caseTeam.roles) {
            this.validateRole(role);
        }

        let roles = caseTeam.roles;
        let duplicatesRoles = roles.filter((role, index) => roles.indexOf(role) !== index);
        if (duplicatesRoles.length > 0) {
            this.raiseError(caseTeam.id, 'The case team has duplicate roles', []);
        }
    }
    validateRole(role: CaseRoleDefinition) {
        if (role.name === "") 
        {
            this.raiseError(role.id, 'A case role has no name', []);
        }
    }
    validateCaseFile(caseFile: CaseFileDefinition) {
        if (caseFile.typeRef === "")  
        {
            this.raiseError(caseFile.id, `The case file has no type`, []);
        }

        const typeFile = this.repository.getTypes().find(type => type.fileName === caseFile.typeRef);
        if (typeFile === undefined || typeFile.definition === undefined)
        {
            this.raiseError(caseFile.id, `The type "-par0-" of the case file is not defined`, [caseFile.typeRef]);
        }
        else
        {
           // TODO: reload needed??? typeFile.reload();
            if (typeFile.definition === undefined) {
                this.raiseError(caseFile.id, `The type "-par0-" of the case file is not defined`, [caseFile.typeRef]);
            }
            else {
                this.validateTypeDefinition(typeFile.definition);
            }
        }
    }
    validateTypeDefinition(type: TypeDefinition) {
        this.validateSchema(type.schema, type.name);
    }
    validateSchema(schema: SchemaDefinition, typeName: string, propertyName?: string) {
        if (schema.childDefinitions.length === 0) 
        {
            if (propertyName === undefined)
            {
                this.raiseError(schema.id, 'The type  "-par0-" has no child properties', [typeName]);
            }
            else
            {
                this.raiseError(schema.id, 'The structured property "-par0-" in type "-par1-" has no child properties', [propertyName, typeName]);
            }
        }
        for (let childDef of schema.childDefinitions)  {
            if (childDef instanceof SchemaPropertyDefinition) {
                this.validatePropertyDefinition(childDef, typeName);
            }
        }
    }
    validatePropertyDefinition(itemDef: SchemaPropertyDefinition, typeName: string) {
        if (itemDef.name === "") 
        {
            this.raiseError(itemDef.id, `A case file item element in type "-par0-" has no name`, [typeName]);
        }
        if (["ExactlyOne", "ZeroOrOne", "ZeroOrMore", "OneOrMore", "Unspecified", "Unknown"].
            indexOf(itemDef.multiplicity) === -1) 
        {
            this.raiseError(itemDef.id, '"-par0-" is not a valid multiplicity for property "-par1-" in type "-par2-")', [itemDef.multiplicity, itemDef.name, typeName]);
        }
        if (itemDef.isComplexType) 
        {
            if (itemDef.type === "object")
            {
                if (itemDef.childDefinitions.length === 0) 
                {
                    this.raiseError(itemDef.id, 'The structured property "-par0-" in type "-par1-" has no child properties', [itemDef.name, typeName]);
                }
                for (let childDef of itemDef.childDefinitions)  {
                    if (childDef instanceof SchemaDefinition) {
                        this.validateSchema(childDef, typeName, itemDef.name);
                    }
                    else
                    {
                        this.raiseWarning(childDef.id, 'The property of type "-par0-" cannot be validated', [childDef.constructor.name]);
                    }
                }
            }
            else if (itemDef.subType === undefined) {
                this.raiseError(itemDef.id, 'The property "-par0-" in type "-par1-" does not have a type', [itemDef.name, typeName]);
            }
            else{
                this.validateTypeDefinition(itemDef.subType);
            }
        }
        else
        {
            if (itemDef.type === "") 
            {
                this.raiseError(itemDef.id, 'The property "-par0-" in type "-par1-" has no type', [itemDef.name, typeName]);
            }
        }
    }
    validateStageDefinition(stage: StageDefinition) {
        this.validatePlanItems(stage.name, stage.planItems);
        const planningTable = stage.planningTable;
        if (planningTable) {
            this.validatePlanningTable(stage, planningTable);
        }

        // validate plan item nesting: not needed, because object structure forces it
        
        // validate autocomplete
        if (!stage.autoComplete) {
            if (!stage.planningTable || stage.planningTable.tableItems.length == 0) {
                this.raiseWarning(stage.id, 'The stage "-par0-" has the property autocomplete=FALSE. It is appropriate that this stage contains discretionary elements', 
                    [stage.name]);
            }
        }

        // validate more then one child
        const numPlanItems = stage.planItems.length;
        const numDiscretionaryItems = planningTable ? planningTable.tableItems.length : 0;
        if (numPlanItems + numDiscretionaryItems <= 1) {
            this.raiseWarning(stage.id, 'The stage "-par0-" contains zero or one plan item, this is allowed but should be avoided',
                [stage.name]);
        }

    }
    validatePlanItems(parentName: string, planItems: PlanItem[]) {
        for (let planItem of planItems) {
            this.validatePlanItem(planItem, parentName);

            switch (this.getClassName(planItem)) {
                case 'HumanTaskDefinition':
                    this.validateHumanTaskDefinition(planItem as HumanTaskDefinition);
                    break;
                case 'CaseTaskDefinition':
                    this.validateCaseTaskDefinition(planItem as CaseTaskDefinition);
                    break;
                case 'ProcessTaskDefinition':
                    this.validateProcessTaskDefinition(planItem as ProcessTaskDefinition);
                    break;
                case 'MilestoneDefinition':
                    this.validateMilestoneDefinition(planItem as MilestoneDefinition);
                    break;
                case 'UserEventDefinition':
                    this.validateUserEventDefinition(planItem as UserEventDefinition);
                    break;
                case 'TimerEventDefinition':
                    this.validateTimerEventDefinition(planItem as TimerEventDefinition);
                    break;
                case 'StageDefinition':
                    this.validateStageDefinition(planItem as StageDefinition);
                    break;
                default:
                    this.raiseWarning(planItem.id, 'The plan item "-par0-" cannot be validated', [planItem.constructor.name]);
                    break;
            }
        }
    }
    validatePlanningTable(stage: StageDefinition, planningTable: PlanningTableDefinition) {
        this.validatePlanItems(stage.name, planningTable.tableItems);
        for (let rule of planningTable.ruleDefinitions) {
            this.validateApplicabilityRule(rule, stage);
        }
    }
    validateApplicabilityRule(rule: ApplicabilityRuleDefinition, definition: StageDefinition) {
        if (!rule.body) {
            this.raiseError(definition.id, 'An applicability rule of stage "-par0-" has no expression', 
                [definition.name]);
        }
        if (!rule.contextRef && rule.body !== 'true' && rule.body !== 'false') {
            this.raiseWarning(definition.id, 'An applicability rule of stage "-par0-" has no context (case file item)',
                [definition.name]);
        }
    }
    validatePlanItem(planItem: PlanItem, stageName: string) {
        if (planItem.name === "") 
        {
            this.raiseError(planItem.id, 'A plan item in stage "-par0-" has no name', [stageName]);
        }
        if (planItem.itemControl !== undefined) 
        {
            this.validateRule('repeat', planItem, planItem.itemControl.repetitionRule);
            this.validateRule('required', planItem, planItem.itemControl.requiredRule);
            this.validateRule('manualactivation', planItem, planItem.itemControl.manualActivationRule);

            if (planItem.itemControl.repetitionRule) {
                if (planItem.entryCriteria.length == 0) {
                    if(planItem instanceof MilestoneDefinition) {
                        this.raiseError(planItem.id, 'Item "-par0-" has a repetition rule defined, but no entry criteria. This is mandatory for milestones.',
                            [planItem.name]);
                    }
                } 
                else if (planItem.entryCriteria
                    .filter(criterion => criterion.caseFileItemOnParts.length !== 0 || criterion.planItemOnParts.length !== 0)
                    .length == 0) {
                        this.raiseError(planItem.id, 'Item "-par0-" has a repetition rule defined, but no entry criteria with at least one on part. This is mandatory.',
                            [planItem.name]);

                    }
            }
        }

        for (let sentry of planItem.entryCriteria) {
            this.validateSentry(planItem, sentry);
        }
        for (let sentry of planItem.exitCriteria) {
            this.validateSentry(planItem, sentry);
        }
        for (let sentry of planItem.reactivateCriteria) {
            this.validateSentry(planItem, sentry);
        }

        this.validateTaskPairingConstraints(planItem);
    }
    validateTaskPairingConstraints(planItem: PlanItem) {
        if (planItem.rendezVous && planItem.fourEyes) {
            let counterparts = planItem.rendezVous.references;
            let opposites = planItem.fourEyes.references;
            // Verify that we cannot have "rendez-vous" with items that we also have "4-eyes" with.
            opposites.forEach((item) => {
                if (counterparts.filter(counter => item.id === counter.id).length > 0) {
                    this.raiseError(planItem.id, '"-par0-" has a 4-eyes defined with "-par1-", but also rendez-vous (either directly or indirectly). This is not valid.',
                        [planItem.name, item.name]);
                }
            });
        }

    }
    validateSentry(planItem: PlanItem, sentry: CriterionDefinition) {
        this.validateSentryHasIfOrOnPart(planItem, sentry);
        this.validateSentryOnPart(planItem, sentry);
        this.validateSentryIfPartExpression(planItem, sentry);
        this.validateSentryOnPartPlanItem(planItem, sentry);
        this.validatePlanItemReferenceDiscretionaryParent(planItem, sentry);
    }
    /** 
     * Check if the onPart planItem reference in sentry of discretionary element refers to a plan item inside the
     * parent stage (required). PlanItem reference must be inside parent stage
    */
    validatePlanItemReferenceDiscretionaryParent(planItem: PlanItem, sentry: CriterionDefinition) 
    {
        //check if sentry has onPart planItems
        if (sentry.planItemOnParts.length == 0) {
            return;
        }

        //check if parent is discretionary
        const cmmnParentElement = planItem;
        if (!cmmnParentElement.isDiscretionary) {
            return;
        }

        // check if the planItem reference points to a planItem inside the parent of the parentElement
        var parent = cmmnParentElement.parent;

        // But only if the parent is a stage inside the caseplan.
        if (parent === this.caseDefinition.casePlan) {
            return;
        }
        // get the stage of the discretionary element
        var stage = ((parent as PlanningTableDefinition).parent as StageDefinition);

        const stageChildren = stage.planItems.concat(stage.planningTable?.tableItems);
        //get the planItems from the onPart
        sentry.planItemOnParts.forEach(onPart => {
            const sourceRef = onPart.sourceRef;
            if (sourceRef == null || sourceRef == '') {
                //onPart planitem is not defined -> skip
                return;
            }

            //get the planItem element the onPart planItem id refers to
            const planItem = this.caseDefinition.getElement(sourceRef);
            //check if the planItem is one of the children of the parent
            //test whether the planItem is a descendant of the parentStage
            const found = stageChildren.find(child => child.id == sourceRef);
            //no descendant -> error
            if (!found) {
                this.raiseError(sentry.id, 'The -par0- of discretionary element "-par1-" has an onPart planItem reference to element "-par2-", that is outside the parent stage/case plan model "-par3-". This is not allowed',
                    [sentry.typeDescription, cmmnParentElement.name,  planItem.name, parent.name]);
            }
        });
    }
    validateSentryOnPartPlanItem(planItem: PlanItem, sentry: CriterionDefinition) {
        sentry.planItemOnParts.forEach(onPart => {
            if (!onPart.sourceRef) {
                this.raiseWarning(sentry.id, 'A -par0- of element "-par1-" has an onPart plan item row with no element reference',
                    [sentry.typeDescription, planItem.name]);
                
            } else {
                const source = this.caseDefinition.getElement(onPart.sourceRef);
                if (source === undefined) {
                    this.raiseError(sentry.id, 'A -par0- of element "-par1-" references a plan item which does not exist',
                        [sentry.typeDescription, planItem.name]);
                }
                if ((source as PlanItem) && (source as PlanItem)?.isDiscretionary) {
                    //onpart element can not be discretionary
                    this.raiseError (sentry.id, 'A -par0- of element "-par1-" has an onPart plan item element ("-par2-") which is discretionary. This is not allowed.',
                        [sentry.typeDescription, planItem.name, source.name]);
                }
                if (!onPart.standardEvent) {
                    this.raiseWarning(sentry.id, 'A -par0- of element "-par1-" has an onPart plan item element ("-par2-") with no standard event',
                        [sentry.typeDescription, planItem.name, source.name]);
                }

                // TODO: check of the below constraint is valid
                if (sentry instanceof ExitCriterionDefinition) {
                    if (onPart.standardEvent !== 'complete' && onPart.standardEvent !== 'terminate') {
                        this.raiseError(sentry.id, 'An exit criterion of element "-par0-" has an onPart plan item entry with an invalid standard event ("-par1-")',
                            [planItem.name, onPart.standardEvent]);
                    }
                }
            }
        });
    }
    validateSentryIfPartExpression(planItem: PlanItem, sentry: CriterionDefinition) {
        if (sentry.ifPart)
        {
            if (!sentry.ifPart.body) {
            this.raiseWarning(sentry.id, 'A -par0- of element "-par1-" has no expression in the ifPart', 
                [sentry.typeDescription, planItem.name]);
            }
            if (!sentry.ifPart.contextRef && sentry.ifPart.body !== 'true' && sentry.ifPart.body !== 'false') {
                this.raiseWarning(planItem.id, 'A -par0- of element "-par1-" has an if-part expression without a context (case file item)', 
                    [sentry.typeDescription, planItem.name]);
            }
        }
    }
    validateSentryOnPart(planItem: PlanItem, sentry: CriterionDefinition) {
        sentry.caseFileItemOnParts.forEach(onPart => {
            if (!onPart.sourceRef) {
                this.raiseError(sentry.id, 'A -par0- of element "-par1-" has an onPart case file item entry without a reference to a case file item)', 
                    [sentry.typeDescription, planItem.name]);
            }
            if (!onPart.standardEvent) {
                this.raiseWarning(sentry.id, 'A -par0- of element "-par1-" has an onPart case file item entry without a standard event',
                    [sentry.typeDescription, planItem.name]);
            }
        });
    }
    validateSentryHasIfOrOnPart(planItem: PlanItem, sentry: CriterionDefinition) {
        if (!sentry.ifPart && sentry.caseFileItemOnParts.length === 0 && sentry.planItemOnParts.length === 0) {
            this.raiseError(planItem.id, 'The item "-par0-" has a -par1- without an if-part or on-part', [planItem.name, sentry.name]);
        }
    }
    validateRule(ruleType: string, planItem: PlanItem, rule?: ConstraintDefinition) {
        //the rule exists for this element and is used
        if (rule && !rule.body) {
            this.raiseError(planItem.id, 'The item "-par0-" has a -par1- rule without a rule expression', [planItem.name, ruleType]);
        }

        if (rule && !rule.contextRef && rule.body !== 'true' && rule.body !== 'false') {
            this.raiseWarning(planItem.id, 'The item "-par0-" has a -par1- rule without a context (case file item)', [planItem.name, ruleType]);
        }
    }
    validateUserEventDefinition(definition: UserEventDefinition) {
        for (let role of definition.authorizedRoles) {
            if (this.caseDefinition.caseTeam.roles.filter(r => r.id === role.id).length === 0) {
                this.raiseError(definition.id, 'An authorized role of user event "-par0-" is not defined in the case team', 
                    [definition.name]);
            }
        }
    }
    validateTimerEventDefinition(definition: TimerEventDefinition) {
        if (!definition.timerExpression) {
            this.raiseError(definition.id, 'The timer event "-par0-" has no timer expression', 
                [definition.name]);
        }

        if (definition.planItemStartTrigger) {
            const planItemStartTrigger = definition.planItemStartTrigger;
            if (planItemStartTrigger.sourceRef && !planItemStartTrigger.standardEvent) {
                this.raiseError(definition.id, 'The plan item start trigger for timer event "-par0-" has no standard event', 
                    [definition.name]);
            }
        }

        if (definition.caseFileItemStartTrigger) {
            if (!definition.caseFileItemStartTrigger.standardEvent) {
                this.raiseError(definition.id, 'The case file item start trigger for timer event "-par0-" has no standard event', 
                    [definition.name]);
            }
            if (!definition.caseFileItemStartTrigger.sourceRef) {
                this.raiseError(definition.id, 'The case file item start trigger for timer event "-par0-" has no source reference', 
                    [definition.name]);
            }
        }
    }
    validateHumanTaskDefinition(definition: HumanTaskDefinition) {
        this.validateTaskDefinition(definition);
        
        if (definition.performerRef !== undefined) {
            if (this.caseDefinition.caseTeam.roles.filter(role => role.id === definition.performerRef).length === 0) {
                this.raiseError(definition.id, 'The performer "-par0-" of task "-par1-" is not defined in the case team', 
                    [definition.performerRef, definition.name]);
            }
        }

        this.validateWorkflow(definition);
    }
    validateTaskDefinition(definition: TaskDefinition) {
        if (!definition.implementationRef) {
            this.raiseWarning(definition.id, 'No implementation attached to task "-par0-"', 
                [definition.name]);
        }

        if (definition.isBlocking == false) {
            //non blocking task cannot have exit sentries
            if (definition.exitCriteria.length > 0) {
                this.raiseError(definition.id, 'Non-blocking task "-par0-" has an exit sentry, this is not allowed', 
                    [definition.name]);
            }

            //non blocking task cannot have output parameters
            if (definition.outputs.length > 0) {
                this.raiseError(definition.id, 'Non-blocking task "-par0-" has output parameters, this is not allowed.',
                    [definition.name]);
            }

            //non blocking task cannot have a planningtable
            if (definition.planningTable) {
                this.raiseError(definition.id, 'Non-blocking task "-par0-" has a planning table, this is not allowed.',
                    [definition.name]);
            }
        }

        // validate input/output parameters
        definition.mappings.forEach(mapping => {
            if (!mapping['sourceRef']) {
                this.raiseWarning(definition.id, 'The input mapping "-par1-" of element "-par0-" has empty task parameter(s)',
                    [definition.name, mapping.implementationParameter?.name ?? "unnamed"]);
            }
        });
        definition.mappings.forEach(mapping => {
            if (!mapping['targetRef']) {
                this.raiseWarning(definition.id, 'The output mapping "-par1-" of element "-par0-" has empty task parameter(s)',
                    [definition.name, mapping.implementationParameter?.name ?? "unnamed"]);
            }
        });

        if (definition.planningTable) {
            this.validatePlanItems(definition.name, definition.planningTable.tableItems);
        }

        for (let role of definition.authorizedRoles) {
            if (this.caseDefinition.caseTeam.roles.filter(r => r.id === role.id).length === 0) {
                this.raiseError(definition.id, 'An authorized role of task "-par0-" is not defined in the case team', 
                    [definition.name]);
            }
        }
    }

    validateWorkflow(definition: HumanTaskDefinition) {
        const workflow = definition.workflow;
        // due date
        if (workflow.dueDate) {
            const dueDate = workflow.dueDate;
            if (!dueDate.body) {
                this.raiseError(definition.id, 'The due date of task "-par0-" has no due date expression', 
                    [definition.name]);
            }
            if (!dueDate.contextRef && dueDate.body !== 'true' && dueDate.body !== 'false') {
                this.raiseWarning(definition.id, 'The due date of task "-par0-" has no context (case file item)',
                    [definition.name]);
            }
        }

        // assignment
        if (workflow.assignment) {
            const assignment = workflow.assignment;
            if (!assignment.body) {
                this.raiseError(definition.id, 'The dynamic assignment of task "-par0-" has no due date expression', 
                    [definition.name]);
            }
            if (!assignment.contextRef && assignment.body !== 'true' && assignment.body !== 'false') {
                this.raiseWarning(definition.id, 'The dynamic assignment of task "-par0-" has no context (case file item)',
                    [definition.name]);
            }
        }

        // 4-eyes
        // rendex-vous
    }
    validateCaseTaskDefinition(definition: CaseTaskDefinition) {
        this.validateTaskDefinition(definition);

        if (definition.implementationRef !== undefined &&
            this.repository.getCases().filter(c => c.fileName === definition.implementationRef).length === 0) {
            this.raiseError(definition.id, 'The case task "-par0-" refers to a case that is not defined', 
                [definition.name]);
        }

        if (definition.implementationRef === this.caseDefinition.id) {
            // TODO: check for cyclic references
        }
    }
    validateProcessTaskDefinition(definition: ProcessTaskDefinition) {
        this.validateTaskDefinition(definition);

        if (definition.implementationRef !== undefined &&
            this.repository.getProcesses().filter(c => c.fileName === definition.implementationRef).length === 0) {
            this.raiseError(definition.id, 'The process task "-par0-" refers to a process that is not defined', 
                [definition.name]);
        }
    }
    validateMilestoneDefinition(definition: MilestoneDefinition) {
        // no validations yet
    }

    getClassName(obj: any): string {
        return obj.constructor.name;
    }
}


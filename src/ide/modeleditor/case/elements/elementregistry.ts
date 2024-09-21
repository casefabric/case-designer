
import Icons from "@util/images/icons";
import Shapes from "@util/images/shapes";
import CaseFileItemView from "./casefileitemview";
import CasePlanView from "./caseplanview";
import CaseTaskView from "./casetaskview";
import HumanTaskView from "./humantaskview";
import MilestoneView from "./milestoneview";
import PlanningTableView from "./planningtableview";
import ProcessTaskView from "./processtaskview";
import { EntryCriterionView, ExitCriterionView, ReactivateCriterionView } from "./sentryview";
import StageView from "./stageview";
import TextAnnotationView from "./textannotationview";
import TimerEventView from "./timereventview";
import UserEventView from "./usereventview";

export default class ElementRegistry {
    static viewMetadata: ElementMetadata[] = [];

    static initialize() {
        if (this.viewMetadata.length > 0) {
            // Means we already initialized.
            return;
        }
        this.registerType(HumanTaskView, 'Human Task', Shapes.HumanTask, Icons.HumanTask);
        this.registerType(CaseTaskView, 'Case Task', Shapes.CaseTask, Icons.CaseTask);
        this.registerType(ProcessTaskView, 'Process Task', Shapes.ProcessTask, Icons.ProcessTask);
        this.registerType(MilestoneView, 'Milestone', Shapes.Milestone);
        this.registerType(TimerEventView, 'Timer Event', Shapes.TimerEvent);
        this.registerType(UserEventView, 'User Event', Shapes.UserEvent);
        this.registerType(StageView, 'Stage', Shapes.Stage);
        this.registerType(EntryCriterionView, 'Entry Criterion', Shapes.EntryCriterion);
        this.registerType(ReactivateCriterionView, 'Reactivate Criterion', Shapes.ReactivateCriterion);
        this.registerType(ExitCriterionView, 'Exit Criterion', Shapes.ExitCriterion);
        this.registerType(CasePlanView, 'Case Plan', Shapes.CasePlan);
        this.registerType(CaseFileItemView, 'Case File Item', Shapes.CaseFileItem);
        this.registerType(TextAnnotationView, 'Text Annotation', Shapes.TextAnnotation);
        this.registerType(PlanningTableView, 'Planning Table');
    }

    /**
     * Registers a class that extends CMMNElementView by it's name.
     * @param cmmnElementType 
     * @param typeDescription Friendly description of the type
     * @param smallImageURL url of small image (for drag/drop, shapebox, etc.)
     * @param menuImageURL optional url of image shown in repository browser
     */
    static registerType(cmmnElementType: Function, typeDescription: string, smallImageURL: string = '', menuImageURL: string = smallImageURL) {
        this.viewMetadata.push(new ElementMetadata(cmmnElementType, typeDescription, smallImageURL, menuImageURL));
    }

    static getType(name: string) {
        return this.viewMetadata.find(type => type.name === name)?.cmmnElementType;
    }
}

export class ElementMetadata {
    name: string;

    constructor(public cmmnElementType: Function, public typeDescription: string, public smallImage: string, public menuImage: string) {
        this.name = cmmnElementType.name;

        // TODO: Remove backwards compatibility code. Still used in e.g. modellistpanel 
        (<any>cmmnElementType).typeDescription = cmmnElementType.name;
        (<any>cmmnElementType).smallImage = smallImage;
        (<any>cmmnElementType).menuImage = menuImage;
    }

    get hasImage() {
        return this.smallImage !== '';
    }
}

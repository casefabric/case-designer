import Problem from "./problem";
import ValidateForm from "./validateform";

export default class ProblemType {
    static showAll() {
        ValidateForm.Settings._hiddenProblemTypes = [];
    }

    constructor(number, descriptionTemplate, image) {
        this.number = number;
        this.descriptionTemplate = descriptionTemplate;
        this.image = image;
    }

    /**
     * @param {Boolean} bHide
     */
    set isHidden(bHide) {
        ValidateForm.Settings.hideProblemType(this.number, bHide);
    }

    get isHidden() {
        return ValidateForm.Settings.isHiddenProblemType(this.number);
    }

    /**
     * Creates a validation problem within the context of this case.
     * @param {String} contextId 
     * @param {Array<String>} parameters 
     * @param {String} fileName
     */
    createProblem(contextId, parameters, fileName) {
        return new Problem(contextId, this, parameters, fileName);
    }

    getHTMLString(description, contextId, problemId, fileName) {
        const htmlString = `<div class="problemrow" problemId="${problemId}" contextId="${contextId}" problemType="${this.number}">
	<div class="hideproblem">
        <input type="checkbox" hideType="all"></input>
	</div>
    <div class="hideproblem">
		<input type="checkbox" hideType="this"></input>
	</div>
	<div class="problemtype" title="${this.number}">
		<img src="${this.image}"></img>
	</div>
	<div class="filename" title="${fileName}">
        ${fileName}
	</div>
	<div class="problemdescription">
        ${description}
	</div>
</div>`;
        return htmlString;
    }

    /**
     * @returns {Array<ProblemType>}
     */
    static get list() {
        if (! ProblemType._list) {
            ProblemType._list = [];
        }
        return ProblemType._list;
    }
}

export class CMMNWarning extends ProblemType {
    constructor(number, description) {
        super(number, description, 'images/warningproblem_32.png');
    }
}

export class CMMNError extends ProblemType {
    constructor(number, description) {
        super(number, description, 'images/errorproblem_32.png');
    }
}

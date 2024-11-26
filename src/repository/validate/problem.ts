import ProblemType, { CMMNError, CMMNWarning } from "./problemtype";

export default class Problem {
    contextId: string;
    problemType: ProblemType;
    parameters: string[];
    hide: boolean;
    index: any;
    description: string;
    fileName: string;
    /**
     * Creates a new problem that can render itself as HTML
     * @param {String} contextId The context in which this problem occurs. Together with the problemType.number and parameters this must be unique.
     * @param {ProblemType} problemType The template that is the basis for this problem
     * @param {Array<String>} parameters The detailed bindings that can be combined with the template to generate a specific description
     * @param {String} fileName The name of the file in which the problem occurs
     */
    constructor(contextId: string, problemType: ProblemType, parameters: string[], fileName: string) {
        this.contextId = contextId;
        this.problemType = problemType;
        this.parameters = parameters;
        this.hide = false;
        this.index = this.contextId;
        this.description = problemType.descriptionTemplate;
        this.fileName = fileName;
        // Now substitute parameters into the description template
        for (let i = 0; i < parameters.length; i++) {
            this.description = this.description.replace('-par' + i + '-', parameters[i]);
        }
    }

    get id(): string {
        return this.problemType.number+' in '+this.contextId + '[' + this.parameters.join(',') + ']';
    }

    /**
     * Creates a copy of this object, that can be used for comparison of hidden objects
     */
    copy(): Problem {
        return new Problem(this.contextId, this.problemType, this.parameters, this.fileName);
    }

    isWarning(): boolean {
        return this.problemType instanceof CMMNWarning;
    }

    isError(): boolean {
        return this.problemType instanceof CMMNError;
    }
}
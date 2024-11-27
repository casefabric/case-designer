import Util from "@util/util";

export default class Problem {
    typeId: number;
    description: string;
    
    /**
     * Creates a new problem that can render itself as HTML
     */
    constructor(public contextId: string, public descriptionTemplate: string, public parameters: string[], public fileName: string, public severity: ProblemSeverity) {
        this.typeId = Util.hashCode(descriptionTemplate);

        // Now substitute parameters into the description template
        this.description = descriptionTemplate;
        for (let i = 0; i < parameters.length; i++) {
            this.description = this.description.replace('-par' + i + '-', parameters[i]);
        }
    }

    get id(): string {
        return this.typeId+' in '+this.contextId + '[' + this.parameters.join(',') + ']';
    }

    isWarning(): boolean {
        return this.severity === ProblemSeverity.WARNING;
    }

    isError(): boolean {
        return this.severity === ProblemSeverity.ERROR;
    }
}

export enum ProblemSeverity {
    ERROR,
    WARNING
}
import ElementDefinition from "@repository/definition/elementdefinition";
import Problem from "./problem";
import ModelDefinition from "@repository/definition/modeldefinition";

export default class ProblemType {
    number: number;
    descriptionTemplate: string;
    image: string;

    constructor(number: number, descriptionTemplate:string, image: string) {
        this.number = number;
        this.descriptionTemplate = descriptionTemplate;
        this.image = image;
    }

    /**
     * Creates a validation problem within the context of this case.
     */
    createProblem<M extends ModelDefinition>(element: ElementDefinition<M>, parameters: string[], fileName: string): Problem {
        const problem = new Problem(element.id, this, parameters, fileName);

        element.problems.push(problem);

        return problem;
    }
}

export class CMMNWarning extends ProblemType {
    constructor(number: number, description: string) {
        super(number, description, 'images/warningproblem_32.png');
    }
}

export class CMMNError extends ProblemType {
    constructor(number: number, description: string) {
        super(number, description, 'images/errorproblem_32.png');
    }
}

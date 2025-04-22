import ParameterDefinition from "./contract/parameterdefinition";
import ModelDefinition from "./modeldefinition";

export default abstract class ParameterizedModelDefinition extends ModelDefinition {

    /**
     * A ModelDefinition must have input parameters.
     */
    abstract get inputParameters(): ParameterDefinition<ParameterizedModelDefinition>[];

    /**
     * A ModelDefinition must have output parameters.
     */
    abstract get outputParameters(): ParameterDefinition<ParameterizedModelDefinition>[];

    findInputParameter(identifier: string) {
        return this.inputParameters.find(p => p.hasIdentifier(identifier));
    }

    findOutputParameter(identifier: string) {
        return this.outputParameters.find(p => p.hasIdentifier(identifier));
    }
}

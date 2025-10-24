import AIModelDefinition from "../definition/ai/aimodeldefinition";
import ServerFile from "./serverfile";

export default class AIFile extends ServerFile<AIModelDefinition> {
    createModelDefinition() {
        return new AIModelDefinition(this);
    }
}

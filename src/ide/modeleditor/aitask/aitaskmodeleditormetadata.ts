import { CAFIENNE_NAMESPACE, CAFIENNE_PREFIX, EXTENSIONELEMENTS, IMPLEMENTATION_TAG } from "../../../repository/definition/cmmnextensiontags";
import AIFile from "../../../repository/serverfile/aifile";
import ServerFile from "../../../repository/serverfile/serverfile";
import IDE from "../../ide";
import Shapes from "../../util/images/shapes";
import ModelEditorMetadata from "../modeleditormetadata";
import AIModelEditor from "./aimodeleditor";

export default class AIModelEditorMetadata extends ModelEditorMetadata {
    /** @returns {Array<ServerFile>} */
    get modelList() {
        return this.ide?.repository.getAITasks() || [];
    }

    supportsFile(file: ServerFile) {
        return file instanceof AIFile;
    }

    createEditor(ide: IDE, file: AIFile) {
        return new AIModelEditor(ide, file);
    }

    get fileType() {
        return 'ai';
    }

    get icon() {
        return Shapes.AITask;
    }

    get description() {
        return 'AI';
    }

    toString() {
        // Override base implementation, because that cuts off only the s, and we need to also cut off the e.
        return 'ai';
    }

    /**
     * Create a new Process model with given name and description 
     * @returns fileName of the new model
     */
    async createNewModel(ide: IDE, name: string, description: string) {
        const documentation = description ? `<documentation textFormation="text/plain"><text><![CDATA[${description}]]></text></documentation>` : '';
        const newModelContent =
`<process name="${name}">
    ${documentation}
    <${EXTENSIONELEMENTS}>
        <${IMPLEMENTATION_TAG} ${CAFIENNE_PREFIX}="${CAFIENNE_NAMESPACE}" class="com.casefabric.ai.processtask.AICallDefintion" async="true">
        </${IMPLEMENTATION_TAG}>
    </${EXTENSIONELEMENTS}>
</process>`;
        const fileName = name + '.ai';
        const file = ide.repository.createAIFile(fileName, newModelContent);
        await file.save();
        return fileName;
    }
}

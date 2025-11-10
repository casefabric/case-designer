import AIModelDefinition from "../../../repository/definition/ai/aimodeldefinition";
import { CAFIENNE_NAMESPACE, CAFIENNE_PREFIX, EXTENSIONELEMENTS, IMPLEMENTATION_TAG } from "../../../repository/definition/cmmnextensiontags";
import ParameterDefinition from "../../../repository/definition/contract/parameterdefinition";
import AIFile from "../../../repository/serverfile/aifile";
import ServerFile from "../../../repository/serverfile/serverfile";
import TypeFile from "../../../repository/serverfile/typefile";
import XML from "../../../util/xml";
import IDE from "../../ide";
import Shapes from "../../util/images/shapes";
import ModelEditorMetadata from "../modeleditormetadata";
import Agent from "./agent";
import AIModelEditor from "./aimodeleditor";
import Type from "./type";

export default class AIModelEditorMetadata extends ModelEditorMetadata {
    static INSTANCE: AIModelEditorMetadata;

    private agentMetaData: Agent[] = [];
    private typeMetaData: Type[] = [];
    private readonly builtinFolderName = 'built-in';

    constructor() {
        super();

        AIModelEditorMetadata.INSTANCE = this;
    }

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
    async createNewModel(ide: IDE, name: string, description: string | undefined) {
        const documentation = description ? `<documentation textFormation="text/plain"><text><![CDATA[${description}]]></text></documentation>` : '';
        const newModelContent =
            `<ai name="${name}" xmlns="http://www.omg.org/spec/CMMN/20151109/MODEL" xmlns:cafienne="org.cafienne" implementationType="http://www.omg.org/spec/CMMN/ProcessType/Unspecified">
                ${documentation}
                <${EXTENSIONELEMENTS} mustUnderstand="false">
                    <${IMPLEMENTATION_TAG} ${CAFIENNE_PREFIX}="${CAFIENNE_NAMESPACE}" class="com.casefabric.ai.processtask.definition.AiCallDefinition" async="true">
                    </${IMPLEMENTATION_TAG}>
                </${EXTENSIONELEMENTS}>
            </ai>`;
        const fileName = name + '.ai';
        const file = ide.repository.createAIFile(fileName, newModelContent);
        await file.save();
        return fileName;
    }

    async initializeBuiltInDefinitions(ide: IDE) {
        // Create built-in definitions for AI models if needed
        this.agentMetaData = await ide.aiMetadataStorage.getAgents();
        const aiRequestType: Type = {
            name: 'request',
            properties: [
                {
                    name: 'prompt', cardinality: 'ONE', description: 'The prompt to send to the AI agent', class: 'string'
                }
            ]
        };
        this.typeMetaData = [aiRequestType].concat(await ide.aiMetadataStorage.getTypes());

        for (const agent of this.agentMetaData) {
            await this.createOrUpdateAgentModelDefinition(ide, agent);
        }
    }
    async createOrUpdateAgentModelDefinition(ide: IDE, agent: Agent): Promise<void> {
        const modelName = `${this.builtinFolderName}/${agent.name}`;
        let modelFile = ide.repository.get(modelName + `.${this.fileType}`) as AIFile | undefined;
        if (!modelFile) {
            const fileName = await this.createNewModel(ide, modelName, undefined);
            modelFile = ide.repository.get(fileName) as AIFile;
        }

        const aiModel = modelFile.definition;
        if (!aiModel) {
            ide.danger(`AI model definition could not be created for agent ${agent.name}`);
            return;
        }

        const responseClass = agent.outputField;
        const requestParameterName = 'request';
        const responseParameterName = responseClass.split('.').pop()!;
        aiModel.implementation.xml = `<cafienne:implementation xmlns="http://www.omg.org/spec/CMMN/20151109/MODEL" xmlns:cafienne="org.cafienne" class="com.casefabric.ai.processtask.definition.AiCallDefinition" async="true">
    <parameterMapping sourceRef="responsePayload" targetRef="${responseParameterName}"/>
    <prompt>\${${requestParameterName}.prompt}</prompt>
    <response>${responseClass}</response>
</cafienne:implementation>`;

        await this.updateParametersFromAgent(ide, aiModel, agent, requestParameterName, responseParameterName);

        const newSource = XML.prettyPrint(aiModel.toXML());
        if (modelFile.source.trim() !== newSource.trim()) {
            modelFile.source = newSource;
            await modelFile.save();
        }
    }
    async updateParametersFromAgent(ide: IDE, aiModel: AIModelDefinition, agent: Agent, requestParameterName: string, responseParameterName: string) {
        const responseClass = agent.outputField;
        if (aiModel.inputParameters.length != 1 || aiModel.inputParameters[0].name !== requestParameterName) {
            aiModel.inputParameters.splice(0, aiModel.inputParameters.length);
            const parameter = aiModel.createDefinition(ParameterDefinition<AIModelDefinition>) as ParameterDefinition<AIModelDefinition>;
            parameter.name = requestParameterName;
            aiModel.inputParameters.push(parameter);
        }
        const requestTypeFile = await this.ensureAgentTypeExists(ide, requestParameterName);
        aiModel.inputParameters[0].typeRef = requestTypeFile.fileName;

        if (aiModel.outputParameters.length != 1 || aiModel.outputParameters[0].name !== responseParameterName) {
            aiModel.outputParameters.splice(0, aiModel.outputParameters.length);
            const parameter = aiModel.createDefinition(ParameterDefinition) as ParameterDefinition<AIModelDefinition>;
            parameter.name = responseParameterName;
            aiModel.outputParameters.push(parameter);
        }
        const responseTypeFile = await this.ensureAgentTypeExists(ide, agent.outputField);
        aiModel.outputParameters[0].typeRef = responseTypeFile.fileName;
    }

    async ensureAgentTypeExists(ide: IDE, agentTypeName: string): Promise<TypeFile> {
        const typeDefinitionName = `${this.builtinFolderName}/ai_${agentTypeName.split('.').pop()}`;

        const types = ide.repository.getTypes();
        const existingType = types.find(t => t.name === typeDefinitionName);
        if (existingType) {
            return existingType;
        }

        let propertiesSchemaPart = '';
        const agentType = this.typeMetaData.find(t => t.name === agentTypeName);
        if (!agentType) {
            console.error(`Type definition for agent type ${agentTypeName} not found, creating empty type`);
        } else {
            propertiesSchemaPart = (await Promise.all(agentType.properties.map(async (property, index) => {
                let propertyType = property.class;
                if (!['string', 'int', 'boolean', 'float', 'double', 'long'].includes(propertyType)) {
                    //ensure complex type exists
                    propertyType = (await this.ensureAgentTypeExists(ide, property.class)).fileName;
                }
                else {
                    //map primitive types to built-in types
                    switch (propertyType) {
                        case 'string':
                            propertyType = 'string';
                            break;
                        case 'boolean':
                            propertyType = 'boolean';
                            break;
                        case 'int':
                        case 'long':
                            propertyType = 'integer';
                            break;
                        case 'float':
                        case 'double':
                            propertyType = 'number';
                            break;
                    }
                }
                return `<property id="aisp__${property.name}_${index}" name="${property.name}" type="${propertyType}" multiplicity="${property.cardinality === 'ONE' ? 'ExactlyOne' : 'ZeroOrMore'}"/>`;
            }))).join('\n');
        }

        const typeFile = ide.repository.createTypeFile(
            `${typeDefinitionName}.type`,
            `<type xmlns="http://www.omg.org/spec/CMMN/20151109/MODEL" xmlns:cafienne="org.cafienne" name="${typeDefinitionName}" id="${typeDefinitionName}.type">
    <schema>
        ${propertiesSchemaPart}
    </schema>
</type>`);
        typeFile.parse();
        await typeFile.save();

        return typeFile;
    }


}

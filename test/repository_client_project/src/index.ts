import { CaseDefinition, Definitions, LocalFileStorage, Repository, RepositoryConfiguration, Util } from "@casefabric/repository";

const repository = new Repository(new LocalFileStorage(new RepositoryConfiguration()));
try {
    await repository.listModels();
    const name = "Test";
    const caseFileName = name + '.case';
    const dimensionsFileName = name + '.dimensions';
    const guid = Util.createID();

    const casePlanId = `cm_${guid}_0`;
    const documentation = `<documentation textFormation="text/plain"><text><![CDATA[generated via API]]></text></documentation>`;
    const caseString =
        `<case id="${caseFileName}" name="${name}" guid="${guid}">
            ${documentation}
            <caseFileModel typeRef=""/>
            <casePlanModel id="${casePlanId}" name="${name}"/>
        </case>`;

    const file = repository.createCaseFile("WJG", caseString);
    const casedefinition = new CaseDefinition(file);
    casedefinition.initialize();


    const definitions = new Definitions(casedefinition);
    console.log(definitions.contents());

} catch (error) {
    console.error(error);
}

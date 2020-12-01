class CaseDefinition extends ModelDefinition {
    /**
     * Imports an XML element and parses it into a in-memory definition structure.
     * @param {ModelDocument} modelDocument 
     */
    constructor(modelDocument) {
        super(modelDocument);
    }

    parseDocument() {
        super.parseDocument();
        this.caseFile = this.parseElement('caseFileModel', CaseFileDefinition);
        this.casePlan = this.parseElement('casePlanModel', CasePlanDefinition);
        this.caseTeam = this.parseCaseTeam();
        this.input = this.parseElements('input', ParameterDefinition);
        this.output = this.parseElements('output', ParameterDefinition);
        this.startCaseSchema = this.parseStartCaseSchema();
    }

    validateDocument() {
        this.elements.forEach(element => element.resolveReferences());
    }

    parseCaseTeam() {
        const rolesElements = XML.getChildrenByTagName(this.importNode, 'caseRoles');
        if (rolesElements.length == 0 || rolesElements.length > 1) { // CMMN 1.0 format, we must migrate
            if (rolesElements.length) {
                console.log(`Converting ${rolesElements.length} CMMN1.0 roles`);
            }
            // Create a new element
            const caseTeamElement = XML.parseXML('<caseRoles />').documentElement;
            rolesElements.forEach(role => {
                role.parentElement.removeChild(role);
                caseTeamElement.appendChild(CaseTeamDefinition.convertRoleDefinition(role))
            });
            this.importNode.appendChild(caseTeamElement);
            this.migrated = true;
        }
        return this.parseElement('caseRoles', CaseTeamDefinition);
    }

    /**
     * Returns the element that has the specified identifier, or undefined.
     * If the constructor argument is specified, the element is checked against the constructor with 'instanceof'
     * @param {String} id 
     * @param {Function} constructor
     * @returns {CMMNElementDefinition}
     */
    getElement(id, constructor = undefined) {
        // Override, just to have a generic type cast
        return super.getElement(id, constructor);
    }

    get inputParameters() {
        return this.input;
    }

    get outputParameters() {
        return this.output;
    }

    /**
     * Returns the case plan of this case definition (and creates one with
     * the specified position if it does not exist)
     * @param {Number} x
     * @param {Number} y
     * @returns {CasePlanDefinition}
     */
    getCasePlan(x = 0, y = 0) {
        if (!this.casePlan) {
            this.casePlan = super.createShapedDefinition(CasePlanDefinition, x, y);
        }
        return this.casePlan;
    }

    /**
     * Returns the case file of this case definition (and creates it if it does not exist)
     * @returns {CaseFileDefinition}
     */
    getCaseFile() {
        if (!this.caseFile) {
            this.caseFile = super.createDefinition(CaseFileDefinition);
            this.caseFile.id = undefined;
            this.caseFile.name = undefined;
        }
        return this.caseFile;
    }

    parseStartCaseSchema() {
        const extensionElement = XML.getChildByTagName(this.importNode, 'extensionElements');
        const startCaseNode = XML.getChildByTagName(extensionElement, STARTCASEMODEL_TAG);
        return startCaseNode ? startCaseNode.textContent : '';
    }

    toXML() {
        const xmlDocument = super.exportModel('case', 'caseFile', 'casePlan', 'caseTeam', 'input', 'output');
        // Now dump start case schema if there is one. Should we also do ampersand replacements??? Not sure. Perhaps that belongs in business logic??
        // const startCaseSchemaValue = this.case.startCaseEditor.value.replace(/&/g, '&amp;');
        if (this.startCaseSchema && this.startCaseSchema.trim()) {
            this.exportExtensionElement('cafienne:start-case-model').textContent = this.startCaseSchema;
        }

        // Also export the guid that is used to generate new elements in the case. This must be removed upon deployment.
        this.exportNode.setAttribute('guid', this.typeCounters.guid);
        return xmlDocument;
    }
}

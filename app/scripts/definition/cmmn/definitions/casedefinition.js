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
        this.annotations = this.parseElements('textAnnotation', TextAnnotationDefinition);
        this.startCaseSchema = this.parseStartCaseSchema();
        this.defaultExpressionLanguage = this.parseAttribute('expressionLanguage', 'spel');
    }

    validateDocument() {
        this.elements.forEach(element => element.resolveReferences());
    }

    parseCaseTeam() {
        const rolesElements = XML.getChildrenByTagName(this.importNode, 'caseRoles');
        if (rolesElements.length == 0 || rolesElements.length > 1) { 
            // CMMN 1.0 format, we must migrate. Also, if roles.length == 0, then we should create an element to avoid nullpointers.
            //  Note: if there is only 1 caseRoles tag it can be both CMMN1.0 or CMMN1.1;
            //  CaseTeamDefinition class will do the check if additional migration is required.
            if (rolesElements.length) {
                this.migrated(`Converting ${rolesElements.length} CMMN1.0 roles`);
            }
            // Create a new element
            const caseTeamElement = XML.parseXML('<caseRoles />').documentElement;
            rolesElements.forEach(role => {
                role.parentElement.removeChild(role);
                caseTeamElement.appendChild(CaseTeamDefinition.convertRoleDefinition(role))
            });
            this.importNode.appendChild(caseTeamElement);
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
     * @returns {CasePlanDefinition}
     */
    getCasePlan() {
        if (!this.casePlan) {
            this.casePlan = super.createDefinition(CasePlanDefinition);
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

    /**
     * Create a text annotation that can be child to this stage
     * @param {String} id 
     */
    createTextAnnotation(id = undefined) {
        const annotation = super.createDefinition(TextAnnotationDefinition, id);
        this.annotations.push(annotation);
        return annotation;
    }

    toXML() {
        const xmlDocument = super.exportModel('case', 'caseFile', 'casePlan', 'caseTeam', 'input', 'output', 'annotations');
        // Now dump start case schema if there is one. Should we also do ampersand replacements??? Not sure. Perhaps that belongs in business logic??
        // const startCaseSchemaValue = this.case.startCaseEditor.value.replace(/&/g, '&amp;');
        if (this.startCaseSchema && this.startCaseSchema.trim()) {
            this.exportExtensionElement('cafienne:start-case-model').textContent = this.startCaseSchema;
        }

        if (this.defaultExpressionLanguage) this.exportNode.setAttribute('expressionLanguage', this.defaultExpressionLanguage);

        // Also export the guid that is used to generate new elements in the case. This must be removed upon deployment.
        this.exportNode.setAttribute('guid', this.typeCounters.guid);
        return xmlDocument;
    }
}

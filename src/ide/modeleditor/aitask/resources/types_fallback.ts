import Type from "../type";

export const types: Type[][] = [
  [
    {
      "name": "com.embabel.agent.domain.io.UserInput",
      "properties": [
        {
          "name": "content",
          "cardinality": "ONE",
          "description": "content",
          "class": "string"
        },
        {
          "name": "timestamp",
          "cardinality": "ONE",
          "description": "timestamp",
          "class": "string"
        }
      ]
    },
    {
      "name": "com.casefabric.ai.agent.sales.Company",
      "properties": [
        {
          "name": "name",
          "cardinality": "ONE",
          "description": "name",
          "class": "string"
        },
        {
          "name": "linkedInProfile",
          "cardinality": "ONE",
          "description": "linkedInProfile",
          "class": "string"
        },
        {
          "name": "employeeList",
          "cardinality": "ONE",
          "description": "employeeList",
          "class": "com.casefabric.ai.agent.sales.EmployeeList"
        }
      ]
    },
    {
      "name": "com.embabel.agent.api.common.OperationContext",
      "properties": [
        {
          "name": "Companion",
          "cardinality": "ONE",
          "description": "Companion",
          "class": "com.embabel.agent.api.common.OperationContext$Companion"
        }
      ]
    },
    {
      "name": "com.casefabric.ai.agent.sales.EmployeeList",
      "properties": [
        {
          "name": "employees",
          "cardinality": "LIST",
          "description": "employees",
          "class": "com.casefabric.ai.agent.sales.Employee"
        }
      ]
    },
    {
      "name": "com.casefabric.ai.agent.sales.QualifiedLead",
      "properties": [
        {
          "name": "company",
          "cardinality": "ONE",
          "description": "company",
          "class": "com.casefabric.ai.agent.sales.Company"
        },
        {
          "name": "qualification",
          "cardinality": "ONE",
          "description": "qualification",
          "class": "string"
        }
      ]
    },
    {
      "name": "com.casefabric.ai.agent.content.Story",
      "properties": [
        {
          "name": "text",
          "cardinality": "ONE",
          "description": "text",
          "class": "string"
        }
      ]
    },
    {
      "name": "com.casefabric.ai.agent.content.ReviewedStory",
      "properties": [
        {
          "name": "story",
          "cardinality": "ONE",
          "description": "story",
          "class": "com.casefabric.ai.agent.content.Story"
        },
        {
          "name": "review",
          "cardinality": "ONE",
          "description": "review",
          "class": "string"
        },
        {
          "name": "reviewer",
          "cardinality": "ONE",
          "description": "reviewer",
          "class": "com.embabel.agent.prompt.persona.Persona"
        }
      ]
    }
  ]
];

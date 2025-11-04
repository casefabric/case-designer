import Agent from "../agent";

export const agents: Agent[] = [
  {
    "inputFields": [
      {
        "name": "java.lang.String",
        "schema": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "string"
        }
      }
    ],
    "outputField": {
      "name": "com.casefabric.ai.agent.sales.QualifiedLead",
      "schema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "company": {
            "type": "object",
            "properties": {
              "employeeList": {
                "type": "object",
                "properties": {
                  "employees": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "company": {
                          "type": "string"
                        },
                        "linkedInProfile": {
                          "type": "string"
                        },
                        "name": {
                          "type": "string"
                        },
                        "title": {
                          "type": "string"
                        }
                      }
                    }
                  }
                }
              },
              "linkedInProfile": {
                "type": "string"
              },
              "name": {
                "type": "string"
              }
            }
          },
          "qualification": {
            "type": "integer"
          }
        }
      }
    },
    "name": "QualifyLead"
  },
  {
    "inputFields": [
      {
        "name": "java.lang.String",
        "schema": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "string"
        }
      }
    ],
    "outputField": {
      "name": "com.casefabric.ai.agent.sales.Company",
      "schema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "employeeList": {
            "type": "object",
            "properties": {
              "employees": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "company": {
                      "type": "string"
                    },
                    "linkedInProfile": {
                      "type": "string"
                    },
                    "name": {
                      "type": "string"
                    },
                    "title": {
                      "type": "string"
                    }
                  }
                }
              }
            }
          },
          "linkedInProfile": {
            "type": "string"
          },
          "name": {
            "type": "string"
          }
        }
      }
    },
    "name": "FindCompany"
  },
  {
    "inputFields": [
      {
        "name": "java.lang.String",
        "schema": {
          "$schema": "https://json-schema.org/draft/2020-12/schema",
          "type": "string"
        }
      }
    ],
    "outputField": {
      "name": "com.casefabric.ai.agent.content.ReviewedStory",
      "schema": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "type": "object",
        "properties": {
          "review": {
            "type": "string"
          },
          "reviewer": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string"
              },
              "objective": {
                "type": "string"
              },
              "persona": {
                "type": "string"
              },
              "voice": {
                "type": "string"
              }
            }
          },
          "story": {
            "type": "object",
            "properties": {
              "text": {
                "type": "string"
              }
            }
          }
        }
      }
    },
    "name": "writeAndReviewStory"
  }
];

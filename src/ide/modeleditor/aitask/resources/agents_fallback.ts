import Agent from "../agent";

export const agents: Agent[] = [{
  "inputFields": ["com.embabel.agent.domain.io.UserInput"],
  "outputField": "com.casefabric.ai.agent.sales.QualifiedLead",
  "name": "QualifyLead"
}, {
  "inputFields": ["com.embabel.agent.domain.io.UserInput"],
  "outputField": "com.casefabric.ai.agent.sales.Company",
  "name": "FindCompany"
}, {
  "inputFields": ["com.embabel.agent.domain.io.UserInput"],
  "outputField": "com.casefabric.ai.agent.content.ReviewedStory",
  "name": "writeAndReviewStory"
}];

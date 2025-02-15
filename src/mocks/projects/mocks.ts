import type { JSONProject } from "./fixtures";

import QueryLogic from "can-query-logic";
import { createStoreManager, requestCreator } from "../baseMocks";

import { projects } from "./fixtures";

const queryLogic = new QueryLogic<JSONProject>({
  identity: ["id"],
  keys: {
    id: "string",
    name: "string",
    description: "string",
    roles: {
      type: "list",
      values: {
        keys: {
          id: "string",
        },
      },
    },
  },
});

const relatedStores = [
  {
    source: "roles",
    sourceRelationship: "project",
    targetRelationship: "roles",
  },
];

const storeManager = createStoreManager("projects", projects, queryLogic);

export const projectMocks = Object.values(
  requestCreator("/projects", storeManager.store, relatedStores),
);

export default storeManager;

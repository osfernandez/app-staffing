import type { Filter } from "can-query-logic";
import type { CanLocalStore } from "can-local-store";
import type { RestHandler, DefaultRequestBody, MockedRequest } from "msw";

import { rest } from "msw";
import deparam from "can-deparam";
import { v4 as uuidv4 } from "uuid";

import { stores } from "..";

interface Relationship {
  type: string;
  id: string;
}
export interface BaseResource {
  type: string;
  id: string;
  attributes: Record<string, unknown>;
  relationships?: Record<
    string,
    { data: Relationship | Relationship[] } | undefined
  >;
}

interface MockResponse<
  Data extends BaseResource | BaseResource[] = never,
  Meta = never,
> {
  data?: Data;
  included?: BaseResource[];
  meta?: Meta;
  error?: string;
}

interface RelatedStore {
  source: string;
  sourceRelationship: string;
  targetRelationship: string;
}

const API_BASE_URL = window.env.API_BASE_URL;

export default function requestCreator<Resource extends BaseResource>(
  resourcePath: string,
  store: CanLocalStore<Resource>,
  relatedStores: RelatedStore[],
): { [requestType: string]: RestHandler<MockedRequest<DefaultRequestBody>> } {
  return {
    getOne: rest.get<undefined, MockResponse<Resource>, { id: string }>(
      `${API_BASE_URL}${resourcePath}/:id`,
      async (req, res, ctx) => {
        const id = req.params.id;
        let data = await store.getData({ id });

        if (!data) {
          return res(
            ctx.status(404),
            ctx.json({
              error: `Resource ${id} not found.`,
            }),
          );
        }

        // Parameter that indicates which relationships to include
        // in the response data
        let { include } = deparam(req.url.searchParams.toString());
        include = include?.split(".").join(",").split(",");

        const relationships = await getRelationships(
          id,
          relatedStores,
          include,
        );

        // If we get at least one relationship,
        // we add it to the response data
        if (Object.keys(relationships).length > 0) {
          data = { ...data, relationships };
        }

        const included = await getIncluded([data]);

        return res(
          ctx.status(200),
          ctx.json({
            data,
            included,
          }),
        );
      },
    ),
    getAll: rest.get<
      undefined,
      MockResponse<Resource[], { total: number }>,
      {
        filter?: Filter<Resource>;
        sort?: string;
        page?: number;
        count?: number;
        include?: string;
      }
    >(`${API_BASE_URL}${resourcePath}`, async (req, res, ctx) => {
      const {
        filter,
        sort,
        page = 1,
        count = 25,
      } = deparam(req.url.searchParams.toString());

      const listData = await store.getListData({
        filter,
        sort,
        page: {
          start: (page - 1) * count,
          end: page * count - 1,
        },
      });

      let { data } = listData;
      const { count: total } = listData;

      // Parameter that indicates which relationships to include
      // in the response data
      let { include } = deparam(req.url.searchParams.toString());
      include = include?.split(",");

      if (
        include &&
        relatedStores.some((store: RelatedStore) =>
          include.includes(store.targetRelationship),
        )
      ) {
        data = await Promise.all(
          data.map(async (item) => {
            const relationships = await getRelationships(
              item.id,
              relatedStores,
              include,
            );

            if (Object.keys(relationships).length > 0) {
              return { ...item, relationships };
            }

            return item;
          }),
        );
      }

      const included = await getIncluded(data);

      return res(
        ctx.status(200),
        ctx.json({
          data,
          included,
          meta: {
            total,
            pages: Math.ceil(total / count),
          },
        }),
      );
    }),

    create: rest.post<{ data: Omit<Resource, "id"> }, MockResponse<Resource>>(
      `${API_BASE_URL}${resourcePath}`,
      async (req, res, ctx) => {
        const id = uuidv4();
        const item = { ...req.body.data, id } as Resource; // @TODO: look into typing issue

        await store.createData(item);

        const included = await getIncluded([item]);
        return res(ctx.status(201), ctx.json({ data: item, included }));
      },
    ),
    update: rest.patch<
      { data: Partial<Resource> },
      MockResponse<Resource>,
      { id: string }
    >(`${API_BASE_URL}${resourcePath}/:id`, async (req, res, ctx) => {
      const id = req.params.id;
      const itemExists = await store.getData({ id });

      if (!itemExists) {
        return res(
          ctx.status(404),
          ctx.json({
            error: `Resource ${id} not found.`,
          }),
        );
      }

      const updatedItem = await store.updateData({ ...req.body.data, id });

      if (!updatedItem) {
        return res(
          ctx.status(400),
          ctx.json({
            error: `Could not update Resource with id: ${id}`,
          }),
        );
      }

      const included = await getIncluded([updatedItem]);
      return res(
        ctx.status(201),
        ctx.json({
          data: updatedItem,
          included,
        }),
      );
    }),
    destroy: rest.delete<undefined, MockResponse, { id: string }>(
      `${API_BASE_URL}${resourcePath}/:id`,
      async (req, res, ctx) => {
        const id = req.params.id;
        const resourceToDelete = await store.getData({ id });

        if (!resourceToDelete) {
          return res(
            ctx.status(404),
            ctx.json({
              error: `Resource with id: ${id} not found.`,
            }),
          );
        }

        await store.destroyData(resourceToDelete);
        return res(ctx.status(204));
      },
    ),
  };
}

async function getIncluded(items: BaseResource[]): Promise<BaseResource[]> {
  const included: BaseResource[] = [];
  const processing = [...items];
  while (processing.length > 0) {
    const item = processing.pop() as BaseResource;

    if (item.relationships) {
      for (const key in item.relationships) {
        const relationship = item.relationships[key];
        if (!relationship?.data) continue;

        const relationships = Array.isArray(relationship.data)
          ? relationship.data
          : [relationship.data];

        for (const { type, id } of relationships) {
          if (included.find((item) => item.type === type && item.id === id)) {
            continue;
          }

          const store = stores[type];
          if (!store) {
            throw new Error(
              `${item.type}[${item.id}].relationships.${key}: Invalid type ${type}`,
            );
          }

          try {
            const data = await store.getData({ id });
            included.push(data);
            processing.push(data);
          } catch (e) {
            // Clear joins that reference missing records.
            if (Array.isArray(relationship.data)) {
              relationship.data = relationship.data.filter(
                (item) => item.id !== id,
              );

              if (relationship.data.length === 0) {
                delete item.relationships[key];
              }
            } else {
              delete item.relationships[key];
            }
          }
        }
      }
    }
  }

  included.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type < b.type ? -1 : 1;
    }

    if (a.id !== b.id) {
      return a.id < b.id ? -1 : 1;
    }

    return 0;
  });

  return included;
}

async function getRelationships(
  entityId: string,
  relatedStores: RelatedStore[],
  include: string[] = [],
): Promise<Record<string, unknown>> {
  const relationships: Record<string, unknown> = {};

  for (const relatedStore of relatedStores) {
    const { source, sourceRelationship, targetRelationship } = relatedStore;

    // We check that the query asks for this relationship to be included
    if (include.includes(targetRelationship)) {
      // We first get all data from the related store
      const relatedStoreDataList = await stores[source].getListData();

      // We filter the data to keep only what is related to
      // this particular entity
      const filteredData = relatedStoreDataList.data.filter((relatedData) => {
        const data = relatedData.relationships?.[sourceRelationship]?.data;
        if (Array.isArray(data)) {
          return data.some((item) => item.id === entityId);
        } else {
          return data?.id === entityId;
        }
      });

      // Finally we add a new entry in our relationships object
      // with the corresponding data
      relationships[targetRelationship] = { data: filteredData };
    }
  }
  return relationships;
}

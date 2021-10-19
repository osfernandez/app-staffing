import type { APIResponse, QueriableList } from "../shared";

import { useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
import param from "can-param";

import { fetcher } from "../shared";

interface RestActions<T> extends APIResponse<T[]> {
  handleAdd: (newCollectionItem: Omit<T, "id">) => Promise<string>;
  handleUpdate: (
    collectionItemId: string,
    updatedCollectionItem: Partial<T>,
  ) => Promise<void>;
  handleDelete: (collectionItemId: string) => Promise<void>;
}

function useRest<T extends { id: string }>(
  path: string,
  queryParams?: QueriableList<T>,
): RestActions<T> {
  const { mutate } = useSWRConfig();
  const { data: response, error } = useSWR<{ data: T[] }, Error>(
    `${path}?${param(queryParams)}`,
    (url) => fetcher("GET", url),
  );

  const handleAdd = useCallback<
    (newCollectionItem: Omit<T, "id">) => Promise<string>
  >(
    async (newCollectionItem: Omit<T, "id">) => {
      let newId = "";
      await mutate(
        `${path}?${param(queryParams)}`,
        async (addResponse: { data: T[] }) => {
          const { data: newItem } = await fetcher<{ data: T }>(
            "POST",
            path,
            newCollectionItem,
          );

          newId = newItem.id;

          return {
            ...addResponse,
            data: [...addResponse.data, newItem],
          };
        },
        false,
      );

      return newId;
    },
    [path, queryParams, mutate],
  );

  const handleUpdate = useCallback<
    (
      collectionItemId: string,
      updatedCollectionItem: Partial<T>,
    ) => Promise<void>
  >(
    async (collectionItemId: string, updatedCollectionItem: Partial<T>) => {
      await mutate(
        `${path}?${param(queryParams)}`,
        async (cachedData: { data: T[] }) => {
          const response = await fetcher<{ data: T }>(
            "PUT",
            `${path}/${collectionItemId}`,
            updatedCollectionItem,
          );

          return {
            ...cachedData,
            data: (cachedData?.data ?? []).map((item) =>
              item.id === response.data.id ? response.data : item,
            ),
          };
        },
        false,
      );
    },
    [path, queryParams, mutate],
  );

  const handleDelete = useCallback(
    async (collectionItemId: string) => {
      await mutate(
        `${path}?${param(queryParams)}`,
        async (deleteResponse: { data: T[] }) => {
          await fetcher("DELETE", `${path}/${collectionItemId}`);

          return {
            ...deleteResponse,
            data: deleteResponse.data.filter(
              (item) => item.id !== collectionItemId,
            ),
          };
        },
        false,
      );
    },
    [path, queryParams, mutate],
  );

  return {
    data: response?.data,
    error,
    isLoading: !response && !error,
    handleAdd,
    handleUpdate,
    handleDelete,
  };
}

export default useRest;

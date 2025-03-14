import { ECollectionNames } from "@/enums";
import { getCollections } from "@/services/api-service";
import { Dispatch, SetStateAction } from "react";

export const fetchGetCollections = async <T>(
  collectionName: ECollectionNames, 
  setCollections?: Dispatch<SetStateAction<T[]>>
): Promise<T[]> => {
  try {
    const response: Response = await getCollections(collectionName);

    if ( !response.ok ) 
      throw new Error(response.statusText);

    const json: T[] = await response.json();

    if ( setCollections )
      setCollections(json);

    return json;
  } catch (error: unknown) {
    console.error(error)

    return [];
  }
}

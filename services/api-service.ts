import { ROOT } from "@/constants/root.constant";
import { ECollectionNames } from "@/enums";
import { nameToHyphenAndLowercase } from "@/utils/name-to-hyphen-and-lowercase";

const getCollectionCount = async (
  collectionName: ECollectionNames, 
): Promise<Response> => 
  await fetch(`${ROOT}/${nameToHyphenAndLowercase(collectionName)}/count`);

const getCollections = async (
  collectionName: ECollectionNames, 
): Promise<Response> => 
  await fetch(`${ROOT}/${nameToHyphenAndLowercase(collectionName)}`);

const addCollection = async <T>(
  collection: T, collectionName: ECollectionNames, 
): Promise<Response> => 
  await fetch(`${ROOT}/${nameToHyphenAndLowercase(collectionName)}`, {
    method: `POST`,
    body: JSON.stringify(collection),
  });

const updateCollectionById = async <T>(
  collection: T, collectionId: string, collectionName: ECollectionNames, 
): Promise<Response> => 
  await fetch(`${ROOT}/${nameToHyphenAndLowercase(collectionName)}/${collectionId}`, {
    method: `PATCH`,
    body: JSON.stringify(collection),
  });

const deleteCollections = async (
  collectionName: ECollectionNames, 
): Promise<Response> => 
  await fetch(`${ROOT}/${nameToHyphenAndLowercase(collectionName)}`, {
    method: `DELETE`,
  });

const getCollectionById = async (
  collectionId: string, collectionName: ECollectionNames, 
): Promise<Response> => 
  await fetch(
    `${ROOT}/${nameToHyphenAndLowercase(collectionName)}/${collectionId}`
  );

const deleteCollectionById = async (
  collectionId: string, collectionName: ECollectionNames, 
): Promise<Response> => 
  await fetch(
    `${ROOT}/${nameToHyphenAndLowercase(collectionName)}/${collectionId}`, 
    { method: `DELETE`,}
  );

  export {
    getCollectionCount,
    getCollections, 
    addCollection, 
    deleteCollections, 
    getCollectionById, 
    deleteCollectionById, 
    updateCollectionById, 
  }

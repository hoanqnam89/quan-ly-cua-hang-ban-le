import { ECollectionNames } from "@/enums";

export const createMoreInfoTooltip = (
  collectionName: ECollectionNames
): string => 
  `Show more information of this ${collectionName}`

export const createDeleteTooltip = (
  collectionName: ECollectionNames
): string => 
  `Delete this ${collectionName}`

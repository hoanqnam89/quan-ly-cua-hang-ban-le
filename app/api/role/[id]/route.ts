import { NextRequest, NextResponse } from "next/server";
import { deleteCollectionByIdApi, getCollectionByIdApi } from "@/utils/api-helper";
import { IQueryString } from "../../interfaces/query-string.interface";
import { ECollectionNames } from "@/enums";
import { IRole } from "@/interfaces";
import { RoleModel } from "@/models";
import { ROOT } from "@/constants/root.constant";

type collectionType = IRole;
const collectionName: ECollectionNames = ECollectionNames.ROLE;
const collectionModel = RoleModel;
const path: string = `${ROOT}/${collectionName.toLowerCase()}/[id]`;

export const GET = async (
  _req: NextRequest, query: IQueryString
): Promise<NextResponse> => 
  await getCollectionByIdApi<collectionType>(
    collectionModel, 
    collectionName, 
    path, 
    query
  );

export const DELETE = async (
  _req: NextRequest, query: IQueryString
): Promise<NextResponse> => 
  await deleteCollectionByIdApi<collectionType>(
    collectionModel, 
    collectionName, 
    path, 
    query
  );

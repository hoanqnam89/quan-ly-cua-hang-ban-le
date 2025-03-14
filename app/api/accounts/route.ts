import { EStatusCode } from "@/enums";
import { IAccount } from "@/interfaces/account.interface";
import { connectToDatabase } from "@/libs/connect-to-database";
import { AccountModel } from "@/models/Account.model";
import { createErrorMessage } from "@/utils/create-error-message";
import { NextResponse } from "next/server";

export const GET = async (): Promise<NextResponse> => {
  try {
		connectToDatabase();

		const collections: IAccount[] = await AccountModel.find({});

  	return NextResponse.json(collections, { status: EStatusCode.OK });
  } catch (error: unknown) {
		console.error(error);

		return NextResponse.json(
			createErrorMessage(
				`Failed to read accounts.`,
				error as string,
				``, 
				``, 
			),
			{ status: EStatusCode.INTERNAL_SERVER_ERROR }
		);
  }
}

export const POST = async (): Promise<NextResponse> => {
	return NextResponse.json("1", {
		status:200
	});
}

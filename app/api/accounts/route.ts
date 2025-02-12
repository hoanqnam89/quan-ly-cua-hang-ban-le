import { NextResponse } from "next/server";

export const GET = async (): Promise<NextResponse> => {
    console.log('Get accounts');
    return NextResponse.json("hello word",{
        status:200
    });
}
export const POST = async (): Promise<NextResponse> => {
    console.log('Create account');
    return NextResponse.json("1",{
        status:200
    });
}
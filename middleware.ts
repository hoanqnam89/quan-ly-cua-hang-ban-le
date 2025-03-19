import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "./constants";

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const token: string = req.cookies.get(COOKIE_NAME)?.value || ``;

  // const secret: string = process.env.JWT_SECRET || ``;
  // const user = verify(token, secret);

  if (token)
    return NextResponse.next();
  
  return NextResponse.redirect(new URL(`/`, req.url));
}

export const config = { 
  matcher: [
    `/home`, 
    `/home/(.*)`, 
  ] 
}

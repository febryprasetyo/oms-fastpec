import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import withAuth from "./middleware/withAuth";

function mainMiddleware(request: NextRequest) {
  const res = NextResponse.next();
  return res;
}

// Route yang memerlukan autentikasi
export default withAuth(mainMiddleware, [
  "/",
  "/login",
  "/mesin",
  "/stasiun",
  "/database",
  "/user",
]);

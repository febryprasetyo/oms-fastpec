import { auth } from "@/lib/auth";
import axios from "@/lib/axios";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return Response.redirect("/login");
  }
  const body = await request.json();

  if (body.stringID === "") {
    return Response.json([]);
  }

  const res = await axios.get(`/api/data/station/city-list/${body.stringID}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.user.token.access_token}`,
    },
  });

  return Response.json(res.data);
}

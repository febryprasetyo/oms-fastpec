import { auth } from "@/lib/auth";
import axios from "@/lib/axios";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return Response.redirect("/login");
  }

  const res = await axios.get("/api/data/station/device-list", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.user.token.access_token}`,
    },
  });

  return Response.json(res.data);
}

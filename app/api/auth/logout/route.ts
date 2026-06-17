import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" });

  res.cookies.set("student_session", "", {
    path: "/",
    maxAge: 0,
  });

  return res;
}
import { NextRequest, NextResponse } from "next/server";

// The base URL of your backend
const BASE_URL = "https://schema-sync.onrender.com/schema/get_all_schemas";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userUuid = searchParams.get("userUuid");
    if (!userUuid) {
      return NextResponse.json(
        { error: "User UUID is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BASE_URL}/${userUuid}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    // return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

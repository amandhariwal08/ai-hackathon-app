import { NextRequest, NextResponse } from "next/server";

// The base URL of your backend
const BASE_URL = "https://schema-sync.onrender.com/schema";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { userUuid, ...rest } = payload;

    if (!userUuid) {
      return NextResponse.json(
        { error: "UUID is required in the payload" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BASE_URL}/${userUuid}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rest), // send the rest of the payload without uuid
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const schemaUuid = searchParams.get("schemaUuid");
    if (!schemaUuid) {
      return NextResponse.json(
        { error: "Schema UUID is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BASE_URL}/${schemaUuid}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const payload = await req.json();
    const { schemaUuid, ...rest } = payload;

    if (!schemaUuid) {
      return NextResponse.json(
        { error: "Schema Uuid is required in the payload" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BASE_URL}/${schemaUuid}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rest),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // If you need an ID, get it from query params or body
    const { schemaUuid } = await req.json();
    const response = await fetch(`${BASE_URL}/${schemaUuid}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

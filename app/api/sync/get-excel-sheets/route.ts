import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Parse the incoming form data
  const formData = await req.formData();

  // Prepare a new FormData to send to the backend
  const backendFormData = new FormData();
  // For each file, append to backendFormData with the key "file"
  for (const [key, value] of formData.entries()) {
    // Only forward files (not other fields)
    if (value instanceof File) {
      backendFormData.append("file", value, value.name);
    }
  }

  // Forward the request to the actual backend
  const backendRes = await fetch(
    "https://schema-sync.onrender.com/sync/get_excel_sheets",
    {
      method: "POST",
      body: backendFormData,
      // Do NOT set Content-Type header; fetch will set it for FormData
    }
  );

  // Forward the backend response to the client
  const data = await backendRes.json();
  return NextResponse.json(data, { status: backendRes.status });
}

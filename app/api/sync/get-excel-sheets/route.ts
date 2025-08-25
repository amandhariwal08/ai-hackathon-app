import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Parse the incoming form data
  const formData = await req.formData();

  // Prepare a new FormData to send to the backend
  const backendFormData = new FormData();
  // For each file, append to backendFormData with the key "file"
  const file = formData.get("file");
  if (file instanceof File) {
    backendFormData.append("file", file, file.name);
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

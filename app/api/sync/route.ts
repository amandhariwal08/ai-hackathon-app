import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Parse the incoming form data
  const formData = await req.formData();

  // Prepare a new FormData to send to the backend
  const backendFormData = new FormData();

  // Forward all files (key: "files")
  for (const [key, value] of formData.entries()) {
    if (key === "files" && value instanceof File) {
      backendFormData.append("files", value, value.name);
    }
    // Forward sync_metadata as is
    if (key === "sync_metadata" && typeof value === "string") {
      backendFormData.append("sync_metadata", value);
    }
  }

  // Forward the request to the actual backend
  const backendRes = await fetch("https://schema-sync.onrender.com/sync/", {
    method: "POST",
    body: backendFormData,
    // Do NOT set Content-Type header; fetch will set it for FormData
  });

  // const contentType = backendRes.headers.get("content-type");
  // let data;
  // if (contentType && contentType.includes("application/json")) {
  //   data = await backendRes.json();
  // } else {
  //   data = await backendRes.text();
  // }
  // return NextResponse.json({ data }, { status: backendRes.status });

  // If backend returns JSON, just forward it
  const contentType = backendRes.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  }

  // Otherwise, treat as file/binary and convert to base64
  const arrayBuffer = await backendRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");

  // Try to get filename from Content-Disposition header
  let filename = "result.xlsx";
  const disposition = backendRes.headers.get("content-disposition");
  if (disposition && disposition.includes("filename=")) {
    filename = disposition.split("filename=")[1].replace(/"/g, "");
  }

  return NextResponse.json(
    { data: base64, filename },
    { status: backendRes.status }
  );
}

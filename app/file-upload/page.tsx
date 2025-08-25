"use client";
import { Card, CardContent } from "@/components/ui/card";
import DashboardLayout from "../layout/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRef } from "react";
import { SchemasResponse } from "@/components/schema/schema-table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

type GetExcelSheetsResponse = {
  message: string;
  sheet_names: string[];
};

export default function Page() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [sheetNames, setSheetNames] = useState<string[]>([]);

  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [selectedSchema, setSelectedSchema] = useState<string>("");

  const [schemaOptions, setSchemaOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { data: session } = useSession();
  const userUuid = session?.user.id || "";

  async function fetchSchemas() {
    try {
      setLoading(true);
      // setError(null);
      const res = await fetch(
        `/api/schema/get-all-schemas?userUuid=${userUuid}`
      );
      if (!res.ok) throw new Error("Failed to fetch schemas");
      const data: SchemasResponse = await res.json();

      setSchemaOptions(
        data.output_schemas.map((schema) => ({
          label: schema.schema_name,
          value: schema.schema_uuid,
        }))
      );
    } catch {
      // setError(err || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function downloadFromBase64(
    base64: string,
    filename: string,
    mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    const link = document.createElement("a");
    link.href = `data:${mime};base64,${base64}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function syncFiles(file: File, syncMetadata: object) {
    const formData = new FormData();

    formData.append("files", file);

    // const isCSV = file.name.endsWith(".csv") || file.type === "text/csv";

    // Append sync_metadata as a JSON string
    formData.append("sync_metadata", JSON.stringify(syncMetadata));

    const res = await fetch("/api/sync", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Sync failed");
    }
    const { data, filename } = await res.json();
    downloadFromBase64(data, filename);
  }

  async function handleSubmitSync() {
    if (selectedFile) {
      const syncMetadata = {
        user_uuid: userUuid,
        file_metadatas: {
          [selectedFile.name]: {
            schema_uuid: selectedSchema,
            sheet: selectedSheet,
          },
        },
      };
      {
        syncFiles(selectedFile, syncMetadata)
          .then((data) => console.log("Sync successful:", data))
          .catch((err) => alert(err.message));
      }
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setSelectedFile(file);
    if (file) {
      // Wait for state to update, then upload
      setTimeout(() => handleUpload(file), 0);
    }
  }

  async function handleUpload(file: File | null) {
    if (!file) return;
    setSelectedFile(file);

    fetchSchemas();

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith(".csv") || file.type === "text/csv";

    if (isCSV) {
      setSheetNames([fileName]);
      return;
    }

    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }

    try {
      const res = await fetch("/api/sync/get-excel-sheets", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        // alert(errorData.error || "Upload failed");
        console.log(errorData);

        return;
      }

      const data: GetExcelSheetsResponse = await res.json();

      setSheetNames(data.sheet_names);
      // alert("Upload successful!");
      // handle response as needed
    } catch (err) {
      console.log(err);

      // alert("An error occurred during upload.");
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    const file =
      e.dataTransfer.files && e.dataTransfer.files[0]
        ? e.dataTransfer.files[0]
        : null;
    setSelectedFile(file);
    if (file) {
      setTimeout(() => handleUpload(file), 0);
    }
  }

  return (
    <DashboardLayout title="File Upload">
      <div className="flex flex-col items-center justify-center w-full">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div
              className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col gap-1 p-6 items-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={handleDrop}
            >
              <FileIcon className="w-12 h-12" />
              <span className="text-sm font-medium text-gray-500">
                Drag and drop a file or click to browse
              </span>
              <span className="text-xs text-gray-500">Excel or CSV</span>
            </div>
            <div className="space-y-2 text-sm">
              {/* <Label htmlFor="file" className="text-sm font-medium">
                File
              </Label> */}
              <Input
                ref={fileInputRef}
                id="file"
                type="file"
                placeholder="File"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              {selectedFile && (
                <div className="text-xs text-gray-600 mt-1">
                  Selected: {selectedFile.name}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {sheetNames?.length && schemaOptions?.length ? (
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 mt-6 max-w-xs">
              <div>
                <label className="block mb-1 font-medium">Select Sheet</label>
                <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select sheet" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Sheets</SelectLabel>
                      {sheetNames.map((sheet) => (
                        <SelectItem key={sheet} value={sheet}>
                          {sheet}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Select Schema</label>
                <Select
                  value={selectedSchema}
                  onValueChange={setSelectedSchema}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select schema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Schemas</SelectLabel>
                      {schemaOptions.map((schema) => (
                        <SelectItem key={schema.value} value={schema.value}>
                          {schema.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSubmitSync}>
              {loading ? <Loader2 /> : "Sync and download file"}
            </Button>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

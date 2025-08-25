import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "../ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

export type OutputSchema = {
  schema_uuid: string;
  schema_name: string;
  user_uuid: string;
  schema: Record<string, string>;
};

export type SchemasResponse = {
  message: string;
  user_uuid: string;
  output_schemas: OutputSchema[];
};

export function SchemaTable() {
  const [schemas, setSchemas] = useState<OutputSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: session } = useSession();
  const userUuid = session?.user.id || "";

  const router = useRouter();

  async function fetchSchemas() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `/api/schema/get-all-schemas?userUuid=${userUuid}`
      );
      if (!res.ok) throw new Error("Failed to fetch schemas");
      const data: SchemasResponse = await res.json();

      setSchemas(data.output_schemas);
    } catch {
      // setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function deleteSchema(schemaUuid: string) {
    const res = await fetch("/api/schema", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ schemaUuid }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete schema");
    else fetchSchemas();
  }

  useEffect(() => {
    fetchSchemas();
  }, [userUuid]);

  return (
    <div className="p-4">
      {loading ? (
        <div className="h-full w-full flex flex-col items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="flex justify-end">
            <Button
              variant={"outline"}
              onClick={() => router.push("/column-schemas/create-schema")}
            >
              Create New Schema
            </Button>
          </div>

          {schemas?.length === 0 ? (
            <div> No Schemas Found, Create a new schema.</div>
          ) : (
            <div className="px-12">
              <Card className="p-0">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="rounded-md">
                        <TableHead className="pl-10 font-semibold h-12 bg-accent rounded-tl-lg">
                          Schema Name
                        </TableHead>
                        <TableHead className="pr-10 h-12 text-right font-semibold bg-accent rounded-tr-lg">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={2}>Loading...</TableCell>
                        </TableRow>
                      ) : error ? (
                        <TableRow>
                          <TableCell colSpan={2} className="text-red-500">
                            {error}
                          </TableCell>
                        </TableRow>
                      ) : schemas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2}>No schemas found.</TableCell>
                        </TableRow>
                      ) : (
                        schemas.map((schema) => (
                          <TableRow
                            key={schema.schema_uuid}
                            onClick={() =>
                              router.push(
                                `/column-schemas/edit-schema/${schema.schema_uuid}`
                              )
                            }
                            className="hover:cursor-pointer"
                          >
                            <TableCell className="font-medium pl-10">
                              {schema.schema_name}
                            </TableCell>
                            <TableCell className="text-right pr-10">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    type="button"
                                    size={"icon"}
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                    className="hover:bg-accent hover:text-destructive"
                                  >
                                    <Trash2 />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will
                                      permanently delete your schema.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteSchema(schema.schema_uuid);
                                      }}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

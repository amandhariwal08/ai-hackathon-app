"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OutputSchema, SchemasResponse } from "./schema-table";

// 1. Update schema to include schema_name
const entrySchema = z.object({
  columnName: z.string().min(2, "Column must be at least 2 characters."),
  description: z.string(),
});

const formSchema = z.object({
  schema_name: z.string().min(2, "Schema name is required"),
  entries: z.array(entrySchema),
});

type FormValues = z.infer<typeof formSchema>;

export default function SchemaForm({ schemaUuid }: { schemaUuid?: string }) {
  const [schemaData, setSchemaData] = useState<OutputSchema | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { data: session } = useSession();
  const userUuid = session?.user.id;

  const router = useRouter();

  const { control, handleSubmit, reset, watch } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schema_name: "",
      entries: [{ columnName: "", description: "" }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "entries",
  });

  async function onSubmit(values: FormValues) {
    const schema: Record<string, string> = {};
    values.entries.forEach((entry) => {
      schema[entry.columnName] = entry.description;
    });

    const payload = {
      schema_name: values.schema_name,
      schema,
      ...(schemaUuid ? { schemaUuid } : { userUuid }),
    };

    const response = await fetch("/api/schema", {
      method: schemaUuid ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      router.push("/column-schemas");
    } else {
      console.log("error");
    }
  }

  async function getSchema(schemaUuid: string) {
    try {
      setLoading(true);
      const res = await fetch(`/api/schema?schemaUuid=${schemaUuid}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch schema");
      }

      const data = await res.json();
      const output = data.output_schema;
      setSchemaData(output);

      // Transform schema object to entries array
      const entries = Object.entries(output.schema).map(
        ([columnName, description]) => ({
          columnName,
          description: String(description),
        })
      );

      console.log(entries);

      // Reset the form with the mapped data
      reset({
        schema_name: output.schema_name,
        entries,
      });
    } catch (err) {
      console.error("Error fetching schema:", err);
    } finally {
      setLoading(false);
    }
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      schema_name: "",
      entries: [{ columnName: "", description: "" }],
    },
  });

  useEffect(() => {
    if (schemaUuid) getSchema(schemaUuid);
  }, [schemaUuid]);

  return (
    <div className="min-h-screen bg-background p-8">
      {loading ? (
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{schemaUuid ? "Update" : "Add New"} Schema</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Schema Name Field */}
                  <FormField
                    control={control}
                    name="schema_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schema Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter schema name..."
                            {...field}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Dynamic Entries */}
                  {fields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="flex items-end justify-between border-b pb-4 mb-4 "
                    >
                      <FormField
                        control={control}
                        name={`entries.${idx}.columnName`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Column Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter name..."
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name={`entries.${idx}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter description..."
                                className="w-full"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {fields.length > 1 && (
                        <Button
                          size={"icon"}
                          type="button"
                          variant="destructive"
                          onClick={() => remove(idx)}
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </div>
                  ))}
                  <div className="w-full flex items-center justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        append({ columnName: "", description: "" })
                      }
                    >
                      Add New Line
                    </Button>
                  </div>
                  <Button type="submit" className="w-full">
                    {schemaUuid ? "Update" : "Save"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

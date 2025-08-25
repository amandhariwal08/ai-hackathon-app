"use client";
import { use } from "react";
import DashboardLayout from "@/app/layout/dashboard-layout";
import SchemaForm from "@/components/schema/schema-form";

export default function EditSchemaPage({
  params,
}: {
  params: Promise<{ schema_uuid: string }>;
}) {
  const { schema_uuid } = use(params);
  return (
    <DashboardLayout title="Edit Schema">
      <SchemaForm schemaUuid={schema_uuid} />
    </DashboardLayout>
  );
}

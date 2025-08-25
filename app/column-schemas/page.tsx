"use client";
import DashboardLayout from "../layout/dashboard-layout";
import { SchemaTable } from "@/components/schema/schema-table";

export default function Schemas() {
  return (
    <DashboardLayout title="Schemas">
      {" "}
      <SchemaTable />
    </DashboardLayout>
  );
}

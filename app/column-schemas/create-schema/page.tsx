"use client";
import DashboardLayout from "@/app/layout/dashboard-layout";
import SchemaForm from "@/components/schema/schema-form";

export default function Schemas() {
  return (
    <DashboardLayout title="Create Schema">
      {" "}
      <SchemaForm />
    </DashboardLayout>
  );
}

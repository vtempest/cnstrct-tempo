"use client";

import { useState } from "react";
import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, Play } from "lucide-react";

export default function MigrationsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: string;
    error?: string;
  } | null>(null);

  const migrations = [
    {
      id: "20240601000009",
      name: "Add Contact Fields",
      description:
        "Adds contact_name, contact_email, and contact_phone columns to the projects table",
      path: "supabase/migrations/20240601000009_add_contact_fields.sql",
    },
  ];

  const runMigration = async (migrationPath: string) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/run-migration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ migrationFile: migrationPath }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({ error: data.error || "Failed to run migration" });
      } else {
        setResult({ success: "Migration completed successfully" });
      }
    } catch (error: any) {
      setResult({ error: error.message || "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Database Migrations</h1>
        </div>

        {result && (
          <Alert
            className={`mb-6 ${result.success ? "bg-green-50" : "bg-red-50"}`}
          >
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>
              {result.success || result.error}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Available Migrations</CardTitle>
            <CardDescription>
              Run database migrations to update your schema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {migrations.map((migration) => (
                <div
                  key={migration.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{migration.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {migration.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ID: {migration.id}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => runMigration(migration.path)}
                    disabled={loading}
                    size="sm"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {loading ? "Running..." : "Run Migration"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

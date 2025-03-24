import { createClient } from "../../../../../../supabase/server";
import { redirect } from "next/navigation";
import { ensureUUID } from "@/utils/id-helpers";
import Link from "next/link";
import { ArrowLeft, File, Upload } from "lucide-react";
import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { uploadDocumentAction } from "../../project-actions";

export default async function ProjectDocumentsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Ensure the ID is in UUID format
  const projectId = ensureUUID(params.id);

  // Fetch project details
  let project = null;
  let projectError = null;

  if (projectId) {
    try {
      const result = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      project = result.data;
      projectError = result.error;
    } catch (error) {
      console.error("Error fetching project:", error);
      projectError = { message: "Error fetching project data" };
    }
  }

  // Fetch documents for this project
  let documents = [];
  let documentsError = null;

  if (projectId) {
    try {
      const result = await supabase
        .from("documents")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      documents = result.data || [];
      documentsError = result.error;
    } catch (error) {
      console.error("Error fetching documents:", error);
      documentsError = { message: "Error fetching document data" };
    }
  }

  return (
    <>
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href={`/dashboard/projects/${params.id}`}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {project?.title
                ? `${project.title} - Documents`
                : "Project Documents"}
            </h1>
            <p className="text-muted-foreground">
              Upload and manage project documents
            </p>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>
              Upload contracts, lien releases, and other project documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={uploadDocumentAction} className="space-y-4">
              <input type="hidden" name="projectId" value={params.id} />
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium mb-1"
                >
                  Document Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium mb-1"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="contract">Contract</option>
                  <option value="lien-release">Lien Release</option>
                  <option value="permit">Permit</option>
                  <option value="invoice">Invoice</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label
                  htmlFor="file"
                  className="block text-sm font-medium mb-1"
                >
                  File
                </label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <Button type="submit" className="flex items-center">
                <Upload className="mr-2 h-4 w-4" /> Upload Document
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Documents</CardTitle>
            <CardDescription>
              All documents related to this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg"
                  >
                    <div className="space-y-1 mb-3 md:mb-0">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">{doc.title}</h3>
                      </div>
                      {doc.description && (
                        <p className="text-sm text-muted-foreground">
                          {doc.description}
                        </p>
                      )}
                      <p className="text-sm">
                        Uploaded:{" "}
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Document
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No documents uploaded yet.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}

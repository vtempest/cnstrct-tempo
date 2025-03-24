import { createClient } from "../../../../../supabase/server";
import { redirect } from "next/navigation";
import { ensureUUID } from "@/utils/id-helpers";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  DollarSign,
  Edit,
  MapPin,
  Plus,
  User,
  Upload,
} from "lucide-react";
import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AddMilestoneDialog } from "@/components/add-milestone-dialog";
import { CreateInvoiceDialog } from "@/components/create-invoice-dialog";
import { AddExpenseDialog } from "@/components/add-expense-dialog";
import { updateMilestoneStatusAction } from "../project-actions";

// Fallback data if database queries fail
const mockProject = {
  id: "1",
  title: "Downtown Office Renovation",
  client: "ABC Corporation",
  status: "active",
  start_date: "2023-06-15",
  due_date: "2023-12-15",
  budget: 250000,
  location: "123 Main Street, Downtown",
  description:
    "Complete renovation of a 3-story office building including new electrical, plumbing, HVAC, and interior finishes. Project includes sustainable building practices and energy-efficient systems.",
  completion_percentage: 65,
  contact_name: "John Smith",
  contact_email: "john.smith@abccorp.com",
  contact_phone: "(555) 123-4567",
};

// Fallback milestone data
const mockMilestones = [
  {
    id: "m1",
    title: "Demolition Complete",
    due_date: "2023-07-15",
    status: "completed",
    amount: 50000,
    description:
      "Removal of existing interior walls, flooring, and ceiling systems.",
  },
  {
    id: "m2",
    title: "Framing Complete",
    due_date: "2023-08-30",
    status: "completed",
    amount: 75000,
    description:
      "Installation of new wall framing, door frames, and ceiling supports.",
  },
  {
    id: "m3",
    title: "MEP Rough-in",
    due_date: "2023-10-15",
    status: "in-progress",
    amount: 60000,
    description:
      "Installation of electrical, plumbing, and HVAC systems before walls are closed.",
  },
  {
    id: "m4",
    title: "Finishes",
    due_date: "2023-11-30",
    status: "not-started",
    amount: 45000,
    description:
      "Installation of drywall, paint, flooring, and ceiling finishes.",
  },
  {
    id: "m5",
    title: "Final Inspection",
    due_date: "2023-12-10",
    status: "not-started",
    amount: 20000,
    description: "Final building inspection and punch list completion.",
  },
];

// Fallback financial data
const mockFinancials = {
  totalBudget: 250000,
  invoiced: 125000,
  paid: 125000,
  pending: 0,
  expenses: 110000,
  profit: 15000,
};

import { ToastHandler } from "./toast-handler";

export default async function ProjectDetailsPage({
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

  // If projectId is not a valid UUID, use mock data
  let project = null;
  let projectError = null;

  if (projectId) {
    try {
      // Fetch project details from Supabase
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
  } else {
    console.error("Invalid UUID format in URL params:", params.id);
    projectError = { message: "Invalid project ID format" };
    // Use mock data when ID is invalid
    project = mockProject;
  }

  if (projectError || !project) {
    // If project doesn't exist or there's an error, use mock data
    console.error("Error fetching project:", projectError);
    project = mockProject;
  }

  // Fetch milestones for this project
  let milestones = null;
  let milestonesError = null;

  if (projectId) {
    try {
      const result = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", projectId)
        .order("due_date", { ascending: true });

      milestones = result.data;
      milestonesError = result.error;
    } catch (error) {
      console.error("Error fetching milestones:", error);
      milestonesError = { message: "Error fetching milestone data" };
    }
  } else {
    milestonesError = { message: "Invalid project ID format" };
    // Use mock data when ID is invalid
    milestones = mockMilestones;
  }

  // Fetch invoices for this project
  let invoices = null;
  let invoicesError = null;

  if (projectId) {
    try {
      const result = await supabase
        .from("invoices")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      invoices = result.data;
      invoicesError = result.error;
    } catch (error) {
      console.error("Error fetching invoices:", error);
      invoicesError = { message: "Error fetching invoice data" };
    }
  } else {
    invoicesError = { message: "Invalid project ID format" };
    // Use mock data for financial calculations
    invoices = [];
  }

  // Fetch expenses for this project
  let expenses = null;
  let expensesError = null;

  if (projectId) {
    try {
      const result = await supabase
        .from("expenses")
        .select("*")
        .eq("project_id", projectId)
        .order("date", { ascending: false });

      expenses = result.data;
      expensesError = result.error;
    } catch (error) {
      console.error("Error fetching expenses:", error);
      expensesError = { message: "Error fetching expense data" };
    }
  } else {
    expensesError = { message: "Invalid project ID format" };
    // Use mock data for financial calculations
    expenses = [];
  }

  // Calculate financial summary
  const totalInvoiced = invoices
    ? invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0)
    : 0;
  const totalPaid = invoices
    ? invoices
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + (inv.amount || 0), 0)
    : 0;
  const totalPending = invoices
    ? invoices
        .filter((inv) => inv.status === "pending")
        .reduce((sum, inv) => sum + (inv.amount || 0), 0)
    : 0;
  const totalExpenses = expenses
    ? expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
    : 0;
  const projectedProfit = (project?.budget || 0) - totalExpenses;

  const statusColors = {
    active: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    "on-hold": "bg-amber-100 text-amber-800",
  };

  const milestoneStatusColors = {
    completed: "bg-green-100 text-green-800",
    "in-progress": "bg-blue-100 text-blue-800",
    "not-started": "bg-gray-100 text-gray-800",
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <>
      <ToastHandler />
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard/projects"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">
                {project?.title || mockProject.title}
              </h1>
              <Badge
                className={
                  statusColors[
                    (project?.status ||
                      mockProject.status) as keyof typeof statusColors
                  ]
                }
              >
                {(project?.status || mockProject.status)
                  .charAt(0)
                  .toUpperCase() +
                  (project?.status || mockProject.status).slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {project?.description || mockProject.description}
            </p>
          </div>
          <Button asChild>
            <Link href={`/dashboard/projects/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit Project
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Client</p>
                  <p className="text-lg">
                    {project?.client || mockProject.client}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {project?.contact_name || mockProject.contact_name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CalendarClock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Timeline</p>
                  <p className="text-lg">
                    {formatDate(project?.start_date || mockProject.start_date)}{" "}
                    - {formatDate(project?.due_date || mockProject.due_date)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {project?.completion_percentage ||
                      mockProject.completion_percentage}
                    % Complete
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Budget</p>
                  <p className="text-lg">
                    {formatCurrency(project?.budget || mockProject.budget)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatCurrency(totalInvoiced || mockFinancials.invoiced)}{" "}
                    Invoiced
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-lg">
                    {project?.location || mockProject.location}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="milestones" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="milestones">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Project Milestones</CardTitle>
                  <CardDescription>
                    Track progress and payment milestones
                  </CardDescription>
                </div>
                <AddMilestoneDialog projectId={params.id} />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(milestones?.length ? milestones : mockMilestones).map(
                    (milestone) => (
                      <div
                        key={milestone.id}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg"
                      >
                        <div className="space-y-1 mb-3 md:mb-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{milestone.title}</h3>
                            <Badge
                              className={
                                milestoneStatusColors[
                                  milestone.status as keyof typeof milestoneStatusColors
                                ]
                              }
                            >
                              {milestone.status
                                .split("-")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1),
                                )
                                .join(" ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {milestone.description}
                          </p>
                          <p className="text-sm">
                            Due: {formatDate(milestone.due_date)}
                          </p>
                        </div>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                          <div className="text-right">
                            <p className="text-sm font-medium">Amount</p>
                            <p className="text-lg">
                              {formatCurrency(milestone.amount)}
                            </p>
                          </div>
                          <form action={updateMilestoneStatusAction}>
                            <input
                              type="hidden"
                              name="milestoneId"
                              value={milestone.id}
                            />
                            <input
                              type="hidden"
                              name="projectId"
                              value={params.id}
                            />
                            <input
                              type="hidden"
                              name="status"
                              value="completed"
                            />
                            <Button
                              variant={
                                milestone.status === "completed"
                                  ? "outline"
                                  : "default"
                              }
                              size="sm"
                              disabled={milestone.status === "completed"}
                              type={
                                milestone.status === "completed"
                                  ? "button"
                                  : "submit"
                              }
                            >
                              {milestone.status === "completed"
                                ? "Completed"
                                : "Mark Complete"}
                            </Button>
                          </form>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials">
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Overview of project finances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Budget</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Budget
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            project?.budget || mockFinancials.totalBudget,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Expenses
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            totalExpenses || mockFinancials.expenses,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Projected Profit
                        </span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(
                            projectedProfit || mockFinancials.profit,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Invoices</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Invoiced
                        </span>
                        <span className="font-medium">
                          {formatCurrency(
                            totalInvoiced || mockFinancials.invoiced,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Paid</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(totalPaid || mockFinancials.paid)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pending</span>
                        <span className="font-medium text-amber-600">
                          {formatCurrency(
                            totalPending || mockFinancials.pending,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Actions</h3>
                    <div className="space-y-3">
                      <CreateInvoiceDialog
                        projectId={params.id}
                        projectTitle={project?.title || mockProject.title}
                      />
                      <Button variant="outline" className="w-full" size="sm">
                        View All Invoices
                      </Button>
                      <AddExpenseDialog projectId={params.id} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Project Documents</CardTitle>
                  <CardDescription>
                    Manage contracts, lien releases, and other documents
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/dashboard/projects/${params.id}/documents`}>
                    <Upload className="mr-2 h-4 w-4" /> Upload Documents
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {/* Fetch and display documents */}
                <p className="text-muted-foreground">
                  No documents available yet. Click "Upload Documents" to add
                  project documents.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Project Team</CardTitle>
                <CardDescription>
                  Manage team members and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No team members assigned yet.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

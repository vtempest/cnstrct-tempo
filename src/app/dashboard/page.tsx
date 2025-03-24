import DashboardNavbar from "@/components/dashboard-navbar";
import { createClient } from "../../../supabase/server";
import {
  ArrowUpRight,
  CalendarClock,
  ClipboardList,
  DollarSign,
  FileText,
  InfoIcon,
  UserCircle,
} from "lucide-react";
import { redirect } from "next/navigation";
import { SubscriptionCheck } from "@/components/subscription-check";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProjectCard from "@/components/project-card";
import {
  fetchProjects,
  fetchProjectStats,
  fetchUpcomingMilestones,
  fetchPendingInvoices,
} from "./projects/fetch-projects";

// Fallback mock data for dashboard
const mockProjects = [
  {
    id: "1",
    title: "Downtown Office Renovation",
    client: "ABC Corporation",
    status: "active",
    due_date: "2023-12-15",
    budget: 250000,
    completion_percentage: 65,
  },
  {
    id: "2",
    title: "Riverside Apartments",
    client: "XYZ Development",
    status: "active",
    due_date: "2024-03-30",
    budget: 1200000,
    completion_percentage: 25,
  },
];

const mockMilestones = [
  {
    id: "m1",
    project_id: "1",
    projectTitle: "Downtown Office Renovation",
    title: "MEP Rough-in",
    due_date: "2023-10-15",
    amount: 60000,
  },
  {
    id: "m2",
    project_id: "2",
    projectTitle: "Riverside Apartments",
    title: "Foundation Complete",
    due_date: "2023-11-30",
    amount: 150000,
  },
  {
    id: "m3",
    project_id: "1",
    projectTitle: "Downtown Office Renovation",
    title: "Finishes",
    due_date: "2023-11-30",
    amount: 45000,
  },
];

const mockInvoices = [
  {
    id: "inv1",
    project_id: "1",
    projectTitle: "Downtown Office Renovation",
    amount: 50000,
    status: "paid",
    due_date: "2023-09-15",
  },
  {
    id: "inv2",
    project_id: "2",
    projectTitle: "Riverside Apartments",
    amount: 75000,
    status: "pending",
    due_date: "2023-10-30",
  },
];

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch real data from Supabase
  let projects = [];
  let stats = {
    activeProjects: 0,
    totalRevenue: 0,
    upcomingMilestones: 0,
    pendingInvoices: 0,
  };
  let upcomingMilestones = [];
  let pendingInvoices = [];

  try {
    projects = await fetchProjects(user.id);
    stats = await fetchProjectStats(user.id);
    upcomingMilestones = await fetchUpcomingMilestones(user.id);
    pendingInvoices = await fetchPendingInvoices(user.id);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Will use mock data if there's an error
  }

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
    <SubscriptionCheck>
      <DashboardNavbar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          {/* Header Section */}
          <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {user.user_metadata?.full_name || user.email}
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/projects/new">Create New Project</Link>
            </Button>
          </header>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-md">
                    <ClipboardList className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Active Projects
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.activeProjects || 2}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-md">
                    <DollarSign className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(stats.totalRevenue || 125000)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-md">
                    <CalendarClock className="h-5 w-5 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Upcoming Milestones
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.upcomingMilestones || 3}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-md">
                    <FileText className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Pending Invoices
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(stats.pendingInvoices || 75000)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>
                  Your most recent construction projects
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/projects">
                  View All
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(projects.length ? projects : mockProjects)
                  .slice(0, 2)
                  .map((project) => (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      title={project.title}
                      client={project.client}
                      status={
                        project.status as "active" | "completed" | "on-hold"
                      }
                      dueDate={project.due_date}
                      budget={project.budget}
                      completionPercentage={project.completion_percentage}
                    />
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Milestones and Pending Invoices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Milestones</CardTitle>
                <CardDescription>
                  Milestones due in the next 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(upcomingMilestones.length
                    ? upcomingMilestones
                    : mockMilestones
                  ).map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex justify-between items-center p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {milestone.projectTitle}
                        </p>
                        <p className="text-sm">
                          Due: {formatDate(milestone.due_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(milestone.amount)}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="mt-2"
                        >
                          <Link
                            href={`/dashboard/projects/${milestone.project_id}`}
                          >
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Invoices</CardTitle>
                <CardDescription>Invoices awaiting payment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(pendingInvoices.length
                    ? pendingInvoices
                    : mockInvoices.filter((inv) => inv.status === "pending")
                  ).map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex justify-between items-center p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">Invoice #{invoice.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {invoice.projectTitle}
                        </p>
                        <p className="text-sm">
                          Due: {formatDate(invoice.due_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(invoice.amount)}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="mt-2"
                        >
                          <Link
                            href={`/dashboard/projects/${invoice.project_id}`}
                          >
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </SubscriptionCheck>
  );
}

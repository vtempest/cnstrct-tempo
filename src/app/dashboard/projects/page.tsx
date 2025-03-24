import DashboardNavbar from "@/components/dashboard-navbar";
import ProjectCard from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { fetchProjects } from "./fetch-projects";

// Mock data for projects - will be replaced with actual data from Supabase
const mockProjects = [
  {
    id: "1",
    title: "Downtown Office Renovation",
    client: "ABC Corporation",
    status: "active",
    dueDate: "2023-12-15",
    budget: 250000,
    completionPercentage: 65,
  },
  {
    id: "2",
    title: "Riverside Apartments",
    client: "XYZ Development",
    status: "active",
    dueDate: "2024-03-30",
    budget: 1200000,
    completionPercentage: 25,
  },
  {
    id: "3",
    title: "Main Street Retail Buildout",
    client: "Retail Partners LLC",
    status: "on-hold",
    dueDate: "2023-11-01",
    budget: 175000,
    completionPercentage: 40,
  },
  {
    id: "4",
    title: "Community Center Remodel",
    client: "City of Springfield",
    status: "completed",
    dueDate: "2023-08-15",
    budget: 350000,
    completionPercentage: 100,
  },
];

export default async function ProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch projects from Supabase
  const projects = await fetchProjects(user.id);

  return (
    <>
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Projects</h1>
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Link>
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search projects..." className="pl-10" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(projects.length ? projects : mockProjects).map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              title={project.title}
              client={project.client}
              status={project.status as "active" | "completed" | "on-hold"}
              dueDate={project.due_date}
              budget={project.budget}
              completionPercentage={project.completion_percentage}
            />
          ))}
        </div>
      </main>
    </>
  );
}

import { createClient } from "../../../../supabase/server";

export async function fetchProjects(userId: string) {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return projects;
}

export async function fetchProjectStats(userId: string) {
  const supabase = await createClient();

  // Get all projects
  const { data: projects } = await supabase
    .from("projects")
    .select("id, status")
    .eq("user_id", userId);

  // Count active projects
  const activeProjects =
    projects?.filter((p) => p.status === "active").length || 0;

  // Get all invoices for user's projects
  const { data: invoices } = await supabase
    .from("invoices")
    .select("amount, status, project_id")
    .in("project_id", projects?.map((p) => p.id) || []);

  // Calculate total revenue (paid invoices)
  const totalRevenue =
    invoices
      ?.filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

  // Calculate pending invoices amount
  const pendingInvoices =
    invoices
      ?.filter((inv) => inv.status === "pending")
      .reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

  // Get upcoming milestones
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const { data: milestones } = await supabase
    .from("milestones")
    .select("id")
    .in("project_id", projects?.map((p) => p.id) || [])
    .lt("due_date", thirtyDaysFromNow.toISOString())
    .gt("due_date", today.toISOString())
    .eq("status", "not-started");

  const upcomingMilestones = milestones?.length || 0;

  return {
    activeProjects,
    totalRevenue,
    upcomingMilestones,
    pendingInvoices,
  };
}

export async function fetchUpcomingMilestones(userId: string, limit = 3) {
  const supabase = await createClient();

  // Get all projects for user
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title")
    .eq("user_id", userId);

  if (!projects || projects.length === 0) {
    return [];
  }

  // Get upcoming milestones
  const today = new Date();
  const { data: milestones, error } = await supabase
    .from("milestones")
    .select("*, project_id")
    .in(
      "project_id",
      projects.map((p) => p.id),
    )
    .gt("due_date", today.toISOString())
    .not("status", "eq", "completed")
    .order("due_date", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching milestones:", error);
    return [];
  }

  // Add project title to each milestone
  return milestones.map((milestone) => {
    const project = projects.find((p) => p.id === milestone.project_id);
    return {
      ...milestone,
      projectTitle: project?.title || "Unknown Project",
    };
  });
}

export async function fetchPendingInvoices(userId: string, limit = 3) {
  const supabase = await createClient();

  // Get all projects for user
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title")
    .eq("user_id", userId);

  if (!projects || projects.length === 0) {
    return [];
  }

  // Get pending invoices
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("*, project_id")
    .in(
      "project_id",
      projects.map((p) => p.id),
    )
    .eq("status", "pending")
    .order("due_date", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }

  // Add project title to each invoice
  return invoices.map((invoice) => {
    const project = projects.find((p) => p.id === invoice.project_id);
    return {
      ...invoice,
      projectTitle: project?.title || "Unknown Project",
    };
  });
}

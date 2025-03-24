import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import { ArrowUpRight, Check, Clock, DollarSign, FileText, Search, X } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default async function InvoicesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get all projects for user
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title')
    .eq('user_id', user.id);
    
  if (!projects || projects.length === 0) {
    return (
      <>
        <DashboardNavbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Invoices</h1>
          </div>
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No projects found. Create a project first to manage invoices.</p>
            <Button asChild>
              <Link href="/dashboard/projects/new">Create Project</Link>
            </Button>
          </Card>
        </main>
      </>
    );
  }
  
  // Get all invoices for user's projects
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .in('project_id', projects.map(p => p.id))
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching invoices:", error);
  }
  
  // Add project title to each invoice
  const invoicesWithProjectTitle = invoices?.map(invoice => {
    const project = projects.find(p => p.id === invoice.project_id);
    return {
      ...invoice,
      projectTitle: project?.title || 'Unknown Project'
    };
  }) || [];
  
  // Calculate totals
  const totalInvoiced = invoicesWithProjectTitle.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalPaid = invoicesWithProjectTitle.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalPending = invoicesWithProjectTitle.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const totalOverdue = invoicesWithProjectTitle.filter(inv => {
    return inv.status === 'pending' && new Date(inv.due_date) < new Date();
  }).reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = status === 'pending' && new Date(dueDate) < new Date();
    
    if (isOverdue) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    }
    
    if (status === 'paid') {
      return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
    }
    
    return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
  };

  return (
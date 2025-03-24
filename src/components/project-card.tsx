import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarClock, DollarSign, FileText, Users } from "lucide-react";
import Link from "next/link";

type ProjectStatus = "active" | "completed" | "on-hold";

interface ProjectCardProps {
  id: string;
  title: string;
  client: string;
  status: ProjectStatus;
  dueDate: string;
  budget: number;
  completionPercentage: number;
}

export default function ProjectCard({
  id,
  title,
  client,
  status,
  dueDate,
  budget,
  completionPercentage = 0,
}: ProjectCardProps) {
  const statusColors = {
    active: "bg-green-100 text-green-800",
    completed: "bg-blue-100 text-blue-800",
    "on-hold": "bg-amber-100 text-amber-800",
  };

  const formattedBudget = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(budget);

  const formattedDate = new Date(dueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="mt-1">{client}</CardDescription>
          </div>
          <Badge className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-medium">{completionPercentage}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Project details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-gray-500" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span>{formattedBudget}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/projects/${id}/documents`}>
              <FileText className="h-4 w-4 mr-1" />
              Docs
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/projects/${id}/team`}>
              <Users className="h-4 w-4 mr-1" />
              Team
            </Link>
          </Button>
        </div>
        <Button size="sm" asChild>
          <Link href={`/dashboard/projects/${id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

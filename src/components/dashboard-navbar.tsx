"use client";

import Link from "next/link";
import { createClient } from "../../supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  UserCircle,
  Home,
  ClipboardList,
  DollarSign,
  FileText,
  Settings,
  HardHat,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardNavbar() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <nav className="w-full border-b border-gray-200 bg-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" prefetch className="flex items-center gap-2">
            <HardHat className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">ConstructFlow</span>
          </Link>
          <div className="hidden md:flex items-center space-x-1 ml-6">
            <Button
              variant={
                isActive("/dashboard") &&
                !isActive("/dashboard/projects") &&
                !isActive("/dashboard/invoices")
                  ? "default"
                  : "ghost"
              }
              size="sm"
              asChild
            >
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button
              variant={isActive("/dashboard/projects") ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link href="/dashboard/projects">
                <ClipboardList className="h-4 w-4 mr-2" />
                Projects
              </Link>
            </Button>
            <Button
              variant={isActive("/dashboard/invoices") ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link href="/dashboard/invoices">
                <DollarSign className="h-4 w-4 mr-2" />
                Finances
              </Link>
            </Button>
            <Button
              variant={isActive("/dashboard/documents") ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link href="/dashboard/documents">
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/settings">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/");
                }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}

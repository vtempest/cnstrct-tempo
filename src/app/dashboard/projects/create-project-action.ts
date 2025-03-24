"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "../../../../supabase/server";

export const createProjectAction = async (formData: FormData) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "You must be signed in",
      redirect: "/sign-in",
    };
  }

  const title = formData.get("title")?.toString();
  const client = formData.get("client")?.toString();
  const status = formData.get("status")?.toString() || "active";
  const startDate = formData.get("startDate")?.toString();
  const dueDate = formData.get("dueDate")?.toString();
  const budget = formData.get("budget")?.toString();
  const location = formData.get("location")?.toString();
  const description = formData.get("description")?.toString();
  const contactName = formData.get("contactName")?.toString();
  const contactEmail = formData.get("contactEmail")?.toString();
  const contactPhone = formData.get("contactPhone")?.toString();

  if (!title || !client) {
    return {
      success: false,
      message: "Title and client are required",
      redirect: "/dashboard/projects/new",
    };
  }

  try {
    // Remove the delay as it's not needed and may cause issues with the redirect
    // await new Promise((resolve) => setTimeout(resolve, 500));

    // First check if the contact columns exist in the schema
    const { data: columnsData, error: columnsError } = await supabase
      .from("projects")
      .select()
      .limit(1);

    if (columnsError) {
      console.error("Error checking schema:", columnsError);
      return {
        success: false,
        message: `Error checking schema: ${columnsError.message}`,
        redirect: "/dashboard/projects/new",
      };
    }

    // Create a base project object
    const projectData = {
      title,
      client,
      status,
      due_date: dueDate,
      budget: budget ? parseFloat(budget) : null,
      description,
      user_id: user.id,
      completion_percentage: 0,
    };

    // Only add optional fields if they exist in the schema
    // We'll check the first row's keys to determine available columns
    const availableColumns =
      columnsData && columnsData.length > 0 ? Object.keys(columnsData[0]) : [];

    if (startDate && availableColumns.includes("start_date")) {
      projectData.start_date = startDate;
    }

    if (location && availableColumns.includes("location")) {
      projectData.location = location;
    }

    if (contactName && availableColumns.includes("contact_name")) {
      projectData.contact_name = contactName;
    }

    if (contactEmail && availableColumns.includes("contact_email")) {
      projectData.contact_email = contactEmail;
    }

    if (contactPhone && availableColumns.includes("contact_phone")) {
      projectData.contact_phone = contactPhone;
    }

    const { data, error } = await supabase
      .from("projects")
      .insert(projectData)
      .select();

    if (error) {
      console.error("Error creating project:", error);
      return {
        success: false,
        message: `Error creating project: ${error.message}`,
        redirect: "/dashboard/projects/new",
      };
    }

    if (!data || data.length === 0) {
      console.error("No data returned after project creation");
      return {
        success: false,
        message: "Error creating project: No data returned",
        redirect: "/dashboard/projects/new",
      };
    }

    const projectId = data[0].id;
    // We'll redirect to the project page, which will show a success toast
    return {
      success: true,
      message: "Project created successfully",
      redirect: `/dashboard/projects/${projectId}`,
    };
  } catch (error: any) {
    console.error("Exception creating project:", error);
    return {
      success: false,
      message: `Error creating project: ${error.message}`,
      redirect: "/dashboard/projects/new",
    };
  }
};

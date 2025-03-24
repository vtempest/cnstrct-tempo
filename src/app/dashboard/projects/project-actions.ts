"use server";

import { encodedRedirect } from "@/utils/utils";
import { redirect } from "next/navigation";
import { createClient } from "../../../../supabase/server";

export const addMilestoneAction = async (formData: FormData) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return encodedRedirect("error", "/sign-in", "You must be signed in");
  }

  const projectId = formData.get("projectId")?.toString();
  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();
  const dueDate = formData.get("dueDate")?.toString();
  const amount = formData.get("amount")?.toString();
  const status = formData.get("status")?.toString() || "not-started";

  if (!projectId || !title || !dueDate || !amount) {
    return encodedRedirect(
      "error",
      `/dashboard/projects/${projectId}`,
      "Title, due date, and amount are required",
    );
  }

  try {
    const { error } = await supabase.from("milestones").insert({
      project_id: projectId,
      title,
      description,
      due_date: dueDate,
      amount: parseFloat(amount),
      status,
    });

    if (error) {
      return encodedRedirect(
        "error",
        `/dashboard/projects/${projectId}`,
        `Error creating milestone: ${error.message}`,
      );
    }

    return encodedRedirect(
      "success",
      `/dashboard/projects/${projectId}`,
      "Milestone created successfully",
    );
  } catch (error: any) {
    return encodedRedirect(
      "error",
      `/dashboard/projects/${projectId}`,
      `Error creating milestone: ${error.message}`,
    );
  }
};

export const updateMilestoneStatusAction = async (formData: FormData) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return encodedRedirect("error", "/sign-in", "You must be signed in");
  }

  const milestoneId = formData.get("milestoneId")?.toString();
  const projectId = formData.get("projectId")?.toString();
  const status = formData.get("status")?.toString() || "completed";

  if (!milestoneId || !projectId) {
    return encodedRedirect(
      "error",
      `/dashboard/projects/${projectId}`,
      "Milestone ID is required",
    );
  }

  try {
    const { error } = await supabase
      .from("milestones")
      .update({ status })
      .eq("id", milestoneId);

    if (error) {
      return encodedRedirect(
        "error",
        `/dashboard/projects/${projectId}`,
        `Error updating milestone: ${error.message}`,
      );
    }

    // If milestone is completed, create an invoice
    if (status === "completed") {
      const { data: milestone } = await supabase
        .from("milestones")
        .select("*")
        .eq("id", milestoneId)
        .single();

      if (milestone) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days

        const { data: projectData } = await supabase
          .from("projects")
          .select("title")
          .eq("id", projectId)
          .single();

        const invoiceNumber = `INV-${Date.now().toString().substring(7)}`;

        await supabase.from("invoices").insert({
          project_id: projectId,
          milestone_id: milestoneId,
          amount: milestone.amount,
          status: "pending",
          due_date: dueDate.toISOString(),
          invoice_number: invoiceNumber,
          notes: `Invoice for milestone: ${milestone.title} - Project: ${projectData?.title || "Unknown project"}`,
        });
      }
    }

    return encodedRedirect(
      "success",
      `/dashboard/projects/${projectId}`,
      `Milestone marked as ${status}`,
    );
  } catch (error: any) {
    return encodedRedirect(
      "error",
      `/dashboard/projects/${projectId}`,
      `Error updating milestone: ${error.message}`,
    );
  }
};

export const createInvoiceAction = async (formData: FormData) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return encodedRedirect("error", "/sign-in", "You must be signed in");
  }

  const projectId = formData.get("projectId")?.toString();
  const amount = formData.get("amount")?.toString();
  const dueDate = formData.get("dueDate")?.toString();
  const notes = formData.get("notes")?.toString();

  if (!projectId || !amount || !dueDate) {
    return encodedRedirect(
      "error",
      `/dashboard/projects/${projectId}`,
      "Project ID, amount, and due date are required",
    );
  }

  try {
    const invoiceNumber = `INV-${Date.now().toString().substring(7)}`;

    const { error } = await supabase.from("invoices").insert({
      project_id: projectId,
      amount: parseFloat(amount),
      status: "pending",
      due_date: dueDate,
      invoice_number: invoiceNumber,
      notes,
    });

    if (error) {
      return encodedRedirect(
        "error",
        `/dashboard/projects/${projectId}`,
        `Error creating invoice: ${error.message}`,
      );
    }

    return encodedRedirect(
      "success",
      `/dashboard/projects/${projectId}`,
      "Invoice created successfully",
    );
  } catch (error: any) {
    return encodedRedirect(
      "error",
      `/dashboard/projects/${projectId}`,
      `Error creating invoice: ${error.message}`,
    );
  }
};

export const addExpenseAction = async (formData: FormData) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return encodedRedirect("error", "/sign-in", "You must be signed in");
  }

  const projectId = formData.get("projectId")?.toString();
  const amount = formData.get("amount")?.toString();
  const description = formData.get("description")?.toString();
  const category = formData.get("category")?.toString();
  const date = formData.get("date")?.toString() || new Date().toISOString();

  if (!projectId || !amount || !description) {
    return encodedRedirect(
      "error",
      `/dashboard/projects/${projectId}`,
      "Project ID, amount, and description are required",
    );
  }

  try {
    const { error } = await supabase.from("expenses").insert({
      project_id: projectId,
      amount: parseFloat(amount),
      description,
      category,
      date,
    });

    if (error) {
      return encodedRedirect(
        "error",
        `/dashboard/projects/${projectId}`,
        `Error adding expense: ${error.message}`,
      );
    }

    return encodedRedirect(
      "success",
      `/dashboard/projects/${projectId}`,
      "Expense added successfully",
    );
  } catch (error: any) {
    return encodedRedirect(
      "error",
      `/dashboard/projects/${projectId}`,
      `Error adding expense: ${error.message}`,
    );
  }
};

export const uploadDocumentAction = async (formData: FormData) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return encodedRedirect("error", "/sign-in", "You must be signed in");
  }

  const projectId = formData.get("projectId")?.toString();
  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();
  const category = formData.get("category")?.toString();
  const file = formData.get("file") as File;

  if (!projectId || !title || !file) {
    return encodedRedirect(
      "error",
      `/dashboard/projects/${projectId}/documents`,
      "Project ID, title, and file are required",
    );
  }

  try {
    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${projectId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) {
      return encodedRedirect(
        "error",
        `/dashboard/projects/${projectId}/documents`,
        `Error uploading file: ${uploadError.message}`,
      );
    }

    // Get public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(filePath);

    // Insert document record in the database
    const { error: dbError } = await supabase.from("documents").insert({
      project_id: projectId,
      title,
      description,
      category,
      file_path: filePath,
      file_url: publicUrl,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
    });

    if (dbError) {
      return encodedRedirect(
        "error",
        `/dashboard/projects/${projectId}/documents`,
        `Error saving document: ${dbError.message}`,
      );
    }

    return encodedRedirect(
      "success",
      `/dashboard/projects/${projectId}/documents`,
      "Document uploaded successfully",
    );
  } catch (error: any) {
    return encodedRedirect(
      "error",
      `/dashboard/projects/${projectId}/documents`,
      `Error uploading document: ${error.message}`,
    );
  }
};

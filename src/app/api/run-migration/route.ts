import { createClient } from "../../../../supabase/server";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { migrationFile } = await request.json();

    if (!migrationFile) {
      return NextResponse.json(
        { error: "Migration file path is required" },
        { status: 400 },
      );
    }

    // Validate the migration file path to prevent directory traversal
    const normalizedPath = path.normalize(migrationFile);
    if (normalizedPath.includes("..")) {
      return NextResponse.json(
        { error: "Invalid migration file path" },
        { status: 400 },
      );
    }

    const fullPath = path.join(process.cwd(), normalizedPath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: "Migration file not found" },
        { status: 404 },
      );
    }

    // Read the SQL content
    const sqlContent = fs.readFileSync(fullPath, "utf8");

    // Instead of using pgrest_exec, we'll parse the SQL and execute direct operations
    // This is a simplified approach that works for basic column additions
    const supabase = await createClient();

    // For this implementation, we'll focus on handling the add_contact_fields migration
    // which adds contact_name, contact_email, and contact_phone columns

    if (migrationFile.includes("add_contact_fields")) {
      // Try to directly execute the SQL from the migration file
      const { error: sqlError } = await supabase.rpc("pgrest_exec", {
        query: sqlContent,
      });

      if (sqlError) {
        console.log(
          "Direct SQL execution failed, trying fallback method:",
          sqlError,
        );

        // Check if the columns exist by trying to select them
        const { error: checkError } = await supabase
          .from("projects")
          .select("contact_name, contact_email, contact_phone")
          .limit(1);

        if (checkError) {
          console.log("Columns may be missing, attempting to add them");

          // Try to add columns directly using SQL
          const { error: alterError } = await supabase.rpc("pgrest_exec", {
            query: `
              ALTER TABLE projects ADD COLUMN IF NOT EXISTS contact_name TEXT;
              ALTER TABLE projects ADD COLUMN IF NOT EXISTS contact_email TEXT;
              ALTER TABLE projects ADD COLUMN IF NOT EXISTS contact_phone TEXT;
            `,
          });

          if (alterError) {
            console.log(
              "Direct SQL alter failed, trying fallback method:",
              alterError,
            );

            // Get the first project ID to update (or use a dummy ID if none exists)
            const { data: projectData } = await supabase
              .from("projects")
              .select("id")
              .limit(1);

            if (projectData && projectData.length > 0) {
              // Update an existing project to ensure columns are created - one column at a time
              const { error: updateError1 } = await supabase
                .from("projects")
                .update({ contact_name: null })
                .eq("id", projectData[0].id);

              if (updateError1) {
                console.error(
                  "Error updating project with contact_name column:",
                  updateError1,
                );
                return NextResponse.json(
                  { error: updateError1.message },
                  { status: 500 },
                );
              }

              const { error: updateError2 } = await supabase
                .from("projects")
                .update({ contact_email: null })
                .eq("id", projectData[0].id);

              if (updateError2) {
                console.error(
                  "Error updating project with contact_email column:",
                  updateError2,
                );
                return NextResponse.json(
                  { error: updateError2.message },
                  { status: 500 },
                );
              }

              const { error: updateError3 } = await supabase
                .from("projects")
                .update({ contact_phone: null })
                .eq("id", projectData[0].id);

              if (updateError3) {
                console.error(
                  "Error updating project with contact_phone column:",
                  updateError3,
                );
                return NextResponse.json(
                  { error: updateError3.message },
                  { status: 500 },
                );
              }
            } else {
              // If no projects exist, we'll create a temporary one and then delete it
              // First create without the contact fields
              const { data: insertData, error: insertError } = await supabase
                .from("projects")
                .insert({
                  title: "Temporary Project For Schema Update",
                  user_id: "00000000-0000-0000-0000-000000000000",
                  status: "active",
                })
                .select();

              if (insertError) {
                console.error("Error creating temporary project:", insertError);
                return NextResponse.json(
                  { error: insertError.message },
                  { status: 500 },
                );
              }

              // Now try to update the temporary project with the contact fields one at a time
              if (insertData && insertData.length > 0) {
                const { error: updateError1 } = await supabase
                  .from("projects")
                  .update({ contact_name: null })
                  .eq("id", insertData[0].id);

                if (updateError1) {
                  // Delete the temporary project
                  await supabase
                    .from("projects")
                    .delete()
                    .eq("id", insertData[0].id);
                  console.error(
                    "Error updating temporary project with contact_name:",
                    updateError1,
                  );
                  return NextResponse.json(
                    { error: updateError1.message },
                    { status: 500 },
                  );
                }

                const { error: updateError2 } = await supabase
                  .from("projects")
                  .update({ contact_email: null })
                  .eq("id", insertData[0].id);

                if (updateError2) {
                  // Delete the temporary project
                  await supabase
                    .from("projects")
                    .delete()
                    .eq("id", insertData[0].id);
                  console.error(
                    "Error updating temporary project with contact_email:",
                    updateError2,
                  );
                  return NextResponse.json(
                    { error: updateError2.message },
                    { status: 500 },
                  );
                }

                const { error: updateError3 } = await supabase
                  .from("projects")
                  .update({ contact_phone: null })
                  .eq("id", insertData[0].id);

                // Delete the temporary project
                await supabase
                  .from("projects")
                  .delete()
                  .eq("id", insertData[0].id);

                if (updateError3) {
                  console.error(
                    "Error updating temporary project with contact_phone:",
                    updateError3,
                  );
                  return NextResponse.json(
                    { error: updateError3.message },
                    { status: 500 },
                  );
                }
              }
            }
          }
        }
      }

      // Verify the columns now exist
      const { data: verifyData, error: verifyError } = await supabase
        .from("projects")
        .select("contact_name, contact_email, contact_phone")
        .limit(1);

      if (verifyError) {
        console.error(
          "Verification failed, columns may not have been added:",
          verifyError,
        );
        return NextResponse.json(
          { error: verifyError.message },
          { status: 500 },
        );
      }

      return NextResponse.json({
        message: "Migration executed successfully",
        columns: ["contact_name", "contact_email", "contact_phone"],
      });
    } else {
      // For other migrations, return a message that they need to be handled differently
      return NextResponse.json(
        {
          message:
            "This migration type is not supported through this API. Please use the Supabase dashboard or CLI to run complex migrations.",
          migrationFile,
        },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error("Error running migration:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

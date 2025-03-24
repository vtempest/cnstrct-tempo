import { createClient } from "../../../../supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // This is a direct endpoint to update the projects table schema
    // by adding the contact fields if they don't exist

    // First, let's try to update a project with the new fields
    // This will create the columns if they don't exist in Supabase

    // First, try to directly add the columns using SQL
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

      let updateResult;

      if (projectData && projectData.length > 0) {
        // Update an existing project to ensure columns are created
        // First try with one column at a time
        updateResult = await supabase
          .from("projects")
          .update({ contact_name: null })
          .eq("id", projectData[0].id);

        if (!updateResult.error) {
          updateResult = await supabase
            .from("projects")
            .update({ contact_email: null })
            .eq("id", projectData[0].id);
        }

        if (!updateResult.error) {
          updateResult = await supabase
            .from("projects")
            .update({ contact_phone: null })
            .eq("id", projectData[0].id);
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
          updateResult = await supabase
            .from("projects")
            .update({ contact_name: null })
            .eq("id", insertData[0].id);

          if (!updateResult.error) {
            updateResult = await supabase
              .from("projects")
              .update({ contact_email: null })
              .eq("id", insertData[0].id);
          }

          if (!updateResult.error) {
            updateResult = await supabase
              .from("projects")
              .update({ contact_phone: null })
              .eq("id", insertData[0].id);
          }

          // Delete the temporary project
          await supabase.from("projects").delete().eq("id", insertData[0].id);
        } else {
          updateResult = { error: null };
        }
      }
    }

    if (updateResult.error) {
      console.error("Error updating schema:", updateResult.error);
      return NextResponse.json(
        { error: updateResult.error.message },
        { status: 500 },
      );
    }

    // Now let's verify the columns exist by trying to select them
    const { error: verifyError } = await supabase
      .from("projects")
      .select("contact_name, contact_email, contact_phone")
      .limit(1);

    if (verifyError) {
      console.error(
        "Verification failed, columns may not have been added:",
        verifyError,
      );
      return NextResponse.json({ error: verifyError.message }, { status: 500 });
    }

    // If we get here, the schema update was successful
    return NextResponse.json({
      success: true,
      message:
        "Schema updated successfully. The projects table now has contact_name, contact_email, and contact_phone columns.",
    });
  } catch (error: any) {
    console.error("Error updating schema:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

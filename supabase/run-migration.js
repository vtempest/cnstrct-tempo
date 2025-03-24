const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Get migration file path from command line arguments
const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error("Please provide a migration file path");
  process.exit(1);
}

// Read the SQL from the migration file
const sqlContent = fs.readFileSync(
  path.resolve(process.cwd(), migrationFile),
  "utf8",
);

// Create Supabase client using environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  try {
    console.log(`Running migration: ${migrationFile}`);
    console.log("SQL to execute:", sqlContent);

    // Execute the SQL using Supabase's REST API
    const { data, error } = await supabase.rpc("pgrest_exec", {
      query: sqlContent,
    });

    if (error) {
      console.error("Migration failed:", error);
      process.exit(1);
    }

    console.log("Migration completed successfully");
    console.log("Result:", data);
  } catch (err) {
    console.error("Error running migration:", err);
    process.exit(1);
  }
}

runMigration();

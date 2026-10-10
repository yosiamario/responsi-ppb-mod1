const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ SUPABASE_URL dan SUPABASE_KEY wajib diisi di environment variables!");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;

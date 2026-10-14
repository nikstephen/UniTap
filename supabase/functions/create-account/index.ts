import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type CreateAccountRequest = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  student_number?: string;
  role: "student" | "csg_officer" | "csg_admin" | "csg_administrator";
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS")
    return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST")
    return jsonResponse({ error: "Method not allowed." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = request.headers.get("Authorization");
  if (!supabaseUrl || !anonKey || !serviceRoleKey || !authorization)
    return jsonResponse({ error: "Function is not configured." }, 500);

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const {
    data: { user: caller },
    error: callerError,
  } = await callerClient.auth.getUser();
  if (callerError || !caller)
    return jsonResponse({ error: "Authentication required." }, 401);

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: callerRoles, error: roleError } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", caller.id);
  if (roleError) return jsonResponse({ error: roleError.message }, 500);
  if (!(callerRoles ?? []).some((item) => item.role === "csg_admin"))
    return jsonResponse({ error: "Administrator access required." }, 403);

  let input: CreateAccountRequest;
  try {
    input = await request.json();
  } catch {
    return jsonResponse({ error: "Request body must be valid JSON." }, 400);
  }

  const email = input.email?.trim().toLowerCase();
  const firstName = input.first_name?.trim();
  const lastName = input.last_name?.trim();
  const role = input.role === "csg_administrator" ? "csg_admin" : input.role;
  const allowedRoles = ["student", "csg_officer", "csg_admin"];
  if (
    !email ||
    !input.password ||
    input.password.length < 8 ||
    !firstName ||
    !lastName ||
    !allowedRoles.includes(role) ||
    (role === "student" && !input.student_number?.trim())
  )
    return jsonResponse({ error: "Account fields are invalid or incomplete." }, 400);

  const { data: created, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName },
    });
  if (createError || !created.user)
    return jsonResponse({ error: createError?.message ?? "Unable to create account." }, 400);

  const userId = created.user.id;
  const { error: profileError } = await adminClient.from("profiles").insert({
    id: userId,
    student_number: input.student_number?.trim() || null,
    first_name: firstName,
    last_name: lastName,
    email,
    is_active: true,
  });
  if (profileError) {
    await adminClient.auth.admin.deleteUser(userId);
    return jsonResponse({ error: profileError.message }, 400);
  }

  const { error: newRoleError } = await adminClient.from("user_roles").insert({
    user_id: userId,
    role,
  });
  if (newRoleError) {
    await adminClient.from("profiles").delete().eq("id", userId);
    await adminClient.auth.admin.deleteUser(userId);
    return jsonResponse({ error: newRoleError.message }, 400);
  }

  await adminClient.from("system_audit_logs").insert({
    user_id: caller.id,
    action: "account_created",
    details: { created_user_id: userId, role, email },
  });

  return jsonResponse({ user_id: userId, email, role }, 201);
});

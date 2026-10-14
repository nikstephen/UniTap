import { supabase } from "../lib/supabase";
import type { RoleId, User } from "../types/models";

export interface CreateAccountInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  studentNumber?: string;
  role: RoleId;
}

export async function createSupabaseAccount(
  input: CreateAccountInput,
): Promise<void> {
  const { data, error } = await supabase.functions.invoke("create-account", {
    body: {
      email: input.email,
      password: input.password,
      first_name: input.firstName,
      last_name: input.lastName,
      student_number: input.studentNumber || undefined,
      role: input.role,
    },
  });
  if (error) throw error;
  if (data?.error) throw new Error(String(data.error));
}

const mapRole = (role: string): RoleId | null => {
  if (role === "student" || role === "csg_officer") return role;
  if (role === "csg_admin" || role === "csg_administrator")
    return "csg_administrator";
  return null;
};

export async function getAdminAccounts(): Promise<User[]> {
  const [profilesResult, rolesResult] = await Promise.all([
    supabase.from("profiles").select("id, email, is_active, created_at"),
    supabase.from("user_roles").select("user_id, role"),
  ]);
  if (profilesResult.error) throw profilesResult.error;
  if (rolesResult.error) throw rolesResult.error;
  const rolesByUser = new Map<string, RoleId[]>();
  for (const item of rolesResult.data ?? []) {
    if (!item.user_id) continue;
    const role = mapRole(String(item.role));
    if (!role) continue;
    rolesByUser.set(item.user_id, [...(rolesByUser.get(item.user_id) ?? []), role]);
  }
  return (profilesResult.data ?? []).map((profile) => ({
    id: profile.id,
    username: profile.email,
    email: profile.email,
    demoPassword: "",
    roles: rolesByUser.get(profile.id) ?? [],
    status: profile.is_active ? "active" : "inactive",
    createdAt: profile.created_at ?? new Date().toISOString(),
    updatedAt: profile.created_at ?? new Date().toISOString(),
  }));
}

export async function setAccountActive(
  userId: string,
  isActive: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId);
  if (error) throw error;
}

import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { createId, getRecords, saveRecords } from "./storageService";
import type { DemoSession, RoleId, User } from "../types/models";
import type {
  AcademicTerm,
  AuthorizedDevice,
  Section,
  StudentProfile,
  StudentSectionAssignment,
} from "../types/models";

const sessionKey = "unitap_session";
type LoginResult = { session?: DemoSession; error?: string };

const toRoleId = (role: string): RoleId | null => {
  if (role === "student" || role === "csg_officer") return role;
  if (role === "csg_admin" || role === "csg_administrator")
    return "csg_administrator";
  return null;
};

async function hydrateSupabaseCache(userId: string): Promise<DemoSession> {
  const [profileResult, rolesResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);
  if (profileResult.error) throw profileResult.error;
  if (rolesResult.error) throw rolesResult.error;

  const profile = profileResult.data as {
    id: string;
    student_number: string | null;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
    created_at: string;
  };
  if (!profile.is_active)
    throw new Error("This account is inactive. Contact a CSG administrator.");
  const roles = (rolesResult.data ?? [])
    .map((item) => toRoleId(String(item.role)))
    .filter((role): role is RoleId => role !== null);
  if (roles.length === 0)
    throw new Error("No application role is assigned to this account.");

  const canViewAllStudents = roles.some(
    (role) => role === "csg_officer" || role === "csg_administrator",
  );
  const historyQuery = supabase
    .from("student_section_history")
    .select("*");
  const devicesQuery = supabase.from("authorized_devices").select("*");
  if (!canViewAllStudents) historyQuery.eq("student_id", userId);
  if (!roles.includes("csg_administrator"))
    devicesQuery.eq("officer_id", userId);
  const [termsResult, sectionsResult, historyResult, devicesResult] =
    await Promise.all([
      supabase.from("academic_terms").select("*"),
      supabase.from("sections").select("*"),
      historyQuery,
      devicesQuery,
    ]);
  const queryError =
    termsResult.error ??
    sectionsResult.error ??
    historyResult.error ??
    devicesResult.error;
  if (queryError) throw queryError;

  const terms = (termsResult.data ?? []) as Array<{
    id: string;
    school_year: string;
    semester: string;
    is_current: boolean;
  }>;
  const sections = (sectionsResult.data ?? []) as Array<{
    id: string;
    term_id: string;
    section_code: string;
  }>;
  const history = (historyResult.data ?? []) as Array<{
    id: string;
    student_id: string;
    section_id: string;
    year_level: number;
    created_at: string;
  }>;
  const currentAssignment = history.find((assignment) => {
    const section = sections.find((item) => item.id === assignment.section_id);
    return terms.some(
      (term) => term.id === section?.term_id && term.is_current,
    );
  });
  const currentSection = sections.find(
    (section) => section.id === currentAssignment?.section_id,
  );
  const currentTerm = terms.find(
    (term) => term.id === currentSection?.term_id,
  );
  const now = new Date().toISOString();
  const user: User = {
    id: profile.id,
    username: profile.email,
    email: profile.email,
    demoPassword: "",
    roles,
    status: profile.is_active ? "active" : "inactive",
    createdAt: profile.created_at,
    updatedAt: now,
  };
  saveRecords("users", [
    ...getRecords("users").filter((item) => item.id !== user.id),
    user,
  ]);

  if (profile.student_number) {
    const student: StudentProfile = {
      id: profile.id,
      userId: profile.id,
      studentNumber: profile.student_number,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email,
      accountStatus: profile.is_active ? "active" : "inactive",
      currentAcademicTermId: currentTerm?.id ?? "",
      currentSectionId: currentSection?.id ?? "",
      currentYearLevel: currentAssignment?.year_level ?? 1,
      nfcStatus: "not_registered",
      createdAt: profile.created_at,
      updatedAt: now,
    };
    saveRecords("students", [
      ...getRecords("students").filter((item) => item.userId !== user.id),
      student,
    ]);
  }

  const mappedTerms: AcademicTerm[] = terms.map((term) => ({
    id: term.id,
    academicYear: term.school_year,
    semester:
      term.semester.toLowerCase().startsWith("1") ||
      term.semester.toLowerCase().startsWith("first")
        ? "First"
        : term.semester.toLowerCase().startsWith("2") ||
            term.semester.toLowerCase().startsWith("second")
          ? "Second"
          : "Summer",
    startDate: "",
    endDate: "",
    status: term.is_current ? "active" : "historical",
  }));
  const mappedSections: Section[] = sections.map((section) => ({
    id: section.id,
    name: section.section_code,
    yearLevel:
      history.find((assignment) => assignment.section_id === section.id)
        ?.year_level ?? 1,
    academicTermId: section.term_id,
    status: "active",
  }));
  const mappedAssignments: StudentSectionAssignment[] = history.map(
    (assignment) => ({
      id: assignment.id,
      studentId: assignment.student_id,
      academicTermId:
        sections.find((section) => section.id === assignment.section_id)
          ?.term_id ?? "",
      sectionId: assignment.section_id,
      assignedAt: assignment.created_at,
      updatedAt: assignment.created_at,
      status:
        terms.find(
          (term) =>
            term.id ===
            sections.find((section) => section.id === assignment.section_id)
              ?.term_id,
        )?.is_current
          ? "active"
          : "inactive",
    }),
  );
  const mappedDevices: AuthorizedDevice[] = (devicesResult.data ?? []).map(
    (device) => ({
      id: device.id,
      deviceName: device.device_model ?? device.device_uid,
      deviceIdentifier: device.device_uid,
      assignedUserId: device.officer_id ?? "",
      platform: "Browser simulation",
      status:
        device.status ?? (device.is_authorized ? "authorized" : "pending"),
      authorizedBy: "",
      authorizedAt: device.authorized_at ?? undefined,
      revokedAt: undefined,
    }),
  );
  saveRecords("terms", mappedTerms);
  saveRecords("sections", mappedSections);
  saveRecords("assignments", mappedAssignments);
  saveRecords("devices", mappedDevices);

  return { userId: user.id, role: roles[0] };
}

export async function login(
  username: string,
  password: string,
): Promise<LoginResult> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username.trim().toLowerCase(),
      password,
    });
    if (error || !data.user)
      return { error: error?.message ?? "Unable to sign in." };
    try {
      const session = await hydrateSupabaseCache(data.user.id);
      localStorage.setItem(sessionKey, JSON.stringify(session));
      return { session };
    } catch (error) {
      await supabase.auth.signOut();
      return {
        error:
          error instanceof Error
            ? error.message
            : "Your account profile could not be loaded.",
      };
    }
  }

  const user = getRecords("users").find(
    (item) => item.username.toLowerCase() === username.trim().toLowerCase(),
  );
  if (!user || user.demoPassword !== password)
    return { error: "Username or password is incorrect." };
  if (user.status !== "active")
    return { error: "This account is inactive. Contact a CSG administrator." };
  const session = { userId: user.id, role: user.roles[0] };
  localStorage.setItem(sessionKey, JSON.stringify(session));
  return { session };
}
export function logout(): void {
  if (isSupabaseConfigured) void supabase.auth.signOut();
  localStorage.removeItem(sessionKey);
}
export function getSession(): DemoSession | null {
  try {
    return JSON.parse(
      localStorage.getItem(sessionKey) ?? "null",
    ) as DemoSession | null;
  } catch {
    return null;
  }
}
export async function restoreSession(): Promise<DemoSession | null> {
  if (!isSupabaseConfigured) return getSession();
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    localStorage.removeItem(sessionKey);
    return null;
  }
  try {
    const session = await hydrateSupabaseCache(data.session.user.id);
    localStorage.setItem(sessionKey, JSON.stringify(session));
    return session;
  } catch {
    await supabase.auth.signOut();
    localStorage.removeItem(sessionKey);
    return null;
  }
}
export function getUser(userId: string): User | undefined {
  return getRecords("users").find((user) => user.id === userId);
}
export function getRoleOptions(userId: string): RoleId[] {
  return getUser(userId)?.roles ?? [];
}
export function switchRole(role: RoleId): DemoSession | null {
  const session = getSession();
  if (!session || !getRoleOptions(session.userId).includes(role)) return null;
  const next = { ...session, role };
  localStorage.setItem(sessionKey, JSON.stringify(next));
  return next;
}

export interface StudentRegistrationInput {
  username: string;
  email: string;
  password: string;
  studentNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}

export function registerStudent(input: StudentRegistrationInput): {
  error?: string;
} {
  const username = input.username.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();
  const studentNumber = input.studentNumber.trim();
  const users = getRecords("users");
  const students = getRecords("students");
  if (
    !username ||
    !email ||
    !input.password ||
    !studentNumber ||
    !input.firstName.trim() ||
    !input.lastName.trim()
  )
    return { error: "Complete all required fields." };
  if (input.password.length < 8)
    return { error: "Password must be at least 8 characters." };
  if (users.some((user) => user.username.toLowerCase() === username))
    return { error: "That username is already in use." };
  if (users.some((user) => user.email.toLowerCase() === email))
    return { error: "That email is already registered." };
  if (
    students.some(
      (student) =>
        student.studentNumber.toLowerCase() === studentNumber.toLowerCase(),
    )
  )
    return { error: "That student number is already registered." };
  const now = new Date().toISOString();
  const userId = createId("usr-student");
  const studentId = createId("stu");
  const user: User = {
    id: userId,
    username,
    email,
    demoPassword: input.password,
    roles: ["student"],
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  const student: StudentProfile = {
    id: studentId,
    userId,
    studentNumber,
    firstName: input.firstName.trim(),
    middleName: input.middleName?.trim() || undefined,
    lastName: input.lastName.trim(),
    email,
    accountStatus: "active",
    currentAcademicTermId: "",
    currentSectionId: "",
    currentYearLevel: 1,
    nfcStatus: "not_registered",
    createdAt: now,
    updatedAt: now,
  };
  saveRecords("users", [...users, user]);
  saveRecords("students", [...students, student]);
  return {};
}

export interface AdminAccountInput {
  username: string;
  email: string;
  password: string;
  role: RoleId;
}

export function createAdminAccount(input: AdminAccountInput): {
  error?: string;
} {
  const username = input.username.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();
  const users = getRecords("users");
  if (!username || !email || !input.password)
    return { error: "Complete all account fields." };
  if (input.password.length < 8)
    return { error: "Password must be at least 8 characters." };
  if (users.some((user) => user.username.toLowerCase() === username))
    return { error: "That username is already in use." };
  if (users.some((user) => user.email.toLowerCase() === email))
    return { error: "That email is already registered." };
  const now = new Date().toISOString();
  const user: User = {
    id: createId("usr"),
    username,
    email,
    demoPassword: input.password,
    roles: [input.role],
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  saveRecords("users", [...users, user]);
  return {};
}

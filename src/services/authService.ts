import { createId, getRecords, saveRecords } from "./storageService";
import type { DemoSession, RoleId, User } from "../types/models";
import type { StudentProfile } from "../types/models";

const sessionKey = "unitap_session";
export function login(
  username: string,
  password: string,
): { session?: DemoSession; error?: string } {
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

export type RoleId = "student" | "csg_officer" | "csg_administrator";
export type RecordStatus = "active" | "inactive";

export interface Role {
  id: RoleId;
  name: string;
  description: string;
}
export interface User {
  id: string;
  username: string;
  email: string;
  demoPassword: string;
  roles: RoleId[];
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
}
export interface StudentProfile {
  id: string;
  userId: string;
  studentNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  accountStatus: RecordStatus;
  currentAcademicTermId: string;
  currentSectionId: string;
  currentYearLevel: number;
  nfcStatus: "registered" | "not_registered" | "pending";
  createdAt: string;
  updatedAt: string;
}
export interface AcademicTerm {
  id: string;
  academicYear: string;
  semester: "First" | "Second" | "Summer";
  startDate: string;
  endDate: string;
  status: "active" | "historical" | "planned";
}
export interface Section {
  id: string;
  name: string;
  yearLevel: number;
  academicTermId: string;
  status: RecordStatus;
}
export interface StudentSectionAssignment {
  id: string;
  studentId: string;
  academicTermId: string;
  sectionId: string;
  assignedAt: string;
  updatedAt: string;
  status: RecordStatus;
}
export interface AuthorizedDevice {
  id: string;
  deviceName: string;
  deviceIdentifier: string;
  assignedUserId: string;
  platform: "Android" | "iOS" | "Browser simulation";
  status: "pending" | "authorized" | "revoked" | "inactive";
  authorizedBy: string;
  authorizedAt?: string;
  revokedAt?: string;
}
export interface DemoSession {
  userId: string;
  role: RoleId;
}

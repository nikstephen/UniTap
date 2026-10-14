import { supabase } from "../lib/supabase";
import type {
  AcademicTerm,
  AuthorizedDevice,
  StudentProfile,
} from "../types/models";

export interface OfficerDashboardData {
  terms: AcademicTerm[];
  students: StudentProfile[];
  devices: AuthorizedDevice[];
}

const mapSemester = (semester: string): AcademicTerm["semester"] => {
  const value = semester.toLowerCase();
  if (value.startsWith("1") || value.startsWith("first")) return "First";
  if (value.startsWith("2") || value.startsWith("second")) return "Second";
  return "Summer";
};

export async function getOfficerDashboardData(
  userId: string,
): Promise<OfficerDashboardData> {
  const [profilesResult, termsResult, sectionsResult, historyResult, devicesResult] =
    await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("academic_terms").select("*"),
      supabase.from("sections").select("*"),
      supabase.from("student_section_history").select("*"),
      supabase
        .from("authorized_devices")
        .select("*")
        .eq("officer_id", userId),
    ]);
  const error =
    profilesResult.error ??
    termsResult.error ??
    sectionsResult.error ??
    historyResult.error ??
    devicesResult.error;
  if (error) throw error;

  const profiles = (profilesResult.data ?? []) as Array<{
    id: string;
    student_number: string | null;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
    created_at: string;
  }>;
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
  const mappedTerms: AcademicTerm[] = terms.map((term) => ({
    id: term.id,
    academicYear: term.school_year,
    semester: mapSemester(term.semester),
    startDate: "",
    endDate: "",
    status: term.is_current ? "active" : "historical",
  }));
  const students: StudentProfile[] = profiles
    .filter((profile) => profile.student_number)
    .map((profile) => {
      const assignments = history.filter(
        (assignment) => assignment.student_id === profile.id,
      );
      const currentAssignment = assignments.find((assignment) => {
        const section = sections.find(
          (item) => item.id === assignment.section_id,
        );
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
      return {
        id: profile.id,
        userId: profile.id,
        studentNumber: profile.student_number as string,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        accountStatus: profile.is_active ? "active" : "inactive",
        currentAcademicTermId: currentTerm?.id ?? "",
        currentSectionId: currentAssignment?.section_id ?? "",
        currentYearLevel: currentAssignment?.year_level ?? 1,
        nfcStatus: "not_registered",
        createdAt: profile.created_at,
        updatedAt: profile.created_at,
      };
    });
  const devices: AuthorizedDevice[] = (devicesResult.data ?? []).map(
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
    }),
  );
  return { terms: mappedTerms, students, devices };
}

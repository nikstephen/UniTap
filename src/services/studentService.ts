import { supabase } from "../lib/supabase";
import type {
  AcademicTerm,
  Section,
  StudentProfile,
  StudentSectionAssignment,
} from "../types/models";

export interface StudentDashboardData {
  student: StudentProfile;
  terms: AcademicTerm[];
  sections: Section[];
  history: StudentSectionAssignment[];
}

const mapSemester = (semester: string): AcademicTerm["semester"] => {
  const value = semester.toLowerCase();
  if (value.startsWith("1") || value.startsWith("first")) return "First";
  if (value.startsWith("2") || value.startsWith("second")) return "Second";
  return "Summer";
};

export async function getStudentDashboardData(
  userId: string,
): Promise<StudentDashboardData | null> {
  const [profileResult, termsResult, sectionsResult, historyResult] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("academic_terms").select("*"),
      supabase.from("sections").select("*"),
      supabase
        .from("student_section_history")
        .select("*")
        .eq("student_id", userId),
    ]);
  const error =
    profileResult.error ??
    termsResult.error ??
    sectionsResult.error ??
    historyResult.error;
  if (error) throw error;
  if (!profileResult.data) return null;

  const profile = profileResult.data as {
    id: string;
    student_number: string | null;
    first_name: string;
    last_name: string;
    email: string;
    is_active: boolean;
    created_at: string;
  };
  if (!profile.student_number) return null;

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
  const mappedTerms: AcademicTerm[] = terms.map((term) => ({
    id: term.id,
    academicYear: term.school_year,
    semester: mapSemester(term.semester),
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
  const mappedHistory: StudentSectionAssignment[] = history.map(
    (assignment) => {
      const section = sections.find((item) => item.id === assignment.section_id);
      const term = terms.find((item) => item.id === section?.term_id);
      return {
        id: assignment.id,
        studentId: assignment.student_id,
        academicTermId: section?.term_id ?? "",
        sectionId: assignment.section_id,
        assignedAt: assignment.created_at,
        updatedAt: assignment.created_at,
        status: term?.is_current ? "active" : "inactive",
      };
    },
  );
  return {
    student,
    terms: mappedTerms,
    sections: mappedSections,
    history: mappedHistory,
  };
}

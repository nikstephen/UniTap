import { supabase } from "../lib/supabase";
import type {
  AcademicTerm,
  Section,
  StudentProfile,
} from "../types/models";

export interface AssignmentData {
  students: StudentProfile[];
  terms: AcademicTerm[];
  sections: Section[];
}

const mapSemester = (semester: string): AcademicTerm["semester"] => {
  const value = semester.toLowerCase();
  if (value.startsWith("1") || value.startsWith("first")) return "First";
  if (value.startsWith("2") || value.startsWith("second")) return "Second";
  return "Summer";
};

export async function getAssignmentData(): Promise<AssignmentData> {
  const [profilesResult, termsResult, sectionsResult, historyResult] =
    await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("academic_terms").select("*"),
      supabase.from("sections").select("*"),
      supabase.from("student_section_history").select("*"),
    ]);
  const error =
    profilesResult.error ??
    termsResult.error ??
    sectionsResult.error ??
    historyResult.error;
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
  return {
    terms: terms.map((term) => ({
      id: term.id,
      academicYear: term.school_year,
      semester: mapSemester(term.semester),
      startDate: "",
      endDate: "",
      status: term.is_current ? "active" : "historical",
    })),
    sections: sections.map((section) => ({
      id: section.id,
      name: section.section_code,
      yearLevel:
        history.find((item) => item.section_id === section.id)?.year_level ??
        1,
      academicTermId: section.term_id,
      status: "active",
    })),
    students: profiles
      .filter((profile) => profile.student_number)
      .map((profile) => {
        const currentAssignment = history.find((assignment) => {
          if (assignment.student_id !== profile.id) return false;
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
          currentSectionId: currentSection?.id ?? "",
          currentYearLevel: currentAssignment?.year_level ?? 1,
          nfcStatus: "not_registered",
          createdAt: profile.created_at,
          updatedAt: profile.created_at,
        };
      }),
  };
}

export async function assignStudentToSection(input: {
  studentId: string;
  sectionId: string;
  yearLevel: number;
}): Promise<void> {
  const { data: section, error: sectionError } = await supabase
    .from("sections")
    .select("id, term_id")
    .eq("id", input.sectionId)
    .single();
  if (sectionError) throw sectionError;
  if (!section.term_id)
    throw new Error("The selected section is not linked to an academic term.");
  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .select("id, term_id")
    .eq("term_id", section.term_id);
  if (sectionsError) throw sectionsError;
  const sectionIds = (sections ?? []).map((item) => item.id);
  const { data: existing, error: historyError } = await supabase
    .from("student_section_history")
    .select("id, section_id")
    .eq("student_id", input.studentId)
    .in("section_id", sectionIds);
  if (historyError) throw historyError;
  if ((existing ?? []).length > 0)
    throw new Error("This student already has an assignment for that term.");
  const { error } = await supabase.from("student_section_history").insert({
    student_id: input.studentId,
    section_id: input.sectionId,
    year_level: input.yearLevel,
  });
  if (error) throw error;
}

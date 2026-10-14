import { supabase } from "../lib/supabase";
import type { AcademicTerm, Section } from "../types/models";

export interface AcademicStructure {
  terms: AcademicTerm[];
  sections: Section[];
}

const mapSemester = (semester: string): AcademicTerm["semester"] => {
  const value = semester.toLowerCase();
  if (value.startsWith("1") || value.startsWith("first")) return "First";
  if (value.startsWith("2") || value.startsWith("second")) return "Second";
  return "Summer";
};

const mapTerm = (term: {
  id: string;
  school_year: string;
  semester: string;
  is_current: boolean;
}): AcademicTerm => ({
  id: term.id,
  academicYear: term.school_year,
  semester: mapSemester(term.semester),
  startDate: "",
  endDate: "",
  status: term.is_current ? "active" : "historical",
});

export async function getAcademicStructure(): Promise<AcademicStructure> {
  const [termsResult, sectionsResult] = await Promise.all([
    supabase.from("academic_terms").select("*").order("school_year"),
    supabase.from("sections").select("*").order("section_code"),
  ]);
  if (termsResult.error) throw termsResult.error;
  if (sectionsResult.error) throw sectionsResult.error;
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
  return {
    terms: terms.map(mapTerm),
    sections: sections.map((section) => ({
      id: section.id,
      name: section.section_code,
      yearLevel: 1,
      academicTermId: section.term_id,
      status: "active",
    })),
  };
}

export async function createAcademicTerm(input: {
  academicYear: string;
  semester: AcademicTerm["semester"];
}): Promise<AcademicTerm> {
  const { data, error } = await supabase
    .from("academic_terms")
    .insert({
      school_year: input.academicYear,
      semester: input.semester,
      is_current: false,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapTerm(data as {
    id: string;
    school_year: string;
    semester: string;
    is_current: boolean;
  });
}

export async function createSection(input: {
  termId: string;
  sectionCode: string;
}): Promise<Section> {
  const { data, error } = await supabase
    .from("sections")
    .insert({ term_id: input.termId, section_code: input.sectionCode })
    .select("*")
    .single();
  if (error) throw error;
  const section = data as {
    id: string;
    term_id: string;
    section_code: string;
  };
  return {
    id: section.id,
    name: section.section_code,
    yearLevel: 1,
    academicTermId: section.term_id,
    status: "active",
  };
}

export async function activateAcademicTerm(
  termId: string,
): Promise<AcademicStructure> {
  const clearResult = await supabase
    .from("academic_terms")
    .update({ is_current: false })
    .neq("id", termId);
  if (clearResult.error) throw clearResult.error;
  const activateResult = await supabase
    .from("academic_terms")
    .update({ is_current: true })
    .eq("id", termId);
  if (activateResult.error) throw activateResult.error;
  return getAcademicStructure();
}

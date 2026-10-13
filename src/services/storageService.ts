import usersSeed from "../data/users.json";
import rolesSeed from "../data/roles.json";
import studentsSeed from "../data/students.json";
import termsSeed from "../data/academic-terms.json";
import sectionsSeed from "../data/sections.json";
import assignmentsSeed from "../data/student-section-assignments.json";
import devicesSeed from "../data/authorized-devices.json";
import type {
  AcademicTerm,
  AuthorizedDevice,
  Role,
  Section,
  StudentProfile,
  StudentSectionAssignment,
  User,
} from "../types/models";

type EntityMap = {
  users: User[];
  roles: Role[];
  students: StudentProfile[];
  terms: AcademicTerm[];
  sections: Section[];
  assignments: StudentSectionAssignment[];
  devices: AuthorizedDevice[];
};
const seeds = {
  users: usersSeed,
  roles: rolesSeed,
  students: studentsSeed,
  terms: termsSeed,
  sections: sectionsSeed,
  assignments: assignmentsSeed,
  devices: devicesSeed,
} as EntityMap;
const keys: Record<keyof EntityMap, string> = {
  users: "unitap_users",
  roles: "unitap_roles",
  students: "unitap_students",
  terms: "unitap_academic_terms",
  sections: "unitap_sections",
  assignments: "unitap_student_section_assignments",
  devices: "unitap_authorized_devices",
};
const canUseStorage = () =>
  typeof window !== "undefined" && !!window.localStorage;

export function initializeStorage(): void {
  if (!canUseStorage()) return;
  (Object.keys(seeds) as (keyof EntityMap)[]).forEach((entity) => {
    if (window.localStorage.getItem(keys[entity]) === null)
      window.localStorage.setItem(keys[entity], JSON.stringify(seeds[entity]));
  });
}
export function getRecords<K extends keyof EntityMap>(entity: K): EntityMap[K] {
  initializeStorage();
  if (!canUseStorage()) return seeds[entity];
  try {
    const raw = window.localStorage.getItem(keys[entity]);
    return raw ? (JSON.parse(raw) as EntityMap[K]) : seeds[entity];
  } catch {
    window.localStorage.setItem(keys[entity], JSON.stringify(seeds[entity]));
    return seeds[entity];
  }
}
export function saveRecords<K extends keyof EntityMap>(
  entity: K,
  records: EntityMap[K],
): void {
  if (canUseStorage())
    window.localStorage.setItem(keys[entity], JSON.stringify(records));
}
export function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
export function resetStorage(): void {
  if (canUseStorage()) {
    Object.values(keys).forEach((key) => window.localStorage.removeItem(key));
    initializeStorage();
  }
}

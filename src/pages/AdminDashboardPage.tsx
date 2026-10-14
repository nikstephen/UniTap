import { useEffect, useState } from "react";
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/react";
import { createAdminAccount, getUser, logout } from "../services/authService";
import { isSupabaseConfigured } from "../lib/supabase";
import {
  createSupabaseAccount,
  getAdminAccounts,
  setAccountActive,
} from "../services/adminAccountService";
import {
  assignStudentToSection,
  getAssignmentData,
} from "../services/assignmentService";
import {
  getAdminDevices,
  registerDevice,
  setDeviceStatus,
} from "../services/deviceService";
import { getRecords, saveRecords } from "../services/storageService";
import {
  activateAcademicTerm,
  createAcademicTerm,
  createSection,
  getAcademicStructure,
} from "../services/academicService";
import type {
  AcademicTerm,
  AuthorizedDevice,
  DemoSession,
  RoleId,
  Section,
  StudentProfile,
  User,
} from "../types/models";
import "./AppPages.css";

const AdminDashboardPage = ({
  session,
  onSessionChange,
}: {
  session: DemoSession;
  onSessionChange: (session: DemoSession | null) => void;
}) => {
  const [tab, setTab] = useState("overview");
  const [revision, setRevision] = useState(0);
  const [accountMessage, setAccountMessage] = useState("");
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [structureMessage, setStructureMessage] = useState("");
  const [students, setStudents] = useState<StudentProfile[]>(() =>
    getRecords("students"),
  );
  const [devices, setDevices] = useState<AuthorizedDevice[]>(() =>
    getRecords("devices"),
  );
  const [users, setUsers] = useState<User[]>(() => getRecords("users"));
  const [newTerm, setNewTerm] = useState({
    academicYear: "",
    semester: "First",
    startDate: "",
    endDate: "",
  });
  const [newSection, setNewSection] = useState({
    name: "",
    yearLevel: "1",
    term: "",
  });
  const [newAccount, setNewAccount] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    studentNumber: "",
    role: "student" as RoleId,
  });
  const [newAssignment, setNewAssignment] = useState({
    studentId: "",
    sectionId: "",
    yearLevel: "1",
  });
  const [newDevice, setNewDevice] = useState({
    officerId: "",
    deviceUid: "",
    deviceModel: "",
  });
  useEffect(() => {
    void getAcademicStructure()
      .then((structure) => {
        setTerms(structure.terms);
        setSections(structure.sections);
        setNewSection((current) => ({
          ...current,
          term:
            current.term ||
            structure.terms.find((item) => item.status === "active")?.id ||
            structure.terms[0]?.id ||
            "",
        }));
      })
      .catch(() => setStructureMessage("Unable to load academic records."));
  }, []);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    void getAdminDevices()
      .then(setDevices)
      .catch(() => setStructureMessage("Unable to load authorized devices."));
  }, []);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    void getAssignmentData()
      .then((data) => {
        setStudents(data.students);
        setNewAssignment((current) => ({
          ...current,
          studentId: current.studentId || data.students[0]?.id || "",
          sectionId: current.sectionId || data.sections[0]?.id || "",
        }));
      })
      .catch(() => setStructureMessage("Unable to load student assignments."));
  }, []);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    void getAdminAccounts()
      .then(setUsers)
      .catch(() => setAccountMessage("Unable to load accounts."));
  }, []);
  void revision;

  const addTerm = async () => {
    if (
      !newTerm.academicYear ||
      !newTerm.startDate ||
      !newTerm.endDate ||
      newTerm.startDate > newTerm.endDate ||
      terms.some(
        (item) =>
          item.academicYear === newTerm.academicYear &&
          item.semester === newTerm.semester,
      )
    )
      return;
    try {
      const term = await createAcademicTerm({
        academicYear: newTerm.academicYear,
        semester: newTerm.semester as AcademicTerm["semester"],
      });
      setTerms([...terms, term]);
      setNewTerm({
        academicYear: "",
        semester: "First",
        startDate: "",
        endDate: "",
      });
      setStructureMessage("Academic term created.");
    } catch {
      setStructureMessage("Unable to create academic term.");
    }
  };
  const addSection = async () => {
    if (
      !newSection.name ||
      sections.some(
        (item) =>
          item.name.toLowerCase() === newSection.name.toLowerCase() &&
          item.academicTermId === newSection.term,
      )
    )
      return;
    try {
      const section = await createSection({
        termId: newSection.term,
        sectionCode: newSection.name.toUpperCase(),
      });
      setSections([...sections, section]);
      setNewSection({ ...newSection, name: "" });
      setStructureMessage("Section created.");
    } catch {
      setStructureMessage("Unable to create section.");
    }
  };
  const setActiveTerm = async (id: string) => {
    try {
      const structure = await activateAcademicTerm(id);
      setTerms(structure.terms);
      setSections(structure.sections);
      setStructureMessage("Academic term updated.");
    } catch {
      setStructureMessage("Unable to update academic term.");
    }
  };
  const addAssignment = async () => {
    if (!newAssignment.studentId || !newAssignment.sectionId) return;
    try {
      await assignStudentToSection({
        studentId: newAssignment.studentId,
        sectionId: newAssignment.sectionId,
        yearLevel: Number(newAssignment.yearLevel),
      });
      const data = await getAssignmentData();
      setStudents(data.students);
      setStructureMessage("Student assigned to section.");
    } catch (error) {
      setStructureMessage(
        error instanceof Error
          ? error.message
          : "Unable to assign student to section.",
      );
    }
  };
  const addDevice = async () => {
    if (!newDevice.deviceUid) return;
    try {
      const device = await registerDevice(newDevice);
      setDevices((current) => [device, ...current]);
      setNewDevice({ officerId: "", deviceUid: "", deviceModel: "" });
      setStructureMessage("Device registered as pending.");
    } catch {
      setStructureMessage("Unable to register device. Check its UID.");
    }
  };
  const updateDeviceStatus = async (
    device: AuthorizedDevice,
    status: AuthorizedDevice["status"],
  ) => {
    try {
      const updated = await setDeviceStatus({
        deviceId: device.id,
        status,
        administratorId: session.userId,
      });
      setDevices((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setStructureMessage(`Device marked ${status}.`);
    } catch {
      setStructureMessage("Unable to update device status.");
    }
  };
  const addAccount = async () => {
    if (isSupabaseConfigured) {
      try {
        await createSupabaseAccount({
          email: newAccount.email,
          password: newAccount.password,
          firstName: newAccount.firstName,
          lastName: newAccount.lastName,
          studentNumber: newAccount.studentNumber,
          role: newAccount.role,
        });
        setUsers(await getAdminAccounts());
        setAccountMessage("Account created.");
        setNewAccount({
          username: "",
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          studentNumber: "",
          role: "student",
        });
      } catch (error) {
        setAccountMessage(
          error instanceof Error
            ? error.message
            : "Unable to create account.",
        );
      }
      return;
    }
    const result = createAdminAccount(newAccount);
    setAccountMessage(result.error ?? "Account created.");
    if (!result.error)
      setNewAccount({
        username: "",
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        studentNumber: "",
        role: "student",
      });
    setRevision(revision + 1);
  };
  const toggleAccount = async (user: User) => {
    const nextStatus = user.status !== "active";
    try {
      if (isSupabaseConfigured) {
        await setAccountActive(user.id, nextStatus);
      } else {
        const nextUsers = users.map((item) =>
          item.id === user.id
            ? {
                ...item,
                status: (nextStatus ? "active" : "inactive") as User["status"],
              }
            : item,
        );
        saveRecords("users", nextUsers);
      }
      setUsers((current) =>
        current.map((item) =>
          item.id === user.id
            ? { ...item, status: nextStatus ? "active" : "inactive" }
            : item,
        ),
      );
      setAccountMessage(nextStatus ? "Account activated." : "Account deactivated.");
    } catch {
      setAccountMessage("Unable to update account status.");
    }
  };
  const signOut = () => {
    logout();
    onSessionChange(null);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>CSG Admin</IonTitle>
          <IonButton slot="end" fill="clear" onClick={signOut}>
            Sign out
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="app-content">
        <div className="page-intro">
          <p className="eyebrow">
            CCS ADMINISTRATION · {getUser(session.userId)?.username}
          </p>
          <h1>Keep the campus record in order.</h1>
          <p>Manage the temporary local foundation for UniTap.</p>
        </div>
        <div className="admin-tabs-scroll">
          <IonSegment
            className="admin-tabs"
            value={tab}
            onIonChange={(event) => setTab(event.detail.value as string)}
            scrollable
          >
            <IonSegmentButton value="overview">Overview</IonSegmentButton>
            <IonSegmentButton value="users">Accounts</IonSegmentButton>
            <IonSegmentButton value="terms">Terms</IonSegmentButton>
            <IonSegmentButton value="sections">Sections</IonSegmentButton>
            <IonSegmentButton value="students">Students</IonSegmentButton>
            <IonSegmentButton value="devices">Devices</IonSegmentButton>
          </IonSegment>
        </div>
        <IonToast
          isOpen={!!structureMessage}
          message={structureMessage}
          duration={2400}
          color={
            structureMessage.startsWith("Unable") ? "danger" : "success"
          }
          onDidDismiss={() => setStructureMessage("")}
        />
        {tab === "overview" && (
          <div className="stat-grid">
            <IonCard>
              <IonCardContent>
                <span className="stat-label">USERS</span>
                <strong>{users.length}</strong>
              </IonCardContent>
            </IonCard>
            <IonCard>
              <IonCardContent>
                <span className="stat-label">STUDENTS</span>
                <strong>{students.length}</strong>
              </IonCardContent>
            </IonCard>
            <IonCard>
              <IonCardContent>
                <span className="stat-label">DEVICES</span>
                <strong>{devices.length}</strong>
              </IonCardContent>
            </IonCard>
          </div>
        )}
        {tab === "users" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Create user account</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p className="helper-text">
                Only administrators can create officer and administrator
                accounts. Student self-registration is available from the
                sign-in page.
              </p>
              <IonList>
                {users.map((user) => (
                  <IonItem key={user.id}>
                    <IonLabel>
                      <h3>{user.username}</h3>
                      <p>{user.email}</p>
                    </IonLabel>
                    <IonBadge color={user.status === "active" ? "success" : "medium"}>
                      {user.status}
                    </IonBadge>
                    <IonButton
                      slot="end"
                      fill="outline"
                      color={user.status === "active" ? "danger" : "success"}
                      onClick={() => void toggleAccount(user)}
                    >
                      {user.status === "active" ? "Deactivate" : "Activate"}
                    </IonButton>
                  </IonItem>
                ))}
              </IonList>
              <div className="form-grid">
                <IonInput
                  label="First name"
                  labelPlacement="stacked"
                  value={newAccount.firstName}
                  onIonInput={(event) =>
                    setNewAccount({
                      ...newAccount,
                      firstName: event.detail.value ?? "",
                    })
                  }
                />
                <IonInput
                  label="Last name"
                  labelPlacement="stacked"
                  value={newAccount.lastName}
                  onIonInput={(event) =>
                    setNewAccount({
                      ...newAccount,
                      lastName: event.detail.value ?? "",
                    })
                  }
                />
                <IonInput
                  label="Student number"
                  labelPlacement="stacked"
                  value={newAccount.studentNumber}
                  onIonInput={(event) =>
                    setNewAccount({
                      ...newAccount,
                      studentNumber: event.detail.value ?? "",
                    })
                  }
                />
                <IonInput
                  label="Username"
                  labelPlacement="stacked"
                  value={newAccount.username}
                  onIonInput={(event) =>
                    setNewAccount({
                      ...newAccount,
                      username: event.detail.value ?? "",
                    })
                  }
                />
                <IonInput
                  type="email"
                  label="Email"
                  labelPlacement="stacked"
                  value={newAccount.email}
                  onIonInput={(event) =>
                    setNewAccount({
                      ...newAccount,
                      email: event.detail.value ?? "",
                    })
                  }
                />
                <IonInput
                  type="password"
                  label="Temporary password"
                  labelPlacement="stacked"
                  value={newAccount.password}
                  onIonInput={(event) =>
                    setNewAccount({
                      ...newAccount,
                      password: event.detail.value ?? "",
                    })
                  }
                />
                <IonSelect
                  label="Role"
                  labelPlacement="stacked"
                  value={newAccount.role}
                  onIonChange={(event) =>
                    setNewAccount({
                      ...newAccount,
                      role: event.detail.value as RoleId,
                    })
                  }
                >
                  <IonSelectOption value="student">
                    BSIT Student
                  </IonSelectOption>
                  <IonSelectOption value="csg_officer">
                    CSG Officer
                  </IonSelectOption>
                  <IonSelectOption value="csg_administrator">
                    CSG Administrator
                  </IonSelectOption>
                </IonSelect>
              </div>
              <IonButton onClick={() => void addAccount()}>
                Create account
              </IonButton>
              <IonToast
                isOpen={!!accountMessage}
                message={accountMessage}
                duration={2400}
                color={
                  accountMessage === "Account created." ? "success" : "danger"
                }
                onDidDismiss={() => setAccountMessage("")}
              />
            </IonCardContent>
          </IonCard>
        )}
        {tab === "terms" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Academic terms</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {terms.map((term) => (
                  <IonItem key={term.id}>
                    <IonLabel>
                      <h3>
                        {term.academicYear} · {term.semester}
                      </h3>
                      <p>
                        {term.startDate} to {term.endDate}
                      </p>
                    </IonLabel>
                    {term.status === "active" ? (
                      <IonBadge color="success">active</IonBadge>
                    ) : (
                      <IonButton
                        slot="end"
                        fill="outline"
                        onClick={() => setActiveTerm(term.id)}
                      >
                        Set active
                      </IonButton>
                    )}
                  </IonItem>
                ))}
              </IonList>
              <div className="form-grid">
                <IonInput
                  label="Academic year"
                  labelPlacement="stacked"
                  value={newTerm.academicYear}
                  onIonInput={(event) =>
                    setNewTerm({
                      ...newTerm,
                      academicYear: event.detail.value ?? "",
                    })
                  }
                  placeholder="2026-2027"
                />
                <IonInput
                  label="Semester"
                  labelPlacement="stacked"
                  value={newTerm.semester}
                  onIonInput={(event) =>
                    setNewTerm({
                      ...newTerm,
                      semester: event.detail.value ?? "First",
                    })
                  }
                />
                <IonInput
                  type="date"
                  label="Start"
                  labelPlacement="stacked"
                  value={newTerm.startDate}
                  onIonInput={(event) =>
                    setNewTerm({
                      ...newTerm,
                      startDate: event.detail.value ?? "",
                    })
                  }
                />
                <IonInput
                  type="date"
                  label="End"
                  labelPlacement="stacked"
                  value={newTerm.endDate}
                  onIonInput={(event) =>
                    setNewTerm({
                      ...newTerm,
                      endDate: event.detail.value ?? "",
                    })
                  }
                />
              </div>
              <IonButton onClick={addTerm}>Add term</IonButton>
            </IonCardContent>
          </IonCard>
        )}
        {tab === "sections" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Sections</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {sections.map((section) => (
                  <IonItem key={section.id}>
                    <IonLabel>
                      <h3>{section.name}</h3>
                      <p>
                        Year {section.yearLevel} ·{" "}
                        {
                          terms.find(
                            (term) => term.id === section.academicTermId,
                          )?.academicYear
                        }
                      </p>
                    </IonLabel>
                    <IonBadge slot="end">{section.status}</IonBadge>
                  </IonItem>
                ))}
              </IonList>
              <div className="form-grid">
                <IonInput
                  label="Section name"
                  labelPlacement="stacked"
                  value={newSection.name}
                  onIonInput={(event) =>
                    setNewSection({
                      ...newSection,
                      name: event.detail.value ?? "",
                    })
                  }
                  placeholder="1F2"
                />
                <IonInput
                  type="number"
                  label="Year level"
                  labelPlacement="stacked"
                  value={newSection.yearLevel}
                  onIonInput={(event) =>
                    setNewSection({
                      ...newSection,
                      yearLevel: event.detail.value ?? "1",
                    })
                  }
                />
              </div>
              <IonButton onClick={addSection}>Add section</IonButton>
            </IonCardContent>
          </IonCard>
        )}
        {tab === "students" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Student profiles</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="form-grid">
                <IonSelect
                  label="Student"
                  labelPlacement="stacked"
                  value={newAssignment.studentId}
                  onIonChange={(event) =>
                    setNewAssignment({
                      ...newAssignment,
                      studentId: event.detail.value as string,
                    })
                  }
                >
                  {students.map((student) => (
                    <IonSelectOption key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} · {student.studentNumber}
                    </IonSelectOption>
                  ))}
                </IonSelect>
                <IonSelect
                  label="Section"
                  labelPlacement="stacked"
                  value={newAssignment.sectionId}
                  onIonChange={(event) =>
                    setNewAssignment({
                      ...newAssignment,
                      sectionId: event.detail.value as string,
                    })
                  }
                >
                  {sections.map((section) => (
                    <IonSelectOption key={section.id} value={section.id}>
                      {section.name} · {terms.find((term) => term.id === section.academicTermId)?.academicYear}
                    </IonSelectOption>
                  ))}
                </IonSelect>
                <IonInput
                  type="number"
                  label="Year level"
                  labelPlacement="stacked"
                  value={newAssignment.yearLevel}
                  onIonInput={(event) =>
                    setNewAssignment({
                      ...newAssignment,
                      yearLevel: event.detail.value ?? "1",
                    })
                  }
                />
              </div>
              <IonButton onClick={() => void addAssignment()}>
                Assign student
              </IonButton>
              <IonList>
                {students.map((student) => (
                  <IonItem key={student.id}>
                    <IonLabel>
                      <h3>
                        {student.firstName} {student.lastName}
                      </h3>
                      <p>
                        {student.studentNumber} · Year{" "}
                        {student.currentYearLevel}
                      </p>
                    </IonLabel>
                    <IonBadge slot="end" color="success">
                      {student.accountStatus}
                    </IonBadge>
                  </IonItem>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>
        )}
        {tab === "devices" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Simulated devices</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="form-grid">
                <IonSelect
                  label="Assigned officer"
                  labelPlacement="stacked"
                  value={newDevice.officerId}
                  onIonChange={(event) =>
                    setNewDevice({
                      ...newDevice,
                      officerId: event.detail.value as string,
                    })
                  }
                >
                  <IonSelectOption value="">Unassigned</IonSelectOption>
                  {users
                    .filter((user) => user.roles.includes("csg_officer"))
                    .map((user) => (
                      <IonSelectOption key={user.id} value={user.id}>
                        {user.email}
                      </IonSelectOption>
                    ))}
                </IonSelect>
                <IonInput
                  label="Device UID"
                  labelPlacement="stacked"
                  value={newDevice.deviceUid}
                  onIonInput={(event) =>
                    setNewDevice({
                      ...newDevice,
                      deviceUid: event.detail.value ?? "",
                    })
                  }
                />
                <IonInput
                  label="Device model"
                  labelPlacement="stacked"
                  value={newDevice.deviceModel}
                  onIonInput={(event) =>
                    setNewDevice({
                      ...newDevice,
                      deviceModel: event.detail.value ?? "",
                    })
                  }
                />
              </div>
              <IonButton onClick={() => void addDevice()}>
                Register device
              </IonButton>
              <IonList>
                {devices.map((device) => (
                  <IonItem key={device.id}>
                    <IonLabel>
                      <h3>{device.deviceName}</h3>
                      <p>
                        {device.deviceIdentifier} · {device.platform}
                      </p>
                    </IonLabel>
                    <IonBadge
                      slot="end"
                      color={
                        device.status === "authorized"
                          ? "success"
                          : device.status === "revoked" ||
                              device.status === "lost"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {device.status}
                    </IonBadge>
                    {device.status === "pending" && (
                      <IonButton
                        slot="end"
                        fill="outline"
                        onClick={() =>
                          void updateDeviceStatus(device, "authorized")
                        }
                      >
                        Authorize
                      </IonButton>
                    )}
                    {device.status === "authorized" && (
                      <IonButton
                        slot="end"
                        fill="outline"
                        color="danger"
                        onClick={() =>
                          void updateDeviceStatus(device, "revoked")
                        }
                      >
                        Revoke
                      </IonButton>
                    )}
                  </IonItem>
                ))}
              </IonList>
              <p className="helper-text">
                These browser records prepare the workflow for future Capacitor
                and Android device authorization.
              </p>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AdminDashboardPage;

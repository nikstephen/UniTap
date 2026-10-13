import { useState } from "react";
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
import { createId, getRecords, saveRecords } from "../services/storageService";
import type {
  AcademicTerm,
  DemoSession,
  RoleId,
  Section,
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
  const terms = getRecords("terms");
  const sections = getRecords("sections");
  const students = getRecords("students");
  const devices = getRecords("devices");
  const users = getRecords("users");
  const [newTerm, setNewTerm] = useState({
    academicYear: "",
    semester: "First",
    startDate: "",
    endDate: "",
  });
  const [newSection, setNewSection] = useState({
    name: "",
    yearLevel: "1",
    term: terms.find((item) => item.status === "active")?.id ?? "",
  });
  const [newAccount, setNewAccount] = useState({
    username: "",
    email: "",
    password: "",
    role: "student" as RoleId,
  });
  void revision;

  const addTerm = () => {
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
    saveRecords("terms", [
      ...terms,
      {
        ...newTerm,
        id: createId("term"),
        semester: newTerm.semester as AcademicTerm["semester"],
        status: "planned",
      },
    ]);
    setNewTerm({
      academicYear: "",
      semester: "First",
      startDate: "",
      endDate: "",
    });
    setRevision(revision + 1);
  };
  const addSection = () => {
    if (
      !newSection.name ||
      sections.some(
        (item) =>
          item.name.toLowerCase() === newSection.name.toLowerCase() &&
          item.academicTermId === newSection.term,
      )
    )
      return;
    saveRecords("sections", [
      ...sections,
      {
        id: createId("section"),
        name: newSection.name.toUpperCase(),
        yearLevel: Number(newSection.yearLevel),
        academicTermId: newSection.term,
        status: "active",
      } as Section,
    ]);
    setNewSection({ ...newSection, name: "" });
    setRevision(revision + 1);
  };
  const setActiveTerm = (id: string) => {
    saveRecords(
      "terms",
      terms.map((item) => ({
        ...item,
        status:
          item.id === id
            ? "active"
            : item.status === "active"
              ? "historical"
              : item.status,
      })),
    );
    setRevision(revision + 1);
  };
  const addAccount = () => {
    const result = createAdminAccount(newAccount);
    setAccountMessage(result.error ?? "Account created.");
    if (!result.error)
      setNewAccount({ username: "", email: "", password: "", role: "student" });
    setRevision(revision + 1);
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
                    <IonBadge slot="end">{user.roles.join(", ")}</IonBadge>
                  </IonItem>
                ))}
              </IonList>
              <div className="form-grid">
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
              <IonButton onClick={addAccount}>Create account</IonButton>
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
                        device.status === "authorized" ? "success" : "warning"
                      }
                    >
                      {device.status}
                    </IonBadge>
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

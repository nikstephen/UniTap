import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { getRoleOptions, logout, switchRole } from "../services/authService";
import { getRecords } from "../services/storageService";
import type { DemoSession } from "../types/models";
import "./AppPages.css";

const StudentDashboardPage = ({
  session,
  onSessionChange,
}: {
  session: DemoSession;
  onSessionChange: (session: DemoSession | null) => void;
}) => {
  const student = getRecords("students").find(
    (item) => item.userId === session.userId,
  );
  const terms = getRecords("terms");
  const sections = getRecords("sections");
  if (!student)
    return (
      <IonPage>
        <IonContent>
          <div className="empty-state">
            <h2>No student profile</h2>
            <p>Your account is not linked to a BSIT student profile yet.</p>
          </div>
        </IonContent>
      </IonPage>
    );
  const term = terms.find((item) => item.id === student.currentAcademicTermId);
  const section = sections.find((item) => item.id === student.currentSectionId);
  const history = getRecords("assignments").filter(
    (item) => item.studentId === student.id,
  );
  const roles = getRoleOptions(session.userId);
  const leave = () => {
    logout();
    onSessionChange(null);
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My UniTap</IonTitle>
          <IonButton slot="end" fill="clear" onClick={leave}>
            Sign out
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="app-content">
        <div className="page-intro">
            <p className="eyebrow">CCS · BSIT STUDENT SPACE</p>
          <h1>Good to see you, {student.firstName}.</h1>
          <p>Here is your current academic identity.</p>
        </div>
        {roles.length > 1 && (
          <IonItem className="role-switcher">
            <IonLabel>View as</IonLabel>
            <IonSelect
              value={session.role}
              onIonChange={(event) =>
                onSessionChange(switchRole(event.detail.value))
              }
            >
              {roles.map((role) => (
                <IonSelectOption key={role} value={role}>
                  {role === "student" ? "BSIT Student" : "CSG Officer"}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        )}
        <div className="stat-grid">
          <IonCard>
            <IonCardContent>
              <span className="stat-label">YEAR LEVEL</span>
              <strong>{student.currentYearLevel}</strong>
            </IonCardContent>
          </IonCard>
          <IonCard>
            <IonCardContent>
              <span className="stat-label">SECTION</span>
              <strong>{section?.name ?? "Unassigned"}</strong>
            </IonCardContent>
          </IonCard>
          <IonCard>
            <IonCardContent>
              <span className="stat-label">NFC ID</span>
              <IonBadge
                color={
                  student.nfcStatus === "registered" ? "success" : "warning"
                }
              >
                {student.nfcStatus.replace("_", " ")}
              </IonBadge>
            </IonCardContent>
          </IonCard>
        </div>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Student profile</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList lines="none">
              <IonItem>
                <IonLabel>
                  <span className="muted">Student number</span>
                  <h3>{student.studentNumber}</h3>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <span className="muted">Account status</span>
                  <h3>{student.accountStatus}</h3>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <span className="muted">Current academic term</span>
                  <h3>
                    {term
                      ? `${term.academicYear} · ${term.semester} Semester`
                      : "Not assigned"}
                  </h3>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <span className="muted">Email</span>
                  <h3>{student.email}</h3>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Section history</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              {history.map((item) => {
                const historyTerm = terms.find(
                  (termItem) => termItem.id === item.academicTermId,
                );
                const historySection = sections.find(
                  (sectionItem) => sectionItem.id === item.sectionId,
                );
                return (
                  <IonItem key={item.id}>
                    <IonLabel>
                      <h3>
                        {historyTerm?.academicYear} · {historyTerm?.semester}
                      </h3>
                      <p>
                        {historySection?.name} · Year{" "}
                        {historySection?.yearLevel}
                      </p>
                    </IonLabel>
                    <IonBadge
                      slot="end"
                      color={item.status === "active" ? "success" : "medium"}
                    >
                      {item.status}
                    </IonBadge>
                  </IonItem>
                );
              })}
            </IonList>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};
export default StudentDashboardPage;

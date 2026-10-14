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
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  getRoleOptions,
  getUser,
  logout,
  switchRole,
} from "../services/authService";
import {
  getOfficerDashboardData,
  type OfficerDashboardData,
} from "../services/officerService";
import type { DemoSession } from "../types/models";
import "./AppPages.css";

const OfficerDashboardPage = ({
  session,
  onSessionChange,
}: {
  session: DemoSession;
  onSessionChange: (session: DemoSession | null) => void;
}) => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<OfficerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    void getOfficerDashboardData(session.userId)
      .then((next) => {
        if (mounted) setData(next);
      })
      .catch(() => {
        if (mounted) setError("Unable to load officer records.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [session.userId]);
  const terms = data?.terms ?? [];
  const currentTerm = terms.find((term) => term.status === "active");
  const devices = data?.devices ?? [];
  const students = (data?.students ?? []).filter((student) =>
    `${student.firstName} ${student.lastName} ${student.studentNumber}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const roles = getRoleOptions(session.userId);
  const leave = () => {
    logout();
    onSessionChange(null);
  };
  if (loading)
    return (
      <IonPage>
        <IonContent>
          <div className="empty-state">Loading officer records...</div>
        </IonContent>
      </IonPage>
    );
  if (error)
    return (
      <IonPage>
        <IonContent>
          <div className="empty-state">
            <h2>Records unavailable</h2>
            <p>{error}</p>
          </div>
        </IonContent>
      </IonPage>
    );
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>CSG Officer</IonTitle>
          <IonButton slot="end" fill="clear" onClick={leave}>
            Sign out
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="app-content">
        <div className="page-intro">
            <p className="eyebrow">CCS · CSG OPERATIONS</p>
          <h1>Welcome, {getUser(session.userId)?.username}.</h1>
          <p>
            Review authorized student information and your device readiness for
            the current term.
          </p>
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
              <span className="stat-label">ACTIVE TERM</span>
              <strong>{currentTerm ? currentTerm.academicYear : "None"}</strong>
            </IonCardContent>
          </IonCard>
          <IonCard>
            <IonCardContent>
              <span className="stat-label">STUDENTS</span>
              <strong>{data?.students.length ?? 0}</strong>
            </IonCardContent>
          </IonCard>
          <IonCard>
            <IonCardContent>
              <span className="stat-label">MY DEVICES</span>
              <strong>
                {
                  devices.filter((device) => device.status === "authorized")
                    .length
                }
              </strong>
            </IonCardContent>
          </IonCard>
        </div>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Device readiness</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {devices.length === 0 ? (
              <p className="helper-text">
                No simulated device is assigned to this account.
              </p>
            ) : (
              <IonList>
                {devices.map((device) => (
                  <IonItem key={device.id}>
                    <IonLabel>
                      <h3>{device.deviceName}</h3>
                      <p>
                        {device.platform} · {device.deviceIdentifier}
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
            )}
            <p className="helper-text">
              Device identifiers are simulated browser records. They do not
              verify real hardware.
            </p>
          </IonCardContent>
        </IonCard>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Student directory</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonInput
              value={search}
              onIonInput={(event) => setSearch(event.detail.value ?? "")}
              label="Search students"
              labelPlacement="stacked"
              placeholder="Name or student number"
              clearInput
            />
            <IonList>
              {students.map((student) => (
                <IonItem key={student.id}>
                  <IonLabel>
                    <h3>
                      {student.firstName} {student.lastName}
                    </h3>
                    <p>
                      {student.studentNumber} · Year {student.currentYearLevel}{" "}
                      · {student.accountStatus}
                    </p>
                  </IonLabel>
                  <IonBadge
                    slot="end"
                    color={
                      student.nfcStatus === "registered" ? "success" : "warning"
                    }
                  >
                    {student.nfcStatus.replace("_", " ")}
                  </IonBadge>
                </IonItem>
              ))}
            </IonList>
            {students.length === 0 && (
              <p className="empty-state">No matching students.</p>
            )}
          </IonCardContent>
        </IonCard>
        <IonCard>
          <IonCardContent>
            <h2>Coming later</h2>
            <p>
              Attendance marking, event operations, NFC scanning, and payment
              workflows are planned for later phases.
            </p>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};
export default OfficerDashboardPage;

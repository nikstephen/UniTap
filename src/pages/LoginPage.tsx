import { FormEvent, useState } from "react";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonText,
  IonToast,
} from "@ionic/react";
import { login, registerStudent } from "../services/authService";
import { isSupabaseConfigured } from "../lib/supabase";
import type { DemoSession } from "../types/models";
import "./AppPages.css";

const LoginPage = ({
  onLogin,
}: {
  onLogin: (session: DemoSession) => void;
}) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [registration, setRegistration] = useState({
    email: "",
    studentNumber: "",
    firstName: "",
    middleName: "",
    lastName: "",
    confirmPassword: "",
  });
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (mode === "login") {
      const result = await login(username, password);
      if (result.session) onLogin(result.session);
      else setError(result.error ?? "Unable to sign in.");
      return;
    }
    if (password !== registration.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const result = registerStudent({
      username,
      email: registration.email,
      password,
      studentNumber: registration.studentNumber,
      firstName: registration.firstName,
      middleName: registration.middleName,
      lastName: registration.lastName,
    });
    if (result.error) {
      setError(result.error);
      return;
    }
    setMode("login");
    setPassword("");
    setRegistration({
      email: "",
      studentNumber: "",
      firstName: "",
      middleName: "",
      lastName: "",
      confirmPassword: "",
    });
    setError("Student account created. Sign in to continue.");
  };
  const updateRegistration = (
    field: keyof typeof registration,
    value: string,
  ) => setRegistration({ ...registration, [field]: value });
  return (
    <IonPage>
      <IonContent className="login-page">
        <div className="login-layout">
          <div className="brand-lockup">
            <div className="brand-mark">CCS</div>
            <div className="brand-copy">
              <strong>Mindoro State University</strong>
              <span>Calapan City Campus</span>
            </div>
          </div>
          <p className="eyebrow">COLLEGE OF COMPUTER STUDIES · BSIT</p>
          <h1>
            {mode === "login"
              ? "One tap closer to campus."
              : "Start your student journey."}
          </h1>
          <p className="lede">
            {mode === "login"
              ? "Your digital home for Bachelor of Science in Information Technology, academic records, and CCS services."
              : "Create a BSIT student account. Officer and administrator accounts are created by a CSG administrator."}
          </p>
          <IonCard className="login-card">
            <IonCardHeader>
              <IonCardSubtitle>
                {mode === "login"
                  ? isSupabaseConfigured
                    ? "Supabase authentication"
                    : "Temporary demonstration"
                  : "Student self-registration"}
              </IonCardSubtitle>
              <IonCardTitle>
                {mode === "login"
                  ? "Sign in to UniTap"
                  : "Create student account"}
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <form onSubmit={submit}>
                <IonItem>
                  <IonLabel position="stacked">
                    {isSupabaseConfigured ? "Email" : "Username"}
                  </IonLabel>
                  <IonInput
                    required
                    type={isSupabaseConfigured ? "email" : "text"}
                    value={username}
                    onIonInput={(event) =>
                      setUsername(event.detail.value ?? "")
                    }
                    placeholder={
                      isSupabaseConfigured
                        ? "you@example.edu"
                        : "e.g. maria.santos"
                    }
                  />
                </IonItem>
                {mode === "signup" && (
                  <>
                    <IonItem>
                      <IonLabel position="stacked">Email</IonLabel>
                      <IonInput
                        required
                        type="email"
                        value={registration.email}
                        onIonInput={(event) =>
                          updateRegistration("email", event.detail.value ?? "")
                        }
                        placeholder="you@example.edu"
                      />
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Student number</IonLabel>
                      <IonInput
                        required
                        value={registration.studentNumber}
                        onIonInput={(event) =>
                          updateRegistration(
                            "studentNumber",
                            event.detail.value ?? "",
                          )
                        }
                        placeholder="2026-0001"
                      />
                    </IonItem>
                    <div className="form-grid compact-form">
                      <IonInput
                        label="First name"
                        labelPlacement="stacked"
                        required
                        value={registration.firstName}
                        onIonInput={(event) =>
                          updateRegistration(
                            "firstName",
                            event.detail.value ?? "",
                          )
                        }
                      />
                      <IonInput
                        label="Middle name"
                        labelPlacement="stacked"
                        value={registration.middleName}
                        onIonInput={(event) =>
                          updateRegistration(
                            "middleName",
                            event.detail.value ?? "",
                          )
                        }
                      />
                      <IonInput
                        label="Last name"
                        labelPlacement="stacked"
                        required
                        value={registration.lastName}
                        onIonInput={(event) =>
                          updateRegistration(
                            "lastName",
                            event.detail.value ?? "",
                          )
                        }
                      />
                    </div>
                  </>
                )}
                <IonItem>
                  <IonLabel position="stacked">Password</IonLabel>
                  <IonInput
                    required
                    type="password"
                    value={password}
                    onIonInput={(event) =>
                      setPassword(event.detail.value ?? "")
                    }
                    placeholder="At least 8 characters"
                  />
                </IonItem>
                {mode === "signup" && (
                  <IonItem>
                    <IonLabel position="stacked">Confirm password</IonLabel>
                    <IonInput
                      required
                      type="password"
                      value={registration.confirmPassword}
                      onIonInput={(event) =>
                        updateRegistration(
                          "confirmPassword",
                          event.detail.value ?? "",
                        )
                      }
                    />
                  </IonItem>
                )}
                <IonButton expand="block" type="submit">
                  {mode === "login" ? "Continue" : "Create student account"}
                </IonButton>
              </form>
              {mode === "login" ? (
                <>
                  <p className="helper-text">
                    {isSupabaseConfigured
                      ? "Use the email and password from your Supabase Auth account."
                      : "Accounts: maria.santos / student123, jordan.reyes / officer123, alex.delacruz / admin123."}
                  </p>
                  {!isSupabaseConfigured && (
                    <IonButton
                      fill="clear"
                      expand="block"
                      onClick={() => setMode("signup")}
                    >
                      New BSIT student? Sign up
                    </IonButton>
                  )}
                </>
              ) : (
                <IonButton
                  fill="clear"
                  expand="block"
                  onClick={() => setMode("login")}
                >
                  Already have an account? Sign in
                </IonButton>
              )}
            </IonCardContent>
          </IonCard>
          <IonText color="medium">
            <small>
              {isSupabaseConfigured
                ? "Authentication is provided by Supabase."
                : "Local demo only. This is not production authentication."}
            </small>
          </IonText>
        </div>
        <IonToast
          isOpen={!!error}
          message={error}
          duration={2600}
          color={error.includes("created") ? "success" : "danger"}
          onDidDismiss={() => setError("")}
        />
      </IonContent>
    </IonPage>
  );
};
export default LoginPage;

import { supabase } from "../lib/supabase";
import type { AuthorizedDevice } from "../types/models";

const deviceStatuses: AuthorizedDevice["status"][] = [
  "pending",
  "authorized",
  "revoked",
  "lost",
  "replaced",
];

const mapStatus = (status: string | null): AuthorizedDevice["status"] =>
  deviceStatuses.includes(status as AuthorizedDevice["status"])
    ? (status as AuthorizedDevice["status"])
    : "pending";

const mapDevice = (device: {
  id: string;
  officer_id: string | null;
  device_uid: string;
  device_model: string | null;
  is_authorized: boolean | null;
  status: string | null;
  authorized_by: string | null;
  authorized_at: string | null;
  revoked_at: string | null;
}): AuthorizedDevice => ({
  id: device.id,
  deviceName: device.device_model ?? device.device_uid,
  deviceIdentifier: device.device_uid,
  assignedUserId: device.officer_id ?? "",
  platform: "Browser simulation",
  status: mapStatus(device.status),
  authorizedBy: device.authorized_by ?? "",
  authorizedAt: device.authorized_at ?? undefined,
  revokedAt: device.revoked_at ?? undefined,
});

export async function getAdminDevices(): Promise<AuthorizedDevice[]> {
  const { data, error } = await supabase
    .from("authorized_devices")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapDevice);
}

export async function registerDevice(input: {
  officerId: string;
  deviceUid: string;
  deviceModel: string;
}): Promise<AuthorizedDevice> {
  const { data, error } = await supabase
    .from("authorized_devices")
    .insert({
      officer_id: input.officerId || null,
      device_uid: input.deviceUid,
      device_model: input.deviceModel || null,
      is_authorized: false,
      status: "pending",
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapDevice(data);
}

export async function setDeviceStatus(input: {
  deviceId: string;
  status: AuthorizedDevice["status"];
  administratorId: string;
}): Promise<AuthorizedDevice> {
  const isAuthorized = input.status === "authorized";
  const { data, error } = await supabase
    .from("authorized_devices")
    .update({
      status: input.status,
      is_authorized: isAuthorized,
      authorized_by: isAuthorized ? input.administratorId : null,
      authorized_at: isAuthorized ? new Date().toISOString() : null,
      revoked_at: input.status === "revoked" ? new Date().toISOString() : null,
    })
    .eq("id", input.deviceId)
    .select("*")
    .single();
  if (error) throw error;
  return mapDevice(data);
}

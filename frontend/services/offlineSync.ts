import AsyncStorage from "@react-native-async-storage/async-storage";
import { CollectorAPI } from "./api";

const PENDING_KEY = "pending_uploads";

export type PendingUpload = {
  farmer_id: string;
  crop_name: string;
  quantity: string;
  location: string;
  region?: string;
  images: string[];
};

export async function queueUpload(payload: PendingUpload) {
  const existing = await AsyncStorage.getItem(PENDING_KEY);
  const list: PendingUpload[] = existing ? JSON.parse(existing) : [];
  list.push(payload);
  await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(list));
}

async function isOnline(): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000"}/`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function syncPendingUploads() {
  const existing = await AsyncStorage.getItem(PENDING_KEY);
  if (!existing) return { synced: 0, remaining: 0 };
  const list: PendingUpload[] = JSON.parse(existing);
  if (!list.length) return { synced: 0, remaining: 0 };

  const online = await isOnline();
  if (!online) return { synced: 0, remaining: list.length };

  const remaining: PendingUpload[] = [];
  let synced = 0;

  for (const item of list) {
    try {
      const formData = new FormData();
      formData.append("farmer_id", item.farmer_id);
      formData.append("crop_name", item.crop_name);
      formData.append("quantity", item.quantity);
      formData.append("location", item.location);
      if (item.region) formData.append("region", item.region);
      item.images.forEach((uri, idx) => {
        const filename = uri.split("/").pop() || `upload_${idx}.jpg`;
        formData.append("files", { uri, name: filename, type: "image/jpeg" } as any);
      });

      await CollectorAPI.uploadBatch(formData);
      synced += 1;
    } catch {
      remaining.push(item);
    }
  }

  await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(remaining));
  return { synced, remaining: remaining.length };
}

let started = false;
export function startBackgroundSync(intervalMs = 15000) {
  if (started) return;
  started = true;
  setInterval(() => {
    syncPendingUploads().catch(() => {});
  }, intervalMs);
}

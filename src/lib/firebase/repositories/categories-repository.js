import {
  addDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { CategoryKind, RecordStatus } from "../../domain/enums";
import { getUserCategories, getUserCategory } from "../paths";

export async function listCategories(uid) {
  const snapshot = await getDocs(query(getUserCategories(uid), orderBy("name", "asc")));

  return snapshot.docs
    .map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    }))
    .filter((category) => category.status !== RecordStatus.ARCHIVED);
}

export async function createCategory(uid, values) {
  const now = serverTimestamp();
  const categoryRef = await addDoc(getUserCategories(uid), {
    color: values.color || "#855400",
    createdAt: now,
    icon: values.icon || "🏷️",
    isDefault: false,
    kind: values.kind || CategoryKind.EXPENSE,
    name: values.name.trim(),
    status: RecordStatus.ACTIVE,
    updatedAt: now,
  });

  return categoryRef.id;
}

export async function updateCategory(uid, categoryId, values) {
  const payload = {
    updatedAt: serverTimestamp(),
  };

  if (values.color) payload.color = values.color;
  if (values.icon) payload.icon = values.icon;
  if (values.kind) payload.kind = values.kind;
  if (values.name) payload.name = values.name.trim();

  await updateDoc(getUserCategory(uid, categoryId), payload);
}

export async function archiveCategory(uid, categoryId) {
  await updateDoc(getUserCategory(uid, categoryId), {
    archivedAt: serverTimestamp(),
    status: RecordStatus.ARCHIVED,
    updatedAt: serverTimestamp(),
  });
}

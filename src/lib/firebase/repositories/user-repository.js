import { getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { getUserProfile, getUserRoot } from "../paths";

export async function ensureUserProfile({ user }) {
  if (!user?.uid) {
    throw new Error("Se requiere un usuario autenticado para crear el perfil.");
  }

  const userRootRef = getUserRoot(user.uid);
  const profileRef = getUserProfile(user.uid);
  const profileSnapshot = await getDoc(profileRef);
  const now = serverTimestamp();

  await setDoc(
    userRootRef,
    {
      email: user.email ?? "",
      updatedAt: now,
      uid: user.uid,
    },
    { merge: true },
  );

  await setDoc(
    profileRef,
    {
      createdAt: profileSnapshot.exists() ? profileSnapshot.data().createdAt : now,
      email: user.email ?? "",
      uid: user.uid,
      updatedAt: now,
    },
    { merge: true },
  );
}

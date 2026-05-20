import { getDocs, orderBy, query } from "firebase/firestore";

import { getUserCategories } from "../paths";

export async function listCategories(uid) {
  const snapshot = await getDocs(query(getUserCategories(uid), orderBy("name", "asc")));

  return snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...docSnapshot.data(),
  }));
}

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { STAFF_ROLES } from "../constants";

// The team rarely changes during a session: load it once and share it across components.
let cachedStaff = null;
let pending = null;

function loadStaff() {
  if (!pending) {
    pending = getDocs(query(collection(db, "users"), where("role", "in", STAFF_ROLES)))
      .then((snapshot) => {
        cachedStaff = snapshot.docs
          .map((d) => ({ id: d.id, name: d.data().name, role: d.data().role }))
          .sort((a, b) => a.name.localeCompare(b.name));
        return cachedStaff;
      })
      .catch((error) => {
        pending = null; // allow a later retry
        throw error;
      });
  }
  return pending;
}

/** Agents and admins, sorted by name, for the assignee dropdowns. */
export function useStaff() {
  const [state, setState] = useState({ staff: cachedStaff ?? [], error: null });

  useEffect(() => {
    if (cachedStaff) return undefined;
    let active = true;
    loadStaff()
      .then((staff) => active && setState({ staff, error: null }))
      .catch((error) => {
        console.error("Failed to load the support team", error);
        if (active) setState({ staff: [], error });
      });
    return () => {
      active = false;
    };
  }, []);

  return { staff: state.staff, loading: !cachedStaff && !state.error, error: state.error };
}

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./authContextValue";
import { useUserProfile } from "../hooks/useUserProfile";
import { signInWithEmail, signOutUser, subscribeToAuthChanges } from "../services/authService";
import { isValidRole } from "../utils/roles";

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(
    () =>
      subscribeToAuthChanges((user) => {
        setFirebaseUser(user);
        setAuthReady(true);
      }),
    [],
  );

  const { profile, missing, error: profileError } = useUserProfile(firebaseUser?.uid);
  const usableProfile = profile && isValidRole(profile.role) ? profile : null;
  const accountUnusable = missing || Boolean(profileError) || Boolean(profile && !usableProfile);

  // A signed-in user without a valid users/{uid} doc can't use the app: sign them out.
  useEffect(() => {
    if (!accountUnusable) return;
    toast.error(
      profileError ? "We couldn't load your account. Please sign in again." : "Account not set up",
      { id: "account-unusable" },
    );
    signOutUser().catch((error) => console.error("Sign-out after unusable account failed", error));
  }, [accountUnusable, profileError]);

  const signIn = useCallback((email, password) => signInWithEmail(email, password), []);

  const signOut = useCallback(async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Sign-out failed", error);
      toast.error("We couldn't sign you out. Please try again.");
    }
  }, []);

  const value = useMemo(
    () => ({
      firebaseUser,
      profile: usableProfile,
      role: usableProfile?.role ?? null,
      // Stay "loading" until we know who the user is AND have their profile, so protected
      // pages never flash the login screen on refresh.
      loading: !authReady || Boolean(firebaseUser && !usableProfile),
      signIn,
      signOut,
    }),
    [firebaseUser, usableProfile, authReady, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

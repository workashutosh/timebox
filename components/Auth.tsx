"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";

export default function Auth() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Auth State Changed:", user);
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    console.log("Auth Instance Before Sign-In:", auth); // Debug
    console.log("Provider:", provider); // Debug
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Sign-In Success:", result.user);
    } catch (error) {
      console.error("Sign-In Error Details:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("Signed Out Successfully");
    } catch (error) {
      console.error("Sign-Out Error:", error);
    }
  };

  return (
    <div className="flex gap-4">
      {user ? (
        <>
          <span>Welcome, {user.displayName}</span>
          <Button onClick={handleSignOut}>Sign Out</Button>
        </>
      ) : (
        <Button onClick={signInWithGoogle}>Sign in with Google</Button>
      )}
    </div>
  );
}
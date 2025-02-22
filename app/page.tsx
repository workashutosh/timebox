"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        router.push("/dashboard"); // Redirect to dashboard if signed in
      }
    });
    return () => unsubscribe();
  }, [router]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 flex flex-col items-center justify-center p-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl mb-12"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-indigo-900 mb-4">
          Master Your Time with Timebox
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-6">
          Boost productivity with a method backed by Harvard experts. Focus smarter, achieve more—start for free today.
        </p>
        <Button
          onClick={signInWithGoogle}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full text-lg"
        >
          Try for Free
        </Button>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl"
      >
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-indigo-800">Harvard’s Timeboxing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Break your day into focused blocks. Inspired by Harvard research, Timebox helps you prioritize and conquer tasks efficiently.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-indigo-800">Effortless Task Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Add tasks, set durations, and track progress with a sleek, intuitive interface. Productivity has never felt this elegant.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-indigo-800">Sync Across Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Sign in with Google and access your tasks anywhere, anytime. Your focus follows you seamlessly.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-12 text-gray-500 text-sm"
      >
        <p>© 2025 Timebox. Inspired by the best productivity minds.</p>
      </motion.footer>
    </div>
  );
}
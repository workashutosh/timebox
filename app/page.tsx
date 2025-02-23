"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        router.push("/dashboard");
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-indigo-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-50 z-0"></div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl mb-8 z-10"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-900 mb-3 drop-shadow-md">
          Master Your Time with <span className="text-indigo-600">Timebox</span>
        </h1>
        <p className="text-md md:text-lg text-gray-700 mb-4 font-light italic drop-shadow-sm">
          Unleash your productivity with Harvard-backed timeboxing. Focus smarter, achieve more—start your journey today.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={signInWithGoogle}
            className="bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-2 rounded-full text-md shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <FcGoogle className="w-5 h-5" /> Sign in with Google
          </Button>
          <Button
            onClick={signInWithGoogle}
            variant="outline"
            className="border-indigo-700 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 px-6 py-2 rounded-full text-md shadow-md transition-all duration-300"
          >
            Try for Free
          </Button>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl z-10"
      >
        <Card className="bg-white/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-shadow rounded-lg">
          <CardHeader className="p-4">
            <CardTitle className="text-indigo-800 text-lg font-semibold">Harvard's Timeboxing</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-gray-600 text-sm">
              Break your day into focused blocks. Inspired by Harvard research, Timebox helps you prioritize and conquer tasks efficiently.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-shadow rounded-lg">
          <CardHeader className="p-4">
            <CardTitle className="text-indigo-800 text-lg font-semibold">Effortless Task Management</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-gray-600 text-sm">
              Add tasks, set durations, and track progress with a sleek, intuitive interface. Productivity has never felt this elegant.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm shadow-md hover:shadow-xl transition-shadow rounded-lg">
          <CardHeader className="p-4">
            <CardTitle className="text-indigo-800 text-lg font-semibold">Sync Across Devices</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-gray-600 text-sm">
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
        className="mt-8 text-gray-500 text-xs z-10"
      >
        <p>© 2025 Timebox. Inspired by the best productivity minds.</p>
      </motion.footer>
    </div>
  );
}
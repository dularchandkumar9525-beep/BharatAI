"use client";

import { useState, useEffect } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";

type Scheme = {
  scheme_name: string;
  benefit_summary: string;
  eligibility: string;
  how_to_apply: string;
  apply_url?: string;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [formData, setFormData] = useState({
    age: "",
    gender: "Female",
    state: "Uttar Pradesh",
    income: "Under 2 Lakhs",
    category: "OBC",
  });

  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const update = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.age) {
      setError("Please enter your age.");
      return;
    }

    setLoading(true);
    setError("");
    setSchemes([]);

    try {
      let token = "";
      if (user) {
        token = await user.getIdToken();
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/find-schemes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...formData,
          age: Number(formData.age),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "API Error");
      }

      const result = typeof data.result === "string" ? JSON.parse(data.result) : data.result;
      setSchemes(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(err);
      setError("Backend se connection nahi ho pa raha hai. Please backend check karke dubara try karein.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F0] text-slate-700 font-medium">
        <p className="animate-pulse text-base">BharatAI Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex flex-col items-center justify-between p-4 relative overflow-hidden font-sans">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="text-center mt-6 z-10">
          <h1 className="text-3xl font-extrabold text-[#0B2545] flex items-center justify-center gap-2">
            BharatAI <span className="text-2xl">🇮🇳</span>
          </h1>
          <h2 className="text-lg font-bold text-[#134074] mt-1">
            Sarkari Yojanao Ka Naya Digital Portal
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Digital Gateway to Government Schemes
          </p>
        </div>

        <div className="z-20 w-full max-w-sm bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-[#EEE4D3] text-center my-auto">
          <h3 className="text-xl font-bold text-[#134074] mb-2">
            Welcome to BharatAI
          </h3>
          
          <p className="text-xs font-semibold text-gray-700 mb-3">
            Apne liye relevant Sarkari Yojana dhoondhne ke liye sign in karein.
          </p>

          <p className="text-[10px] text-gray-500 mb-4 leading-relaxed px-2">
            We prioritize your data privacy. Our platform uses only the necessary secure authentication data provided by Google.
          </p>

          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-[#E5D3A1] hover:bg-[#d8c48f] text-[#0B2545] font-bold py-2.5 px-4 rounded-xl shadow-md border border-[#D4C290] flex items-center justify-center gap-2 transition-all active:scale-95 mb-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span className="text-sm">Continue with Google</span>
          </button>

          <p className="text-[10px] text-gray-500 mb-1">
            New here? Your Google account will automatically create your BharatAI profile.
          </p>

          <p className="text-[10px] text-gray-400 mb-4">
            Your Google account is used only for secure authentication.
          </p>

          <p className="text-[10px] text-gray-600 mb-3">
            By signing in, you agree to our{' '}
            <a href="#" className="underline font-semibold text-[#134074]">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="underline font-semibold text-[#134074]">Privacy Policy</a>.
          </p>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[9px] text-gray-500 font-medium">
            <span>🏛️</span>
            <span>Official Platform for Scheme Discovery</span>
          </div>
        </div>

        <div className="text-center text-[10px] text-gray-400 mb-2 z-10">
          © 2026 BharatAI • Secure Authentication Portal
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {user.photoURL && (
            <img src={user.photoURL} alt="User Profile" className="h-9 w-9 rounded-full border border-gray-300" />
          )}
          <span className="font-semibold text-gray-800 text-sm md:text-base">
            Welcome, {user.displayName || user.email} 👋
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-xl bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 text-xs font-bold transition border border-red-200"
        >
          Logout
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-900 sm:text-5xl">
            BharatAI Helper
          </h1>
          <p className="mt-3 text-base text-gray-600 sm:text-lg">
            Aapki profile ke hisaab se relevant Sarkari Yojana dhoondhiye.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Personal Details Bharein</h2>
            <p className="mt-1 text-sm text-gray-500">
              Better profile details se better scheme recommendations milengi.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">Age</label>
              <input
                type="number"
                min="1"
                max="120"
                required
                value={formData.age}
                onChange={(e) => update("age", e.target.value)}
                placeholder="e.g. 25"
                className="w-full rounded-xl border border-gray-300 bg-white p-3.5 text-gray-900 outline-none transition focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => update("gender", e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white p-3.5 text-gray-900 outline-none transition focus:border-blue-600"
              >
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">State / Mool Niwas</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => update("state", e.target.value)}
                placeholder="e.g. Uttar Pradesh"
                className="w-full rounded-xl border border-gray-300 bg-white p-3.5 text-gray-900 outline-none transition focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">Annual Income</label>
              <select
                value={formData.income}
                onChange={(e) => update("income", e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white p-3.5 text-gray-900 outline-none transition focus:border-blue-600"
              >
                <option>Under 1 Lakh</option>
                <option>Under 2 Lakhs</option>
                <option>2 - 5 Lakhs</option>
                <option>5 - 10 Lakhs</option>
                <option>Above 10 Lakhs</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-800">Category</label>
              <select
                value={formData.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white p-3.5 text-gray-900 outline-none transition focus:border-blue-600"
              >
                <option>General</option>
                <option>OBC</option>
                <option>SC</option>
                <option>ST</option>
                <option>EWS</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full rounded-xl bg-blue-700 py-4 text-base font-bold text-white shadow-lg transition hover:bg-blue-800 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? "🔍 Schemes search ho rahi hain..." : "✨ Sarkari Schemes Dhundhein"}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            🚨 {error}
          </div>
        )}

        {schemes.length > 0 && (
          <section className="mt-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Aapke Liye Relevant Schemes</h2>
            <div className="space-y-6">
              {schemes.map((scheme, index) => (
                <article key={index} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-md">
                  <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-green-50 p-6">
                    <h3 className="text-xl font-extrabold text-gray-900">{scheme.scheme_name}</h3>
                  </div>
                  <div className="space-y-4 p-6">
                    <div>
                      <p className="font-bold text-emerald-800">🎁 Benefit</p>
                      <p className="text-gray-700 mt-1">{scheme.benefit_summary}</p>
                    </div>
                    <div>
                      <p className="font-bold text-blue-800">✅ Eligibility</p>
                      <p className="text-gray-700 mt-1">{scheme.eligibility}</p>
                    </div>
                    <div>
                      <p className="font-bold text-amber-800">📝 How to Apply</p>
                      <p className="text-gray-700 mt-1">{scheme.how_to_apply}</p>
                    </div>
                    {scheme.apply_url && (
                      <div className="border-t border-gray-100 pt-4">
                        <a
                          href={scheme.apply_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 font-bold text-white hover:bg-green-700"
                        >
                          🔗 Official Website / Apply Now
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <footer className="py-10 text-center text-xs text-gray-500">
          <p>🇮🇳 BharatAI Helper</p>
        </footer>
      </div>
    </main>
  );
}

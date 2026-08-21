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

      const result =
        typeof data.result === "string"
          ? JSON.parse(data.result)
          : data.result;

      setSchemes(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error(err);
      setError("Backend se connection nahi ho pa raha. Please backend check karke dubara try karein.");
    } finally {
      setLoading(false);
    }
  };

  // 1. Loading Screen while Auth initializes
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700 font-medium">
        <p className="animate-pulse text-base">BharatAI Loading...</p>
      </div>
    );
  }

  // 2. Google Login Screen (If Not Logged In)
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col justify-between bg-slate-50 p-4 font-sans text-slate-800">
        <header className="pt-6 text-center">
          <div className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
            <span>BharatAI</span>
            <span className="text-xl">🇮🇳</span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-md">
          <div className="rounded-2xl bg-white p-8 shadow-xl border border-slate-200/80 text-center space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Welcome to BharatAI</h1>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Apne liye relevant Sarkari Yojana dhoondhne ke liye sign in karein.
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow-md active:scale-[0.99]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="space-y-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <p>New here? Your Google account will automatically create your BharatAI profile.</p>
              <p className="text-slate-400">Your Google account is used only for secure authentication.</p>
            </div>
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-slate-500">
          <div className="flex justify-center gap-4">
            <a href="#" className="hover:underline hover:text-slate-700">Privacy Policy</a>
            <span>·</span>
            <a href="#" className="hover:underline hover:text-slate-700">Terms of Use</a>
          </div>
        </footer>
      </div>
    );
  }

  // 3. Exact Original Application Interface (Logged In State)
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-green-50 px-4 py-8 text-gray-900">
      {/* User Header & Logout Bar */}
      <div className="mx-auto max-w-4xl flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {user.photoURL && (
            <img src={user.photoURL} alt="User Profile" className="h-9 w-9 rounded-full border border-gray-300" />
          )}
          <span className="font-semibold text-gray-800 text-sm sm:text-base">
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

      <div className="mx-auto max-w-4xl">
        {/* HEADER */}
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white text-5xl shadow-lg">
            🇮🇳
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-blue-900 sm:text-5xl">
            BharatAI Helper
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-base text-gray-600 sm:text-lg">
            Aapki profile ke hisaab se relevant Sarkari Yojana choondhiye.
          </p>

          <div className="mx-auto mt-4 flex max-w-md items-center justify-center gap-2 text-sm font-medium text-gray-500">
            <span>🇮🇳 Bharat</span>
            <span>•</span>
            <span>🤖 AI Powered</span>
            <span>•</span>
            <span>🏛️ Government Schemes</span>
          </div>
        </header>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-gray-200 bg-white p-5 shadow-xl sm:p-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Personal Details Bharein
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Better profile details se better scheme recommendations milengi.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* AGE */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Age
              </label>
              <input
                type="number"
                min="1"
                max="120"
                required
                value={formData.age}
                onChange={(e) => update("age", e.target.value)}
                placeholder="e.g. 21"
                className="w-full rounded-xl border border-gray-300 bg-white p-3.5 text-gray-900 outline-none transition focus:border-blue-600"
              />
            </div>

            {/* GENDER */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Gender
              </label>
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

            {/* STATE */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                State / Mool Niwas
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => update("state", e.target.value)}
                placeholder="e.g. Uttar Pradesh"
                className="w-full rounded-xl border border-gray-300 bg-white p-3.5 text-gray-900 outline-none transition focus:border-blue-600"
              />
            </div>

            {/* INCOME */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Annual Income
              </label>
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

            {/* CATEGORY */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Category
              </label>
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

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full rounded-xl bg-blue-700 py-4 text-base font-bold text-white shadow-lg transition hover:bg-blue-800 active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? "🔍 Schemes search ho rahi hain..." : "✨ Sarkari Schemes Dhundhein"}
          </button>

          <p className="mt-3 text-center text-xs text-gray-500">
            AI recommendations ko apply karne se pehle official website par eligibility verify karein.
          </p>
        </form>

        {/* ERROR */}
        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            ❌ {error}
          </div>
        )}

        {/* RESULTS */}
        {schemes.length > 0 && (
          <section className="mt-10">
            <div className="mb-6 rounded-2xl border border-green-100 bg-green-50 p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                  ✓
                </span>
                <p className="text-sm font-bold text-green-700">Search Complete</p>
              </div>

              <h2 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                Aapke Liye Relevant Schemes
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Aapki profile ke basis par milne wali government schemes neeche di gayi hain. Apply karne se pehle official portal par eligibility verify karein.
              </p>
            </div>

            <div className="space-y-6">
              {schemes.map((scheme, index) => (
                <article
                  key={index}
                  className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-md transition duration-200 hover:-translate-y-1"
                >
                  <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 via-white to-green-50 p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-xl shadow-sm">
                        🏛️
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
                          Government Scheme
                        </p>
                        <h3 className="mt-1 text-xl font-extrabold leading-snug text-gray-900 sm:text-2xl">
                          {scheme.scheme_name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 p-5 sm:p-6">
                    <div className="rounded-2xl bg-emerald-50 p-4">
                      <p className="font-bold text-emerald-800">💰 Benefit</p>
                      <p className="mt-2 leading-7 text-gray-700">
                        {scheme.benefit_summary}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-blue-50 p-4">
                      <p className="font-bold text-blue-800">✅ Eligibility</p>
                      <p className="mt-2 leading-7 text-gray-700">
                        {scheme.eligibility}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-amber-50 p-4">
                      <p className="font-bold text-amber-800">📝 How to Apply</p>
                      <p className="mt-2 leading-7 text-gray-700">
                        {scheme.how_to_apply}
                      </p>
                    </div>

                    {scheme.apply_url && (
                      <div className="border-t border-gray-100 pt-5">
                        <a
                          href={scheme.apply_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 font-bold text-white transition hover:bg-green-700"
                        >
                          🔗 Official Website / Apply Now
                        </a>
                        <p className="mt-3 text-xs text-gray-400">Official link:</p>
                        <p className="mt-1 break-all text-xs text-gray-500">
                          {scheme.apply_url}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="py-10 text-center text-xs text-gray-500">
          <p>🇮🇳 BharatAI Helper</p>
          <p className="mt-1">
            Sarkari schemes ki information ko official portal par verify karein.
          </p>
        </footer>
      </div>
    </main>
  );
}

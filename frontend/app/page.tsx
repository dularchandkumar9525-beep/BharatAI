"use client";

import { useState } from "react";

type Scheme = {
  scheme_name: string;
  benefit_summary: string;
  eligibility: string;
  how_to_apply: string;
  apply_url?: string;
};

export default function Home() {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/find-schemes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      setError(
        "Backend se connection nahi ho pa raha. Please backend check karke dobara try karein."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-green-50 px-4 py-8 text-gray-900">
      <div className="mx-auto max-w-4xl">

        {/* HEADER */}
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white text-5xl shadow-lg">
            🇮🇳
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-blue-800 sm:text-5xl">
            BharatAI Helper
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-base text-gray-600 sm:text-lg">
            Aapki profile ke hisaab se relevant Sarkari Yojana dhoondhiye.
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
              Apni Details Bharein
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
                className="w-full rounded-xl border border-gray-300 bg-white p-3.5 text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                className="w-full rounded-xl border border-gray-300 bg-white p-3.5 text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                className="w-full rounded-xl border border-gray-300 bg-white p-3.5 text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                className="w-full rounded-xl border border-gray-300 bg-white p-3.5 text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                className="w-full rounded-xl border border-gray-300 bg-white p-3.5 text-gray-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
            className="mt-7 w-full rounded-xl bg-blue-700 py-4 text-base font-bold text-white shadow-lg transition hover:bg-blue-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {loading
              ? "🔎 Schemes search ho rahi hain..."
              : "🇮🇳 Sarkari Schemes Dhundhein"}
          </button>

          <p className="mt-3 text-center text-xs text-gray-500">
            AI recommendations ko apply karne se pehle official website par
            eligibility verify karein.
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
                <p className="text-sm font-bold text-green-700">
                  Search Complete
                </p>
              </div>

              <h2 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                🎯 Aapke Liye Relevant Schemes
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                Aapki profile ke basis par milne wali government schemes neeche
                di gayi hain. Apply karne se pehle official portal par
                eligibility verify karein.
              </p>
            </div>

            <div className="space-y-6">
              {schemes.map((scheme, index) => (
                <article
                  key={index}
                  className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:shadow-xl"
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
                      <p className="font-bold text-emerald-800">
                        💰 Benefit
                      </p>
                      <p className="mt-2 leading-7 text-gray-700">
                        {scheme.benefit_summary}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-blue-50 p-4">
                      <p className="font-bold text-blue-800">
                        ✅ Eligibility
                      </p>
                      <p className="mt-2 leading-7 text-gray-700">
                        {scheme.eligibility}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-amber-50 p-4">
                      <p className="font-bold text-amber-800">
                        📝 How to Apply
                      </p>
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
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3.5 font-bold text-white shadow-md transition hover:bg-green-700 hover:shadow-lg sm:w-auto"
                        >
                          🌐 Official Website / Apply Now
                          <span aria-hidden="true">↗</span>
                        </a>

                        <p className="mt-3 text-xs text-gray-400">
                          Official link:
                        </p>

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

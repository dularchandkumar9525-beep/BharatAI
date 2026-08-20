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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.age) {
      setError("Age enter karo");
      return;
    }

    setLoading(true);
    setError("");
    setSchemes([]);

    try {
      const res = await fetch("http://192.0.0.4:8000/api/find-schemes", {
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

      setSchemes(result || []);
    } catch (err) {
      console.error(err);
      setError("Backend se connection nahi ho pa raha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-gray-900">
      <div className="mx-auto max-w-3xl">

        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">🇮🇳</div>
          <h1 className="text-4xl font-bold text-blue-700">
            BharatAI Helper
          </h1>
          <p className="mt-2 text-gray-600">
            Aapke liye Sarkari Yojana dhoondhiye
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border bg-white p-6 shadow-md"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Age
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={formData.age}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  age: e.target.value,
                })
              }
              placeholder="Enter your age"
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  gender: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
            >
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              State (Mool Niwas)
            </label>
            <input
              type="text"
              required
              value={formData.state}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  state: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
              placeholder="e.g. Uttar Pradesh"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Annual Income
            </label>
            <select
              value={formData.income}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  income: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
            >
              <option>Under 1 Lakh</option>
              <option>Under 2 Lakhs</option>
              <option>2 - 5 Lakhs</option>
              <option>5 - 10 Lakhs</option>
              <option>Above 10 Lakhs</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900"
            >
              <option>General</option>
              <option>OBC</option>
              <option>SC</option>
              <option>ST</option>
              <option>EWS</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading
              ? "🔎 Schemes search ho rahi hain..."
              : "🇮🇳 Schemes Dhundhein"}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {schemes.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">
              🎯 Aapke Liye Schemes
            </h2>

            <div className="space-y-4">
              {schemes.map((scheme, index) => (
                <article
                  key={index}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <h3 className="text-xl font-bold text-blue-700">
                    🏛️ {scheme.scheme_name}
                  </h3>

                  <div className="mt-4">
                    <p className="font-semibold text-gray-700">
                      💰 Benefit
                    </p>
                    <p className="mt-1 text-gray-600">
                      {scheme.benefit_summary}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="font-semibold text-gray-700">
                      ✅ Eligibility
                    </p>
                    <p className="mt-1 text-gray-600">
                      {scheme.eligibility}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="font-semibold text-gray-700">
                      📝 How to Apply
                    </p>
                    <p className="mt-1 text-gray-600">
                      {scheme.how_to_apply}
                    </p>

                    {scheme.apply_url && (
                      <a
                        href={scheme.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
                      >
                        🌐 Official Website / Apply Now
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

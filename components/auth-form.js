"use client";

import { useState } from "react";
import { signIn, signUp, resetPassword } from "../lib/auth";

export default function AuthForm({ mode = "signin" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (mode === "signin") {
        await signIn(email, password);
        setMessage("Giriş başarılı!");
      } else if (mode === "signup") {
        await signUp(email, password, displayName);
        setMessage("Hesap oluşturuldu! Lütfen e-postanızı doğrulayın.");
      } else if (mode === "reset") {
        await resetPassword(email);
        setMessage("Şifre sıfırlama e-postası gönderildi!");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {mode === "signin" && "Giriş Yap"}
        {mode === "signup" && "Hesap Oluştur"}
        {mode === "reset" && "Şifre Sıfırla"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium mb-1"
            >
              Ad Soyad
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            E-posta
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {mode !== "reset" && (
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Şifre
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            "İşlem yapılıyor..."
          ) : (
            <>
              {mode === "signin" && "Giriş Yap"}
              {mode === "signup" && "Hesap Oluştur"}
              {mode === "reset" && "Şifre Sıfırla"}
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}
    </div>
  );
}

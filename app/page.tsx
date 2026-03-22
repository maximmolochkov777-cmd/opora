"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Войди в приложение");

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Ошибка входа: " + error.message);
    } else {
      setMessage("Вход выполнен успешно");
    }
  }

  async function signInAnonymously() {
    const { error } = await supabase.auth.signInAnonymously();

    if (error) {
      setMessage("Ошибка анонимного входа: " + error.message);
    } else {
      setMessage("Анонимный вход выполнен успешно");
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "Arial, sans-serif", maxWidth: 420 }}>
      <h1>Опора</h1>
      <p>{message}</p>

      <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 12, fontSize: 16 }}
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 12, fontSize: 16 }}
        />

        <button
          onClick={signIn}
          style={{ padding: 12, fontSize: 16, cursor: "pointer" }}
        >
          Войти
        </button>

        <button
          onClick={signInAnonymously}
          style={{ padding: 12, fontSize: 16, cursor: "pointer" }}
        >
          Войти анонимно
        </button>
      </div>
    </main>
  );
}

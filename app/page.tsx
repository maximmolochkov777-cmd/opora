"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type UserState = {
  id: string;
} | null;

export default function HomePage() {
  const [user, setUser] = useState<UserState>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Войди в приложение");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser({ id: session.user.id });
        setMessage("Ты в приложении");
      }

      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id });
        setMessage("Ты в приложении");
      } else {
        setUser(null);
        setMessage("Войди в приложение");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

  async function signOut() {
    await supabase.auth.signOut();
    setMessage("Выход выполнен");
  }

  if (loading) {
    return (
      <main style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
        <h1>Опора</h1>
        <p>Загрузка...</p>
      </main>
    );
  }

  if (user) {
    return (
      <main style={{ padding: 24, fontFamily: "Arial, sans-serif", maxWidth: 520 }}>
        <h1>Опора</h1>
        <p>{message}</p>

        <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
          <button style={buttonStyle}>Тревожно</button>
          <button style={buttonStyle}>Нет сил</button>
          <button style={buttonStyle}>Самокритика</button>
          <button style={buttonStyle}>Хаос в голове</button>
          <button style={buttonStyle}>Пусто внутри</button>
          <button style={buttonStyle}>Тяжелая ситуация</button>
          <button style={buttonStyle}>Хочу выговориться</button>
          <button style={buttonStyle}>Мне плохо прямо сейчас</button>
        </div>

        <button
          onClick={signOut}
          style={{
            ...buttonStyle,
            marginTop: 20,
            background: "#f1f1f1"
          }}
        >
          Выйти
        </button>
      </main>
    );
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
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={signIn} style={buttonStyle}>
          Войти
        </button>

        <button onClick={signInAnonymously} style={buttonStyle}>
          Войти анонимно
        </button>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: 16,
  fontSize: 16,
  borderRadius: 12,
  border: "1px solid #ccc",
};

const buttonStyle: React.CSSProperties = {
  padding: 16,
  fontSize: 16,
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  background: "#e9e9e9",
};

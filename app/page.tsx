"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type UserState = {
  id: string;
} | null;

type MoodKey =
  | "anxiety"
  | "low_energy"
  | "self_criticism"
  | "mental_overload"
  | "emptiness"
  | "hard_situation"
  | "talk_out"
  | "urgent";

const moodContent: Record<MoodKey, { title: string; text: string }> = {
  anxiety: {
    title: "Тревожно",
    text: "Похоже, тебе сейчас тревожно. Не нужно решать всю жизнь сразу. Давай сначала просто немного снизим напряжение и вернуть ощущение опоры.",
  },
  low_energy: {
    title: "Нет сил",
    text: "Сейчас тебе может не хватать ресурса. Это не обязательно лень. Иногда организму и психике просто нужен более мягкий режим и один маленький шаг вместо большого давления.",
  },
  self_criticism: {
    title: "Самокритика",
    text: "Похоже, ты сейчас очень жестко к себе относишься. Это не помогает тебе собраться. Давай попробуем перейти от давления к более честному и спокойному взгляду на себя.",
  },
  mental_overload: {
    title: "Хаос в голове",
    text: "Когда мыслей слишком много, сложно опереться на себя. Сейчас не нужно разобрать всё сразу. Нужно выбрать одну главную точку и снизить перегруз.",
  },
  emptiness: {
    title: "Пусто внутри",
    text: "Иногда внутри становится пусто, и человек теряет контакт с собой. В такой момент важно не требовать от себя мгновенной мотивации, а бережно вернуть ощущение жизни шаг за шагом.",
  },
  hard_situation: {
    title: "Тяжелая ситуация",
    text: "Сейчас у тебя, похоже, непростой период. Тебе не нужно тащить всё одному и решать всё за один день. Давай сосредоточимся на том, что поможет тебе удержаться и не развалиться еще сильнее.",
  },
  talk_out: {
    title: "Хочу выговориться",
    text: "Иногда больше всего нужно просто выговориться без страха, что тебя осудят. Это нормально. Следующим шагом мы можем сделать экран, где ты сможешь написать, что у тебя происходит.",
  },
  urgent: {
    title: "Мне плохо прямо сейчас",
    text: "Сейчас не нужно решать все сразу. Сначала нужно немного стабилизировать состояние: медленный вдох, выдох, вода, опора под ногами и один понятный следующий шаг.",
  },
};

export default function HomePage() {
  const [user, setUser] = useState<UserState>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Войди в приложение");
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);

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
    setSelectedMood(null);
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
    if (selectedMood) {
      const mood = moodContent[selectedMood];

      return (
        <main style={{ padding: 24, fontFamily: "Arial, sans-serif", maxWidth: 560 }}>
          <h1>Опора</h1>
          <h2 style={{ marginTop: 24 }}>{mood.title}</h2>
          <p style={{ fontSize: 20, lineHeight: 1.5, marginTop: 16 }}>{mood.text}</p>

          <button
            onClick={() => setSelectedMood(null)}
            style={{ ...buttonStyle, marginTop: 24 }}
          >
            Назад
          </button>

          <button
            onClick={signOut}
            style={{
              ...buttonStyle,
              marginTop: 12,
              background: "#f1f1f1",
            }}
          >
            Выйти
          </button>
        </main>
      );
    }

    return (
      <main style={{ padding: 24, fontFamily: "Arial, sans-serif", maxWidth: 520 }}>
        <h1>Опора</h1>
        <p>{message}</p>

        <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
          <button style={buttonStyle} onClick={() => setSelectedMood("anxiety")}>
            Тревожно
          </button>
          <button style={buttonStyle} onClick={() => setSelectedMood("low_energy")}>
            Нет сил
          </button>
          <button style={buttonStyle} onClick={() => setSelectedMood("self_criticism")}>
            Самокритика
          </button>
          <button style={buttonStyle} onClick={() => setSelectedMood("mental_overload")}>
            Хаос в голове
          </button>
          <button style={buttonStyle} onClick={() => setSelectedMood("emptiness")}>
            Пусто внутри
          </button>
          <button style={buttonStyle} onClick={() => setSelectedMood("hard_situation")}>
            Тяжелая ситуация
          </button>
          <button style={buttonStyle} onClick={() => setSelectedMood("talk_out")}>
            Хочу выговориться
          </button>
          <button style={buttonStyle} onClick={() => setSelectedMood("urgent")}>
            Мне плохо прямо сейчас
          </button>
        </div>

        <button
          onClick={signOut}
          style={{
            ...buttonStyle,
            marginTop: 20,
            background: "#f1f1f1",
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

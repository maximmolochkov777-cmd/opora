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

type ScreenMode = "home" | "mood" | "talk" | "journal";

const moodContent: Record<Exclude<MoodKey, "talk_out">, { title: string; text: string }> = {
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
  urgent: {
    title: "Мне плохо прямо сейчас",
    text: "Сейчас не нужно решать все сразу. Сначала нужно немного стабилизировать состояние: медленный вдох, выдох, вода, опора под ногами и один понятный следующий шаг.",
  },
};

function getSupportReply(text: string) {
  const value = text.trim().toLowerCase();

  if (!value) {
    return "Ты можешь написать всё как есть. Даже если мысли спутаны — это нормально.";
  }

  if (value.includes("трев") || value.includes("страш")) {
    return "Я тебя услышал. Похоже, сейчас много тревоги. Давай не будем решать всё сразу. Сначала важно немного снизить напряжение и назвать, что пугает сильнее всего.";
  }

  if (value.includes("устал") || value.includes("нет сил") || value.includes("не могу")) {
    return "Похоже, у тебя сейчас мало ресурса. Это не обязательно слабость. Иногда человеку сначала нужна опора, отдых и только потом решения.";
  }

  if (value.includes("один") || value.includes("никого")) {
    return "Чувство одиночества очень тяжело переносится. Спасибо, что написал это. Даже сам факт, что ты не держишь всё внутри, уже важный шаг.";
  }

  if (value.includes("не знаю") || value.includes("запут")) {
    return "Сейчас у тебя может быть внутренний хаос. Не нужно сразу во всем разобраться. Давай начнем с одного: что болит сильнее всего именно сейчас?";
  }

  return "Спасибо, что написал. Я тебя услышал. То, что с тобой происходит, имеет значение. Сейчас не нужно быть идеальным — достаточно честно назвать, что тебе тяжело.";
}

export default function HomePage() {
  const [user, setUser] = useState<UserState>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Войди в приложение");
  const [loading, setLoading] = useState(true);

  const [screenMode, setScreenMode] = useState<ScreenMode>("home");
  const [selectedMood, setSelectedMood] = useState<Exclude<MoodKey, "talk_out"> | null>(null);

  const [talkText, setTalkText] = useState("");
  const [talkReply, setTalkReply] = useState("");

  const [feeling, setFeeling] = useState("");
  const [happened, setHappened] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [journalMessage, setJournalMessage] = useState("");

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
        setScreenMode("home");
        setSelectedMood(null);
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
    setScreenMode("home");
    setSelectedMood(null);
    setTalkText("");
    setTalkReply("");
    setFeeling("");
    setHappened("");
    setNextStep("");
    setJournalMessage("");
  }

  function openMood(mood: Exclude<MoodKey, "talk_out">) {
    setSelectedMood(mood);
    setScreenMode("mood");
  }

  function openTalkOut() {
    setTalkText("");
    setTalkReply("");
    setScreenMode("talk");
  }

  function openJournal() {
    setJournalMessage("");
    setScreenMode("journal");
  }

  function handleTalkSubmit() {
    setTalkReply(getSupportReply(talkText));
  }

  function saveJournal() {
    if (!feeling.trim() && !happened.trim() && !nextStep.trim()) {
      setJournalMessage("Заполни хотя бы одно поле.");
      return;
    }

    setJournalMessage("Запись сохранена.");
    setFeeling("");
    setHappened("");
    setNextStep("");
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
    if (screenMode === "talk") {
      return (
        <main style={{ padding: 24, fontFamily: "Arial, sans-serif", maxWidth: 700 }}>
          <h1>Опора</h1>
          <h2 style={{ marginTop: 24 }}>Хочу выговориться</h2>
          <p style={{ fontSize: 20, lineHeight: 1.5, marginTop: 16 }}>
            Можешь написать всё как есть. Без красивых формулировок. Без страха выглядеть слабым.
          </p>

          <textarea
            value={talkText}
            onChange={(e) => setTalkText(e.target.value)}
            placeholder="Что у тебя происходит?"
            style={{
              width: "100%",
              minHeight: 160,
              marginTop: 20,
              padding: 16,
              fontSize: 18,
              borderRadius: 12,
              border: "1px solid #ccc",
              resize: "vertical",
            }}
          />

          <button onClick={handleTalkSubmit} style={{ ...buttonStyle, marginTop: 16 }}>
            Отправить
          </button>

          {talkReply ? (
            <div
              style={{
                marginTop: 20,
                padding: 20,
                borderRadius: 16,
                background: "#f3f3f3",
                fontSize: 22,
                lineHeight: 1.5,
              }}
            >
              {talkReply}
            </div>
          ) : null}

          <button onClick={() => setScreenMode("home")} style={{ ...buttonStyle, marginTop: 20 }}>
            Назад
          </button>

          <button
            onClick={signOut}
            style={{ ...buttonStyle, marginTop: 12, background: "#f1f1f1" }}
          >
            Выйти
          </button>
        </main>
      );
    }

    if (screenMode === "journal") {
      return (
        <main style={{ padding: 24, fontFamily: "Arial, sans-serif", maxWidth: 720 }}>
          <h1>Опора</h1>
          <h2 style={{ marginTop: 24 }}>Дневник состояния</h2>
          <p style={{ fontSize: 20, lineHeight: 1.5, marginTop: 16 }}>
            Здесь можно коротко зафиксировать, что с тобой происходит.
          </p>

          <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
            <textarea
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              placeholder="Что я чувствую?"
              style={textareaStyle}
            />

            <textarea
              value={happened}
              onChange={(e) => setHappened(e.target.value)}
              placeholder="Что произошло?"
              style={textareaStyle}
            />

            <textarea
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              placeholder="Что я сделаю дальше?"
              style={textareaStyle}
            />
          </div>

          <button onClick={saveJournal} style={{ ...buttonStyle, marginTop: 20 }}>
            Сохранить
          </button>

          {journalMessage ? (
            <p style={{ marginTop: 16, fontSize: 22 }}>{journalMessage}</p>
          ) : null}

          <button onClick={() => setScreenMode("home")} style={{ ...buttonStyle, marginTop: 20 }}>
            Назад
          </button>

          <button
            onClick={signOut}
            style={{ ...buttonStyle, marginTop: 12, background: "#f1f1f1" }}
          >
            Выйти
          </button>
        </main>
      );
    }

    if (screenMode === "mood" && selectedMood) {
      const mood = moodContent[selectedMood];

      return (
        <main style={{ padding: 24, fontFamily: "Arial, sans-serif", maxWidth: 560 }}>
          <h1>Опора</h1>
          <h2 style={{ marginTop: 24 }}>{mood.title}</h2>
          <p style={{ fontSize: 20, lineHeight: 1.5, marginTop: 16 }}>{mood.text}</p>

          <button onClick={() => setScreenMode("home")} style={{ ...buttonStyle, marginTop: 24 }}>
            Назад
          </button>

          <button
            onClick={signOut}
            style={{ ...buttonStyle, marginTop: 12, background: "#f1f1f1" }}
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
          <button style={buttonStyle} onClick={() => openMood("anxiety")}>
            Тревожно
          </button>
          <button style={buttonStyle} onClick={() => openMood("low_energy")}>
            Нет сил
          </button>
          <button style={buttonStyle} onClick={() => openMood("self_criticism")}>
            Самокритика
          </button>
          <button style={buttonStyle} onClick={() => openMood("mental_overload")}>
            Хаос в голове
          </button>
          <button style={buttonStyle} onClick={() => openMood("emptiness")}>
            Пусто внутри
          </button>
          <button style={buttonStyle} onClick={() => openMood("hard_situation")}>
            Тяжелая ситуация
          </button>
          <button style={buttonStyle} onClick={openTalkOut}>
            Хочу выговориться
          </button>
          <button style={buttonStyle} onClick={() => openMood("urgent")}>
            Мне плохо прямо сейчас
          </button>
          <button style={buttonStyle} onClick={openJournal}>
            Дневник
          </button>
        </div>

        <button
          onClick={signOut}
          style={{ ...buttonStyle, marginTop: 20, background: "#f1f1f1" }}
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

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 120,
  padding: 16,
  fontSize: 18,
  borderRadius: 12,
  border: "1px solid #ccc",
  resize: "vertical",
};

const buttonStyle: React.CSSProperties = {
  padding: 16,
  fontSize: 16,
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  background: "#e9e9e9",
};

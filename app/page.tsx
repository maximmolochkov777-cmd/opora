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

type ScreenMode = "home" | "mood" | "talk" | "journal" | "chat";

type JournalEntry = {
  id: string;
  feeling: string | null;
  happened: string | null;
  next_step: string | null;
  created_at: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

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

function getChatReply(text: string) {
  const value = text.trim().toLowerCase();

  if (!value) {
    return "Можешь написать коротко и как есть. Я рядом.";
  }

  if (value.includes("трев") || value.includes("паник") || value.includes("страх")) {
    return "Похоже, тебе сейчас тревожно. Давай не будем решать всё сразу. Что тревожит сильнее всего именно сейчас?";
  }

  if (value.includes("устал") || value.includes("нет сил") || value.includes("выгор")) {
    return "Слышу, что у тебя мало сил. Сейчас важнее не ругать себя, а понять, где уходит ресурс. Что сильнее всего тебя истощает?";
  }

  if (value.includes("работ") || value.includes("деньг")) {
    return "Тема работы и денег сильно давит на психику. Давай разделим: что срочно, а что пока просто висит фоном и давит?";
  }

  if (value.includes("один") || value.includes("одиноч")) {
    return "Одиночество переживается очень тяжело. Спасибо, что написал об этом. Что тебе сейчас нужнее: чтобы тебя выслушали или чтобы помогли разложить всё по шагам?";
  }

  return "Я тебя услышал. Давай спокойно разберем это вместе. Что в этой ситуации для тебя самое тяжелое?";
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
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [journalLoading, setJournalLoading] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Привет. Можешь написать всё как есть. Я рядом.",
    },
  ]);

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

  async function loadJournalEntries() {
    if (!user?.id) return;

    setJournalLoading(true);

    const { data, error } = await supabase
      .from("journal_entries")
      .select("id, feeling, happened, next_step, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setJournalEntries(data);
    }

    setJournalLoading(false);
  }

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
    setJournalEntries([]);
    setChatInput("");
    setChatMessages([
      {
        role: "assistant",
        content: "Привет. Можешь написать всё как есть. Я рядом.",
      },
    ]);
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

  async function openJournal() {
    setJournalMessage("");
    setScreenMode("journal");
    await loadJournalEntries();
  }

  function openChat() {
    setScreenMode("chat");
  }

  function handleTalkSubmit() {
    setTalkReply(getSupportReply(talkText));
  }

 async function sendChatMessage() {
  if (!chatInput.trim()) return;

  const userMessage = {
    role: "user" as const,
    content: chatInput,
  };

  setChatMessages((prev) => [...prev, userMessage]);

  const currentInput = chatInput;
  setChatInput("");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: currentInput }),
    });

    const data = await response.json();

    if (!response.ok) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Ошибка AI: " + (data.error || "не удалось получить ответ"),
        },
      ]);
      return;
    }

    setChatMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: data.reply || "Ответ не получен",
      },
    ]);
  } catch (error) {
    setChatMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Ошибка сети или сервера.",
      },
    ]);
  }
}
  const userMessage = {
    role: "user" as const,
    content: chatInput,
  };

  setChatMessages((prev) => [...prev, userMessage]);

  const currentInput = chatInput;
  setChatInput("");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: currentInput }),
    });

    const data = await response.json();

    if (!response.ok) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Ошибка AI: " + (data.error || "не удалось получить ответ"),
        },
      ]);
      return;
    }

    setChatMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: data.reply || "Ответ не получен",
      },
    ]);
  } catch (error) {
    setChatMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Ошибка сети или сервера.",
      },
    ]);
  }
}

    const userMessage: ChatMessage = {
      role: "user",
      content: chatInput,
    };

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: getChatReply(chatInput),
    };

    setChatMessages((prev) => [...prev, userMessage, assistantMessage]);
    setChatInput("");
  }

  async function saveJournal() {
    if (!user?.id) {
      setJournalMessage("Сначала нужно войти.");
      return;
    }

    if (!feeling.trim() && !happened.trim() && !nextStep.trim()) {
      setJournalMessage("Заполни хотя бы одно поле.");
      return;
    }

    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      feeling,
      happened,
      next_step: nextStep,
    });

    if (error) {
      setJournalMessage("Ошибка сохранения: " + error.message);
      return;
    }

    setJournalMessage("Запись сохранена в базу.");
    setFeeling("");
    setHappened("");
    setNextStep("");
    await loadJournalEntries();
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
    if (screenMode === "chat") {
      return (
        <main style={{ padding: 24, fontFamily: "Arial, sans-serif", maxWidth: 760 }}>
          <h1>Опора</h1>
          <h2 style={{ marginTop: 24 }}>AI-чат</h2>
          <p style={{ fontSize: 20, lineHeight: 1.5, marginTop: 16 }}>
            Можешь писать свободно. Я помогу разобрать состояние по шагам.
          </p>

          <div style={{ display: "grid", gap: 12, marginTop: 24 }}>
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                style={{
                  padding: 16,
                  borderRadius: 16,
                  background: msg.role === "assistant" ? "#f3f3f3" : "#e7eefc",
                  fontSize: 20,
                  lineHeight: 1.5,
                }}
              >
                <strong>{msg.role === "assistant" ? "Опора" : "Ты"}:</strong> {msg.content}
              </div>
            ))}
          </div>

          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Напиши, что у тебя происходит..."
            style={{ ...textareaStyle, marginTop: 20 }}
          />

          <button onClick={sendChatMessage} style={{ ...buttonStyle, marginTop: 16 }}>
            Отправить
          </button>

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

          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: 28 }}>Мои записи</h3>

            {journalLoading ? (
              <p style={{ fontSize: 20 }}>Загрузка записей...</p>
            ) : journalEntries.length === 0 ? (
              <p style={{ fontSize: 20 }}>Записей пока нет.</p>
            ) : (
              <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
                {journalEntries.map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      padding: 20,
                      borderRadius: 16,
                      background: "#f3f3f3",
                    }}
                  >
                    <p style={{ fontSize: 16, opacity: 0.7 }}>
                      {new Date(entry.created_at).toLocaleString()}
                    </p>
                    <p style={{ fontSize: 20, marginTop: 12 }}>
                      <strong>Чувствую:</strong> {entry.feeling || "—"}
                    </p>
                    <p style={{ fontSize: 20, marginTop: 8 }}>
                      <strong>Произошло:</strong> {entry.happened || "—"}
                    </p>
                    <p style={{ fontSize: 20, marginTop: 8 }}>
                      <strong>Следующий шаг:</strong> {entry.next_step || "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

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
          <button style={buttonStyle} onClick={openChat}>
            AI-чат
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

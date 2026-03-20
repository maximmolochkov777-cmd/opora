"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function HomePage() {
  const [message, setMessage] = useState("Нажми кнопку для проверки подключения");

  async function checkSupabase() {
    const { error } = await supabase.from("profiles").select("id").limit(1);

    if (error) {
      setMessage("Ошибка подключения к Supabase: " + error.message);
    } else {
      setMessage("Supabase подключен успешно");
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h1>Опора</h1>
      <p>{message}</p>
      <button
        onClick={checkSupabase}
        style={{
          padding: "12px 16px",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          marginTop: 12
        }}
      >
        Проверить Supabase
      </button>
    </main>
  );
}

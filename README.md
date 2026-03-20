# Опора — production starter

Стартовый production-пакет web-приложения «Опора».

## Что внутри
- Next.js 15 + TypeScript + Tailwind
- теплый UI для web MVP
- Supabase-заготовка для auth и хранения данных
- серверный API `/api/chat` для AI-диалога
- кризисная маршрутизация до ответа модели
- SQL-схема для профилей, дневника, чатов и настроек

## Быстрый старт
1. Скопируй `.env.example` в `.env.local`
2. Заполни:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
3. Установи зависимости:
   ```bash
   npm install
   ```
4. Запусти dev сервер:
   ```bash
   npm run dev
   ```

## Что доделать первым
- подключить реальные Supabase auth flows
- сохранять chat history и journal entries в БД
- добавить protected routes / dashboard
- подключить серверную модерацию и кризисный словарь
- сделать деплой на Vercel

## Рекомендуемая архитектура
- frontend: Next.js app router
- auth/storage: Supabase
- AI: OpenAI Responses API через server route
- deploy: Vercel

## Важный момент
Это приложение поддержки, а не замена экстренной помощи, психолога или врача.

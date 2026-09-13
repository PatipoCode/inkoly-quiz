# Підключення Supabase

Код і міграція вже в репозиторії. Тут — кроки, які треба зробити руками:
вони потребують вашого браузера, пароля бази і доступу до Google Cloud Console.

Локальна розробка працює без жодного з них: `npm run db:start` піднімає власний
стек у Docker з демо-квізом і тестовим ведучим (див. кінець файлу).

---

## 1. Лінк до хмарного проєкту

```bash
npx supabase login                      # відкриє браузер
npx supabase projects list              # звіряємо ref і РЕГІОН
npx supabase link --project-ref <ref>   # спитає пароль бази
```

⚠️ **Перевірте регіон одразу.** PRD §10.3 вимагає Frankfurt (eu-central) —
затримка реалтайму критична для гри з таймером, а регіон не змінюється
без створення нового проєкту. Якщо регіон інший, це рішення переглянути
зараз, поки в базі немає даних.

## 2. Накотити схему

```bash
npm run db:push      # supabase db push
npm run db:types     # регенерує app/types/database.generated.ts з linked-проєкту
```

`seed.sql` у хмару не потрапляє — він виконується тільки при локальному
`db reset`. Демо-квіз і тестовий користувач лишаються на вашій машині.

Типи мають лягти в коміт разом з міграцією: це перевіряє pre-commit хук.

## 3. Змінні оточення

`.env` (у git не потрапляє), значення з Dashboard → Project Settings → API:

```
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_KEY=<anon / publishable key>
```

`service_role`-ключ у фронтенд не потрапляє ніколи. Уся підвищена логіка
живе в `SECURITY DEFINER`-функціях бази (§4.9).

## 4. Google OAuth

**4.1. Google Cloud Console** → APIs & Services → Credentials →
Create credentials → OAuth client ID → Web application.

Authorized redirect URIs — додайте обидва рядки до одного клієнта:

```
https://<ref>.supabase.co/auth/v1/callback
http://127.0.0.1:54321/auth/v1/callback
```

Другий — для локального стека. Без нього локальний вхід через Google
не працюватиме, і доведеться повертатися сюди ще раз.

**4.2. Supabase Dashboard** → Authentication → Providers → Google:
увімкнути, вставити Client ID і Client Secret.

**4.3. Authentication → URL Configuration:**

| Поле          | Значення                              |
| ------------- | ------------------------------------- |
| Site URL      | `http://localhost:3000`               |
| Redirect URLs | `http://localhost:3000/auth/callback` |

Продакшн-домен додається сюди ж, коли з'явиться.

**4.4. Локальний стек** читає ті самі ключі зі змінних оточення —
додайте в `.env`:

```
SUPABASE_AUTH_GOOGLE_CLIENT_ID=...
SUPABASE_AUTH_GOOGLE_SECRET=...
```

Блок `[auth.external.google]` у `config.toml` уже на місці. Після зміни
`.env` потрібен `npx supabase stop && npm run db:start`.

## 5. Перевірка

1. `npm run dev` → `http://localhost:3000`
2. «Sign in with Google» → редірект на `/dashboard`
3. Dashboard → Authentication → Users: користувач з'явився
4. Table Editor → `profiles`: рядок створився тригером, `role = 'host'`
5. «New quiz» → рядок у `quizzes`, перехід у редактор
6. **Перевірка політик доступу:** у Table Editor вставте квіз з чужим
   `owner_id` — на `/dashboard` він не має з'явитися. Це перевіряє RLS,
   а не інтерфейс.

---

## Підвищення до суперадміна

Інтерфейсу для зміни ролей немає в жодній фазі (§2.4). Роль живе у двох
місцях і змінюється в обох одночасно — інакше токен і таблиця розійдуться:

```sql
update auth.users
   set raw_app_meta_data = raw_app_meta_data || '{"role":"superadmin"}'::jsonb
 where email = 'ваш@email';

update public.profiles
   set role = 'superadmin'
 where id = (select id from auth.users where email = 'ваш@email');
```

Роль потрапляє в токен при наступному вході. База не дозволить другого
суперадміна — на це є частковий унікальний індекс.

---

## Локальний стек

```bash
npm run db:start     # підніме Postgres, Auth, Realtime, Storage, Studio
npm run db:reset     # накотити міграції з нуля + seed
npm run db:types:local
npm run db:stop
```

| Сервіс          | Адреса                 |
| --------------- | ---------------------- |
| API             | http://127.0.0.1:54321 |
| Studio          | http://127.0.0.1:54323 |
| Пошта (тестова) | http://127.0.0.1:54324 |

Тестовий ведучий із seed: `host@local.test` / `password123`.
Демо-квіз — два етапи, обидва реалізовані типи відповіді.

Локальний стек не обов'язковий, але кожна міграція проти хмари йде по мережі,
а безкоштовний тариф засинає після тижня без активності.

-- Демо-дані для ЛОКАЛЬНОЇ розробки.
--
-- Виконується тільки під час `supabase db reset`. У хмарний проєкт не
-- потрапляє: `db push` накочує міграції і не чіпає seed.
--
-- Навіщо: щоб редактор і, згодом, ігровий цикл можна було відкрити одразу
-- після `db reset`, не проходячи щоразу через OAuth і не набиваючи квіз руками.

-- ---------------------------------------------------------------------------
-- Локальний ведучий: host@local.test / password123
--
-- Вхід за email і паролем, бо Google OAuth локально потребує реальних
-- ключів з Google Cloud Console. Профіль створиться сам — тригером
-- on_auth_user_created.
-- ---------------------------------------------------------------------------

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'host@local.test',
  extensions.crypt('password123', extensions.gen_salt('bf')),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Local Host"}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  ''
)
on conflict (id) do nothing;

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"host@local.test"}'::jsonb,
  'email',
  now(),
  now(),
  now()
)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Демо-квіз: два етапи, обидва реалізовані типи відповіді (§17.1)
-- ---------------------------------------------------------------------------

insert into public.quizzes (id, owner_id, title, description, default_points, tie_break_by_speed)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Demo quiz',
  'Seeded for local development',
  1,
  true
)
on conflict (id) do nothing;

insert into public.stages (id, quiz_id, position, title)
values
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222222', 1, 'Warm-up'),
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222222', 2, 'Final')
on conflict (id) do nothing;

insert into public.questions (
  id, stage_id, position, question_type, answer_type, text, time_mode, time_limit_sec, points
)
values
  (
    '44444444-4444-4444-4444-444444444401',
    '33333333-3333-3333-3333-333333333301',
    1,
    'text',
    'single_choice',
    'Which planet is closest to the Sun?',
    'fixed',
    30,
    1
  ),
  (
    '44444444-4444-4444-4444-444444444402',
    '33333333-3333-3333-3333-333333333302',
    1,
    'text',
    'text_input',
    'Who wrote "Kobzar"?',
    'unlimited',
    null,
    2
  )
on conflict (id) do nothing;

-- Варіанти для вибору одного.
--
-- Без `on conflict` навмисно: єдине унікальне обмеження тут — відкладене
-- (deferrable), а Postgres не вміє використовувати такі обмеження як арбітра
-- для ON CONFLICT. Seed і так виконується на чистій базі при `db reset`.
insert into public.question_options (question_id, position, text, is_correct)
values
  ('44444444-4444-4444-4444-444444444401', 1, 'Mercury', true),
  ('44444444-4444-4444-4444-444444444401', 2, 'Venus', false),
  ('44444444-4444-4444-4444-444444444401', 3, 'Mars', false),
  ('44444444-4444-4444-4444-444444444401', 4, 'Jupiter', false);

-- Для text_input тут лежать ПРИЙНЯТНІ варіанти відповіді (§6.3): ведучий
-- додає їх скільки завгодно, порівняння робить сервер після нормалізації.
insert into public.question_options (question_id, position, text, is_correct)
values
  ('44444444-4444-4444-4444-444444444402', 1, 'Taras Shevchenko', true),
  ('44444444-4444-4444-4444-444444444402', 2, 'Shevchenko', true),
  ('44444444-4444-4444-4444-444444444402', 3, 'Kobzar', true);

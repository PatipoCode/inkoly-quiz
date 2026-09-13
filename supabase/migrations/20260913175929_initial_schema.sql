-- Перша міграція: профілі та контент квізу.
--
-- Обсяг навмисно обмежений тим, що потрібно редактору. Таблиці гри
-- (rooms, participants, answers) ідуть окремою міграцією: вони залежать від
-- трьох рішень, ще не закритих у docs/contract.md — як автентифікуються
-- учасники, звідки летить Realtime Broadcast, звідки береться серверний час.
--
-- Посилання §… — на PRD «Онлайн-платформа для домашніх квізів» v2.2.

-- ============================================================================
-- Перелічувані типи (§4.1)
--
-- ПОВНИЙ перелік запланованих значень, включно з нереалізованими у фазі 1.
-- Додавання типу питання у фазі 2 = один модуль оцінювання + один компонент
-- вводу; схема при цьому не змінюється.
--
-- Дзеркало на клієнті: app/types/game.ts. Значення мають збігатися.
-- ============================================================================

create type public.user_role as enum ('superadmin', 'host');

create type public.question_type as enum ('text', 'image', 'collage', 'gif', 'video', 'audio');

create type public.answer_type as enum (
  'single_choice',
  'text_input',
  'multi_choice',
  'ordering',
  'photo',
  'drawing'
);

create type public.reveal_mode as enum ('after_stage', 'after_question', 'manual');

create type public.time_mode as enum ('unlimited', 'fixed');

create type public.media_kind as enum ('image', 'gif', 'video', 'audio');

-- room_state створюється разом з таблицею rooms у наступній міграції.

-- ============================================================================
-- Спільні допоміжні функції
-- ============================================================================

-- updated_at веде база, а не клієнт. Клієнт не є джерелом часу (§8.2), і це
-- правило дешевше застосувати скрізь однаково, ніж пам'ятати про винятки.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Роль читається з токена, а не з таблиці профілів (§2.4).
--
-- Дві причини. Перша: політики доступу перевіряють роль на кожному рядку,
-- і запит до profiles на кожній перевірці коштує дорого. Друга: app_metadata
-- недоступне клієнтському SDK на запис, на відміну від user_metadata —
-- роль у user_metadata означала б, що будь-хто робить себе суперадміном
-- одним викликом з консолі браузера.
create or replace function public.current_role_claim()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '')
$$;

create or replace function public.is_superadmin()
returns boolean
language sql
stable
as $$
  select public.current_role_claim() = 'superadmin'
$$;

-- ============================================================================
-- profiles — акаунти суперадміна і ведучих (§11.1)
--
-- Учасники гри профілю не мають навмисно (§2.1): вони існують тільки як записи
-- всередині конкретної кімнати. Це робить перевірку прав тривіальною —
-- наявність акаунта одразу відсікає учасників від усього, що стосується
-- платформи.
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  role public.user_role not null default 'host',
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Акаунти суперадміна і ведучих. Учасники гри тут не з''являються ніколи.';

comment on column public.profiles.role is
  'Запис ролі для інтерфейсу. Політики доступу читають НЕ це поле, '
  'а app_metadata.role з токена — див. public.current_role_claim(). '
  'Два місця для одного факту розійдуться, якщо міняти їх окремо: '
  'підвищення до суперадміна змінює обидва в одному операторі (див. нижче).';

-- Суперадмін у системі один (§2.1). Це закріплюється базою, а не домовленістю
-- в команді: домовленість не витримає другого адміна «тимчасово, для тесту».
create unique index profiles_single_superadmin
  on public.profiles (role)
  where role = 'superadmin';

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Профіль створюється при першому вході, без участі клієнта.
--
-- SECURITY DEFINER тут обов'язковий: тригер виконується в контексті вставки
-- в auth.users, де у викликача немає прав на public.profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1),
      ''
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ПІДВИЩЕННЯ ДО СУПЕРАДМІНА робиться тільки міграцією або руками в БД.
-- Інтерфейсу для зміни ролей не існує в жодній фазі (§2.4).
-- Обидва місця оновлюються в одному операторі, інакше токен і таблиця
-- розійдуться:
--
--   update auth.users
--      set raw_app_meta_data = raw_app_meta_data || '{"role":"superadmin"}'::jsonb
--    where email = '…';
--   update public.profiles set role = 'superadmin'
--    where id = (select id from auth.users where email = '…');
--
-- Роль потрапляє в токен при наступному вході або оновленні сесії.

-- ============================================================================
-- media_assets — медіа (§4.8)
--
-- Таблиця існує з першого дня, фаза 1 використовує тільки зображення.
-- Додавання відео і аудіо = нові значення media_kind + валідація при
-- завантаженні + компонент відтворення. Схема не змінюється.
-- ============================================================================

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  kind public.media_kind not null default 'image',
  storage_path text,
  external_url text,
  duration_sec integer,
  bytes integer,
  created_at timestamptz not null default now(),

  -- Або файл у сховищі, або зовнішнє посилання (YouTube у фазі 2), не обидва.
  constraint media_assets_source_present check (
    (storage_path is not null) <> (external_url is not null)
  )
);

create index media_assets_owner_idx on public.media_assets (owner_id);

-- ============================================================================
-- quizzes — квіз (§11.1)
-- ============================================================================

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),

  -- default auth.uid() — щоб клієнту не доводилося передавати owner_id при
  -- створенні. Політика все одно перевіряє збіг: підставити чужий id не вийде,
  -- але й забути свій неможливо.
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null default '',
  description text not null default '',

  -- Мова контенту — інформаційне поле для майбутнього фільтра в списку квізів.
  -- Питання зберігаються мовою, якою їх ввів ведучий, і не перекладаються
  -- ніколи (§4.6). Мова інтерфейсу до цього поля стосунку не має.
  content_language text not null default 'en',

  default_points integer not null default 1 check (default_points > 0),

  -- Розв'язання нічиєї за швидкістю (§7.2). Діє на весь квіз, на всіх етапах.
  -- Час використовується ТІЛЬКИ як розв'язання нічиєї, ніколи як джерело
  -- додаткових балів: учасник не може виграти в того, хто набрав більше балів,
  -- лише швидкістю.
  tie_break_by_speed boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index quizzes_owner_idx on public.quizzes (owner_id);

create trigger quizzes_touch_updated_at
  before update on public.quizzes
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- stages — етапи (§5)
-- ============================================================================

create table public.stages (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  position integer not null,
  title text not null default '',
  created_at timestamptz not null default now(),

  -- DEFERRABLE — не прикраса. Перетягування етапу міняє позиції кількох рядків
  -- одним запитом, і в середині транзакції дві позиції неминуче збігаються.
  -- Негайна перевірка відхилила б коректну зміну порядку.
  constraint stages_position_unique unique (quiz_id, position)
    deferrable initially deferred
);

create index stages_quiz_idx on public.stages (quiz_id, position);

-- ============================================================================
-- questions — питання (§11.1)
-- ============================================================================

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.stages (id) on delete cascade,
  position integer not null,

  question_type public.question_type not null default 'text',
  answer_type public.answer_type not null default 'single_choice',
  text text not null default '',
  media_asset_id uuid references public.media_assets (id) on delete set null,

  -- Режим часу задається для кожного питання окремо (§8.1).
  time_mode public.time_mode not null default 'fixed',
  time_limit_sec integer,

  points integer not null default 1 check (points > 0),

  -- Момент розкриття (§4.5). Фаза 1 записує сюди тільки after_stage;
  -- гілки для after_question і manual додаються у фазі 2 як окремі переходи
  -- машини станів, не зачіпаючи наявний.
  reveal_mode public.reveal_mode not null default 'after_stage',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint questions_position_unique unique (stage_id, position)
    deferrable initially deferred,

  -- Фіксований ліміт вимагає числа; необмежений час його не має.
  constraint questions_time_limit_matches_mode check (
    (time_mode = 'fixed' and time_limit_sec is not null and time_limit_sec > 0)
    or (time_mode = 'unlimited' and time_limit_sec is null)
  )
);

create index questions_stage_idx on public.questions (stage_id, position);

create trigger questions_touch_updated_at
  before update on public.questions
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- question_options — варіанти відповіді і прийнятні текстові варіанти (§11.1)
--
-- ⚠️ НАЙЧУТЛИВІША ТАБЛИЦЯ ПРОЄКТУ.
--
-- Ознака правильності не повинна потрапити в браузер учасника НІКОЛИ (§8.3).
-- Тому тут є рівно одна політика — для власника квізу. Учасники читатимуть
-- санітизований зріз без is_correct, який з'явиться разом з таблицями гри.
--
-- Критерій приймання §17.9: у DevTools на клієнті учасника неможливо знайти
-- правильну відповідь до розкриття етапу.
--
-- Для text_input тут лежать прийнятні варіанти відповіді, кожен окремим
-- рядком з is_correct = true: «Тарас Шевченко», «Шевченко», «Кобзар» (§6.3).
-- Кількість не обмежена.
-- ============================================================================

create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  position integer not null,
  text text not null default '',
  is_correct boolean not null default false,

  -- Позиція у правильному порядку — під answer_type = 'ordering' (фаза 2).
  correct_position integer,

  created_at timestamptz not null default now(),

  constraint question_options_position_unique unique (question_id, position)
    deferrable initially deferred
);

create index question_options_question_idx on public.question_options (question_id, position);

-- ============================================================================
-- Політики доступу (§11.3)
--
-- Нагадування: клієнтський гард на маршруті — це навігація, а не безпека
-- (§2.5). Справжній захист тут.
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.quizzes enable row level security;
alter table public.stages enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.media_assets enable row level security;

-- profiles: свій рядок; суперадмін бачить усі.
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_superadmin());

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Вставка профілю — тільки тригером handle_new_user. Політики на insert немає
-- навмисно: інакше клієнт міг би створити профіль з роллю на свій розсуд.

-- Політика profiles_update_own дозволяє редагувати свій рядок — разом з полем
-- role. Обмежити це в самій політиці не можна: підзапит до profiles всередині
-- політики на profiles дає нескінченну рекурсію. Тому заборона окремим
-- тригером.
--
-- auth.uid() порожній, коли оператор виконується міграцією або руками в Studio
-- від імені postgres — саме так і робиться підвищення до суперадміна (§2.4).
create or replace function public.freeze_profile_role()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null then
    raise exception 'role change is not allowed from the application';
  end if;
  return new;
end;
$$;

create trigger profiles_freeze_role
  before update on public.profiles
  for each row execute function public.freeze_profile_role();

-- quizzes: власник — повний доступ, суперадмін — читання (§2.3).
create policy quizzes_owner_all on public.quizzes
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy quizzes_superadmin_read on public.quizzes
  for select to authenticated
  using (public.is_superadmin());

-- media_assets: власник — повний доступ.
create policy media_assets_owner_all on public.media_assets
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- stages / questions / question_options: власність визначається вгору
-- по ланцюжку до quizzes.owner_id.
create policy stages_owner_all on public.stages
  for all to authenticated
  using (
    exists (select 1 from public.quizzes q where q.id = stages.quiz_id and q.owner_id = auth.uid())
  )
  with check (
    exists (select 1 from public.quizzes q where q.id = stages.quiz_id and q.owner_id = auth.uid())
  );

create policy stages_superadmin_read on public.stages
  for select to authenticated
  using (public.is_superadmin());

create policy questions_owner_all on public.questions
  for all to authenticated
  using (
    exists (
      select 1
      from public.stages s
      join public.quizzes q on q.id = s.quiz_id
      where s.id = questions.stage_id and q.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.stages s
      join public.quizzes q on q.id = s.quiz_id
      where s.id = questions.stage_id and q.owner_id = auth.uid()
    )
  );

create policy questions_superadmin_read on public.questions
  for select to authenticated
  using (public.is_superadmin());

-- question_options: ТІЛЬКИ власник. Жодної політики для інших ролей.
-- Суперадмін теж не читає — він не потребує правильних відповідей чужого
-- квізу, а кожна зайва політика тут це ще один шлях витоку.
create policy question_options_owner_all on public.question_options
  for all to authenticated
  using (
    exists (
      select 1
      from public.questions qu
      join public.stages s on s.id = qu.stage_id
      join public.quizzes q on q.id = s.quiz_id
      where qu.id = question_options.question_id and q.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.questions qu
      join public.stages s on s.id = qu.stage_id
      join public.quizzes q on q.id = s.quiz_id
      where qu.id = question_options.question_id and q.owner_id = auth.uid()
    )
  );

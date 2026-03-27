
-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Generic planner entries (daily/weekly/monthly text fields)
CREATE TABLE public.planner_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  page_type text NOT NULL,
  date_key text NOT NULL,
  field_name text NOT NULL,
  value text DEFAULT '' NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, page_type, date_key, field_name)
);
ALTER TABLE public.planner_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own entries" ON public.planner_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Todo items
CREATE TABLE public.planner_todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  page_type text NOT NULL,
  date_key text NOT NULL,
  item_index int NOT NULL,
  text text DEFAULT '' NOT NULL,
  done boolean DEFAULT false NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, page_type, date_key, item_index)
);
ALTER TABLE public.planner_todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own todos" ON public.planner_todos FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Time blocks
CREATE TABLE public.time_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date_key text NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  activity text DEFAULT '' NOT NULL,
  color text DEFAULT '#c4a8c1' NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own time_blocks" ON public.time_blocks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Mood tracker (year grid)
CREATE TABLE public.mood_tracker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date_key text NOT NULL,
  mood_index int DEFAULT 0 NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, date_key)
);
ALTER TABLE public.mood_tracker ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own moods" ON public.mood_tracker FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Sleep tracker
CREATE TABLE public.sleep_tracker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date_key text NOT NULL,
  hours numeric DEFAULT 0 NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, date_key)
);
ALTER TABLE public.sleep_tracker ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sleep" ON public.sleep_tracker FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Exercise tracker
CREATE TABLE public.exercise_tracker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date_key text NOT NULL,
  activity text DEFAULT '' NOT NULL,
  duration int DEFAULT 0 NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.exercise_tracker ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own exercise" ON public.exercise_tracker FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Habit tracker
CREATE TABLE public.habit_tracker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_index int NOT NULL,
  habit_name text DEFAULT '' NOT NULL,
  habit_color text DEFAULT '#c4a8c1' NOT NULL,
  date_key text NOT NULL,
  done boolean DEFAULT false NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, habit_index, date_key)
);
ALTER TABLE public.habit_tracker ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own habits" ON public.habit_tracker FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Budget tracker
CREATE TABLE public.budget_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month_key text NOT NULL,
  category text NOT NULL,
  label text DEFAULT '' NOT NULL,
  amount numeric DEFAULT 0 NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.budget_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own budget" ON public.budget_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.planner_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.planner_todos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.time_blocks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mood_tracker;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habit_tracker;

-- Storage bucket for stickers/washi/drawings
INSERT INTO storage.buckets (id, name, public) VALUES ('planner-assets', 'planner-assets', true);
CREATE POLICY "Users upload own assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'planner-assets' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users read own assets" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'planner-assets' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'planner-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

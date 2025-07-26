@@ .. @@
 /*
-  # Authentication System Setup
+  # Create authentication tables and policies
   
   1. New Tables
     - `user_profiles`
       - `id` (uuid, primary key, references auth.users)
       - `email` (text)
       - `full_name` (text)
       - `role` (text, default 'user')
       - `created_at` (timestamp)
       - `updated_at` (timestamp)
     - `module_usage`
       - `id` (uuid, primary key)
       - `user_id` (uuid, references auth.users)
       - `module_name` (text)
       - `input_data` (jsonb)
       - `output_data` (jsonb)
       - `processing_time` (integer)
       - `status` (text, default 'completed')
       - `created_at` (timestamp)

   2. Security
     - Enable RLS on all tables
     - Add policies for user data access
     - Add policies for admin access
+    
+  3. Functions
+    - Auto-create user profile on signup
+    - Update timestamp trigger
 */

+-- Enable UUID extension
+CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
+
 -- Create user profiles table
 CREATE TABLE IF NOT EXISTS user_profiles (
   id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
   email text,
   full_name text,
   role text DEFAULT 'user' CHECK (role IN ('admin', 'user')),
   created_at timestamptz DEFAULT now(),
   updated_at timestamptz DEFAULT now()
 );

 -- Create module usage table
 CREATE TABLE IF NOT EXISTS module_usage (
-  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
+  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
   user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
   module_name text NOT NULL,
   input_data jsonb,
   output_data jsonb,
   processing_time integer,
   status text DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'processing')),
   created_at timestamptz DEFAULT now()
 );

+-- Create function to handle new user signup
+CREATE OR REPLACE FUNCTION public.handle_new_user()
+RETURNS trigger AS $$
+BEGIN
+  INSERT INTO public.user_profiles (id, email, full_name, role)
+  VALUES (
+    new.id,
+    new.email,
+    COALESCE(new.raw_user_meta_data->>'full_name', ''),
+    'user'
+  );
+  RETURN new;
+END;
+$$ LANGUAGE plpgsql SECURITY DEFINER;
+
+-- Create trigger for new user signup
+DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
+CREATE TRIGGER on_auth_user_created
+  AFTER INSERT ON auth.users
+  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
+
+-- Create function to update updated_at timestamp
+CREATE OR REPLACE FUNCTION update_updated_at_column()
+RETURNS TRIGGER AS $$
+BEGIN
+    NEW.updated_at = now();
+    RETURN NEW;
+END;
+$$ LANGUAGE plpgsql;
+
+-- Create trigger for updated_at
+DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
+CREATE TRIGGER update_user_profiles_updated_at
+    BEFORE UPDATE ON user_profiles
+    FOR EACH ROW
+    EXECUTE FUNCTION update_updated_at_column();
+
 -- Enable RLS
 ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
 ALTER TABLE module_usage ENABLE ROW LEVEL SECURITY;

 -- User profiles policies
+DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
 CREATE POLICY "Users can view own profile"
   ON user_profiles
   FOR SELECT
   TO authenticated
   USING (auth.uid() = id);

+DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
 CREATE POLICY "Users can update own profile"
   ON user_profiles
   FOR UPDATE
   TO authenticated
   USING (auth.uid() = id);

+DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
+CREATE POLICY "Users can insert own profile"
+  ON user_profiles
+  FOR INSERT
+  TO authenticated
+  WITH CHECK (auth.uid() = id);
+
+DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
 CREATE POLICY "Admins can view all profiles"
   ON user_profiles
   FOR ALL
   TO authenticated
   USING (
     EXISTS (
       SELECT 1 FROM user_profiles
       WHERE id = auth.uid() AND role = 'admin'
     )
   );

 -- Module usage policies
+DROP POLICY IF EXISTS "Users can view own usage" ON module_usage;
 CREATE POLICY "Users can view own usage"
   ON module_usage
   FOR SELECT
   TO authenticated
   USING (auth.uid() = user_id);

+DROP POLICY IF EXISTS "Users can insert own usage" ON module_usage;
+CREATE POLICY "Users can insert own usage"
+  ON module_usage
+  FOR INSERT
+  TO authenticated
+  WITH CHECK (auth.uid() = user_id);
+
+DROP POLICY IF EXISTS "Admins can view all usage" ON module_usage;
 CREATE POLICY "Admins can view all usage"
   ON module_usage
   FOR SELECT
   TO authenticated
   USING (
     EXISTS (
       SELECT 1 FROM user_profiles
       WHERE id = auth.uid() AND role = 'admin'
     )
   );

+-- Create indexes for better performance
+CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
+CREATE INDEX IF NOT EXISTS idx_module_usage_user_id ON module_usage(user_id);
+CREATE INDEX IF NOT EXISTS idx_module_usage_created_at ON module_usage(created_at);
+CREATE INDEX IF NOT EXISTS idx_module_usage_module_name ON module_usage(module_name);
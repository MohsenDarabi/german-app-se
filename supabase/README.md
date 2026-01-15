# Supabase Configuration

## Running Migrations

Migrations are stored in `migrations/` folder. To run them:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor** > **New Query**
4. Copy and paste the SQL from the migration file
5. Click **Run**

## Security Settings (Manual)

Some security settings must be configured in the dashboard:

### Leaked Password Protection
1. Go to **Authentication** > **Settings**
2. Scroll to **Security**
3. Enable **"Leaked password protection"**

This checks passwords against HaveIBeenPwned.org to reject known compromised passwords.

## Project Info

- **Project ID:** iultvpmyljdfpaswhhfl
- **Region:** (check dashboard)

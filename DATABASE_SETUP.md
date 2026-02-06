# Database Setup Guide - PlanetScale (Cloud MySQL)

## Option 1: PlanetScale (Recommended - Free)

### Step 1: Sign up
1. Go to https://planetscale.com
2. Sign up with GitHub (easier)

### Step 2: Create a Database
1. Click "Create" → New database
2. Name it: `journal_db`
3. Region: Choose closest to you
4. Click "Create database"

### Step 3: Get Connection String
1. Click on your database
2. Go to "Connect" tab
3. Click "Node.js" 
4. Copy the connection string that looks like:
   ```
   mysql://user:password@host/journal_db
   ```

### Step 4: Update .env file
Update your `/Users/bhupendrasingh/Desktop/journal-platform/.env`:
```
DB_HOST=your-host-from-planetscale
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=journal_db
NODE_ENV=development
SESSION_SECRET=change-this-to-random-string
```

### Step 5: Install Dependencies
```bash
cd /Users/bhupendrasingh/Desktop/journal-platform
npm install
```

### Step 6: Initialize Database
```bash
npm run setup:db
```

This will:
- Create the database
- Create all tables (users, articles, issues, submissions, etc.)
- Set up the schema

### Step 7: Verify Connection
```bash
npm run check:db
```

You should see: "Database connected successfully"

---

## Option 2: Local MySQL (If you can install it)
1. Install MySQL locally via official installer: https://dev.mysql.com/downloads/mysql/
2. Start MySQL service
3. Create database:
   ```bash
   mysql -u root -p
   CREATE DATABASE journal_db;
   ```
4. Update .env with local credentials
5. Run `npm run setup:db`

---

## What happens after setup:
✅ All tables created
✅ Ready for user registration & paper submissions
✅ Can start the app with `npm start`

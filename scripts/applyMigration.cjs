#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Client } = require('pg');

async function applyMigration() {
  const targetFile = process.argv[2] || '20241010000000_drug_scope_core_schema.sql';
  console.log('🚀 Drug Scope AI — PostgreSQL Migration Runner');
  console.log('Target Project: kfdntklvvvorbgatyqcg');
  console.log(`Migration File: supabase/migrations/${targetFile}\n`);

  const migrationPath = path.resolve(__dirname, '../supabase/migrations', targetFile);
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found at:', migrationPath);
    process.exit(1);
  }
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  const home = os.homedir();
  const dbEnvPath = path.join(home, '.config/drugscope/supabase-db.env');
  const mcpEnvPath = path.join(home, '.config/drugscope/supabase-mcp.env');

  let dbPassword = null;
  if (fs.existsSync(dbEnvPath)) {
    const content = fs.readFileSync(dbEnvPath, 'utf8');
    const match = content.match(/SUPABASE_DB_PASSWORD=(.*)/);
    if (match && match[1].trim().length > 0) {
      dbPassword = match[1].trim();
    }
  }

  let mcpToken = null;
  if (fs.existsSync(mcpEnvPath)) {
    const content = fs.readFileSync(mcpEnvPath, 'utf8');
    const match = content.match(/SUPABASE_ACCESS_TOKEN=(.*)/);
    if (match && match[1].trim().length > 0) {
      mcpToken = match[1].trim();
    }
  }

  // METHOD 1: Direct PostgreSQL / Pooler Connection as postgres superuser (via SUPABASE_DB_PASSWORD)
  if (dbPassword) {
    console.log('🔑 Attempting PostgreSQL execution using provided SUPABASE_DB_PASSWORD...');

    const connectionConfigs = [
      {
        host: 'aws-0-ap-southeast-1.pooler.supabase.com',
        port: 5432,
        user: 'postgres.kfdntklvvvorbgatyqcg',
        name: 'Supabase IPv4 Session Pooler (port 5432)'
      },
      {
        host: 'aws-0-ap-southeast-1.pooler.supabase.com',
        port: 6543,
        user: 'postgres.kfdntklvvvorbgatyqcg',
        name: 'Supabase IPv4 Transaction Pooler (port 6543)'
      },
      {
        host: 'db.kfdntklvvvorbgatyqcg.supabase.co',
        port: 5432,
        user: 'postgres',
        name: 'Direct Host (port 5432)'
      }
    ];

    for (const cfg of connectionConfigs) {
      console.log(`📡 Trying ${cfg.name}...`);
      const client = new Client({
        host: cfg.host,
        port: cfg.port,
        user: cfg.user,
        password: dbPassword,
        database: 'postgres',
        ssl: { rejectUnauthorized: true },
        connectionTimeoutMillis: 10000
      });

      try {
        await client.connect();
        console.log(`✅ Connected successfully to ${cfg.name}!`);
        
        console.log('⏳ Executing migration script (18 tables, RLS, seed data)...');
        await client.query(migrationSql);
        console.log('🎉 Migration applied successfully!');

        // Verify created tables
        const res = await client.query(`
          SELECT tablename 
          FROM pg_tables 
          WHERE schemaname = 'public' 
          ORDER BY tablename;
        `);
        console.log(`\n📊 Remote Public Tables Verified (${res.rows.length} tables):`);
        res.rows.forEach((r, idx) => console.log(`  ${idx + 1}. ${r.tablename}`));

        await client.end();
        process.exit(0);
      } catch (err) {
        console.warn(`   Failed with ${cfg.name}:`, err.message);
        await client.end().catch(() => {});
      }
    }
  }

  // METHOD 2: Supabase Management API via Personal Access Token
  if (mcpToken) {
    console.log('🔑 Attempting execution via Supabase Management API using configured access token...');
    try {
      const response = await fetch('https://api.supabase.com/v1/projects/kfdntklvvvorbgatyqcg/database/query', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${mcpToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: migrationSql, read_only: false })
      });

      if (response.ok) {
        console.log('🎉 Migration applied successfully via Management API!');
        process.exit(0);
      } else {
        const errText = await response.text();
        console.warn('⚠️ Management API query returned status:', response.status);
        console.warn('   Details:', errText);
      }
    } catch (err) {
      console.warn('⚠️ Management API call failed:', err.message);
    }
  }

  console.log('\n⚠️ Notice: Neither SUPABASE_DB_PASSWORD nor write-scoped SUPABASE_ACCESS_TOKEN was available.');
  console.log('To apply this migration, choose one of the following:');
  console.log('1. Add your database password to ~/.config/drugscope/supabase-db.env');
  console.log('2. Or run the SQL script in Supabase Dashboard SQL Editor at:');
  console.log('   https://supabase.com/dashboard/project/kfdntklvvvorbgatyqcg/sql/new\n');
  process.exit(1);
}

applyMigration().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});

-- Run this SQL in your Supabase SQL Editor to create the immutable audit log table

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  target_hash text,
  nodes_altered integer,
  surgery_time_ms integer,
  certificate_hash text NOT NULL,
  device text,
  intelligence_preserved text,
  status text NOT NULL
);

-- Optional: Enable Row Level Security (RLS) but allow anonymous inserts/reads for the hackathon
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" 
  ON audit_log FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert access" 
  ON audit_log FOR INSERT 
  WITH CHECK (true);

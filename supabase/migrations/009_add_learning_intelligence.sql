-- Migration: Add learning_intelligence column to diagnoses table
ALTER TABLE diagnoses ADD COLUMN IF NOT EXISTS learning_intelligence JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Migration: add_fleets_table
-- Adds fleet grouping for multi-fleet management companies
-- Enables: fleet context switching, white-label boundary

CREATE TABLE IF NOT EXISTS fleets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  short_code TEXT NOT NULL,
  display_name TEXT NOT NULL,
  logo_url TEXT,
  is_managed_client BOOLEAN DEFAULT false,
  client_contact_name TEXT,
  client_contact_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, short_code)
);

ALTER TABLE vessels ADD COLUMN IF NOT EXISTS fleet_id UUID REFERENCES fleets(id);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS fleet_id UUID REFERENCES fleets(id);
ALTER TABLE crew_members ADD COLUMN IF NOT EXISTS fleet_id UUID REFERENCES fleets(id);
ALTER TABLE bb_positions ADD COLUMN IF NOT EXISTS fleet_id UUID REFERENCES fleets(id);

ALTER TABLE fleets ENABLE ROW LEVEL SECURITY;
CREATE POLICY fleets_select ON fleets FOR SELECT TO authenticated USING (org_id = bb_user_org_id());
CREATE POLICY fleets_insert ON fleets FOR INSERT TO authenticated WITH CHECK (org_id = bb_user_org_id());
CREATE POLICY fleets_update ON fleets FOR UPDATE TO authenticated USING (org_id = bb_user_org_id());

CREATE INDEX IF NOT EXISTS idx_fleets_org_id ON fleets(org_id);
CREATE INDEX IF NOT EXISTS idx_vessels_fleet_id ON vessels(fleet_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_fleet_id ON user_profiles(fleet_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_fleet_id ON crew_members(fleet_id);
CREATE INDEX IF NOT EXISTS idx_bb_positions_fleet_id ON bb_positions(fleet_id);
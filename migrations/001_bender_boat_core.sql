-- Bender Boat Solution — Core Schema Migration
-- Standing Tide / SANSU / Lindblad Expeditions
-- Deployed to Sentinel-Core (OpsNormal.ai Supabase)
-- Tables coexist with Ferry Log tables (no conflicts)

-- =====================================================
-- 1. CORE TABLES
-- =====================================================

-- Crew Members (mariners — separate from ferry_crew and employees)
CREATE TABLE IF NOT EXISTS crew_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  preferred_name text,
  email text UNIQUE,
  phone text,
  mailing_address jsonb,
  emergency_contact jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'onboarding')),
  hire_date date,
  employment_type text CHECK (employment_type IN ('full_time_rotational', 'seasonal', 'temporary')),
  hire_type text CHECK (hire_type IN ('new_hire', 'rehire', 'fill_in', 'promotion', 'transfer')),
  rotation_name text,
  department text CHECK (department IN ('deck', 'engine', 'hotel', 'galley', 'expedition')),
  reports_to text,
  notes text,
  photo_url text,
  gusto_id text UNIQUE,
  helm_id text UNIQUE,
  org_id uuid REFERENCES organizations(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Positions (roles on each vessel — drives credential requirements)
CREATE TABLE IF NOT EXISTS bb_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid NOT NULL REFERENCES vessels(id),
  title text NOT NULL,
  department text NOT NULL CHECK (department IN ('deck', 'engine', 'hotel', 'galley', 'expedition')),
  is_watch_standing boolean DEFAULT false,
  is_safety_sensitive boolean DEFAULT true,
  reports_to_position_id uuid REFERENCES bb_positions(id),
  manager_abbreviation text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Credential Types (lookup — what certs exist in the system)
CREATE TABLE IF NOT EXISTS credential_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  issuing_authority text,
  has_expiry boolean DEFAULT true,
  renewal_lead_days int DEFAULT 90,
  document_category text CHECK (document_category IN ('license', 'certification', 'identity', 'medical', 'endorsement', 'state_license')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Crew Credentials (each cert held by each crew member)
CREATE TABLE IF NOT EXISTS crew_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id uuid NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
  credential_type_id uuid NOT NULL REFERENCES credential_types(id),
  document_number text,
  issued_date date,
  expiry_date date,
  issuing_body text,
  document_url text,
  status text NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'expired', 'suspended', 'pending_renewal', 'missing')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Position Credential Requirements (the compliance matrix)
CREATE TABLE IF NOT EXISTS position_credential_req (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id uuid NOT NULL REFERENCES bb_positions(id) ON DELETE CASCADE,
  credential_type_id uuid NOT NULL REFERENCES credential_types(id),
  is_required boolean DEFAULT true,
  notes text,
  UNIQUE(position_id, credential_type_id)
);

-- Voyages (the master operational record)
CREATE TABLE IF NOT EXISTS voyages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid NOT NULL REFERENCES vessels(id),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
  departure_port text,
  arrival_port text,
  planned_departure timestamptz,
  planned_arrival timestamptz,
  actual_departure timestamptz,
  actual_arrival timestamptz,
  watch_pattern text DEFAULT '4_8',
  required_complement jsonb,
  notes text,
  closed_at timestamptz,
  closed_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Assignments (crew → vessel/voyage/position)
CREATE TABLE IF NOT EXISTS bb_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id uuid NOT NULL REFERENCES crew_members(id),
  vessel_id uuid NOT NULL REFERENCES vessels(id),
  voyage_id uuid REFERENCES voyages(id),
  position_id uuid NOT NULL REFERENCES bb_positions(id),
  assignment_type text NOT NULL DEFAULT 'primary' CHECK (assignment_type IN ('primary', 'relief')),
  relief_for uuid REFERENCES bb_assignments(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
  rotation_start timestamptz,
  rotation_end timestamptz,
  actual_departure timestamptz,
  handoff_complete boolean DEFAULT false,
  notes text,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. WATCH & OPERATIONS TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS watch_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voyage_id uuid NOT NULL REFERENCES voyages(id),
  pattern text NOT NULL,
  effective_from timestamptz NOT NULL,
  effective_to timestamptz,
  generated_at timestamptz DEFAULT now(),
  generated_by uuid,
  notes text
);

CREATE TABLE IF NOT EXISTS watch_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  watch_schedule_id uuid NOT NULL REFERENCES watch_schedules(id),
  crew_member_id uuid NOT NULL REFERENCES crew_members(id),
  watch_slot text NOT NULL,
  effective_from date NOT NULL,
  effective_to date,
  notes text
);

CREATE TABLE IF NOT EXISTS bb_watch_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  watch_schedule_id uuid REFERENCES watch_schedules(id),
  watch_assignment_id uuid REFERENCES watch_assignments(id),
  officer_id uuid NOT NULL REFERENCES crew_members(id),
  vessel_id uuid NOT NULL REFERENCES vessels(id),
  voyage_id uuid NOT NULL REFERENCES voyages(id),
  watch_start timestamptz NOT NULL,
  watch_end timestamptz,
  position_lat numeric,
  position_lon numeric,
  position_source text,
  weather_conditions jsonb,
  course numeric,
  speed numeric,
  engine_status text,
  traffic_notes text,
  outstanding_issues text,
  signed_off_at timestamptz,
  signed_off_by uuid REFERENCES crew_members(id),
  status text DEFAULT 'open' CHECK (status IN ('open', 'signed_off')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS work_hour_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id uuid NOT NULL REFERENCES crew_members(id),
  voyage_id uuid REFERENCES voyages(id),
  record_date date NOT NULL,
  period_start timestamptz,
  period_end timestamptz,
  hours_worked numeric,
  record_type text CHECK (record_type IN ('watch', 'engineering_round', 'drill', 'other')),
  source_id uuid,
  notes text
);

CREATE TABLE IF NOT EXISTS bb_engineering_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voyage_id uuid NOT NULL REFERENCES voyages(id),
  watch_entry_id uuid REFERENCES bb_watch_entries(id),
  conducted_by uuid NOT NULL REFERENCES crew_members(id),
  round_time timestamptz NOT NULL DEFAULT now(),
  template_used text,
  main_engine_rpm numeric,
  main_engine_oil_pressure numeric,
  main_engine_coolant_temp numeric,
  gearbox_oil_pressure numeric,
  aux_engine_1_status text,
  aux_engine_2_status text,
  bilge_port_level numeric,
  bilge_stbd_level numeric,
  bilge_aft_level numeric,
  fuel_main_pct numeric,
  fuel_day_tank_pct numeric,
  fresh_water_pct numeric,
  lube_oil_level text,
  readings jsonb,
  abnormalities text,
  photos jsonb,
  status text DEFAULT 'normal' CHECK (status IN ('normal', 'abnormality_noted', 'alert')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ships_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voyage_id uuid NOT NULL REFERENCES voyages(id),
  conducted_by uuid NOT NULL REFERENCES crew_members(id),
  round_start timestamptz NOT NULL,
  round_end timestamptz,
  round_type text CHECK (round_type IN ('daily', 'weekly', 'pre_departure', 'post_arrival')),
  overall_status text DEFAULT 'satisfactory' CHECK (overall_status IN ('satisfactory', 'deficiencies_noted', 'critical_deficiency')),
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ships_round_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ships_round_id uuid NOT NULL REFERENCES ships_rounds(id) ON DELETE CASCADE,
  section text NOT NULL,
  item_key text NOT NULL,
  item_label text NOT NULL,
  result text CHECK (result IN ('pass', 'fail', 'na', 'requires_attention')),
  notes text,
  photo_url text,
  sort_order int DEFAULT 0
);

CREATE TABLE IF NOT EXISTS wakeup_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ships_round_id uuid NOT NULL REFERENCES ships_rounds(id) ON DELETE CASCADE,
  crew_member_id uuid NOT NULL REFERENCES crew_members(id),
  scheduled_wakeup timestamptz,
  called_at timestamptz,
  acknowledged boolean DEFAULT false,
  acknowledged_at timestamptz,
  second_call_required boolean DEFAULT false,
  second_call_at timestamptz,
  notes text
);

CREATE TABLE IF NOT EXISTS corrective_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ships_round_id uuid NOT NULL REFERENCES ships_rounds(id),
  ships_round_item_id uuid REFERENCES ships_round_items(id),
  description text NOT NULL,
  assigned_to uuid REFERENCES crew_members(id),
  due_date date,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'deferred')),
  resolution_notes text,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES crew_members(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nav_log_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voyage_id uuid NOT NULL REFERENCES voyages(id),
  watch_entry_id uuid REFERENCES bb_watch_entries(id),
  recorded_by uuid NOT NULL REFERENCES crew_members(id),
  entry_time timestamptz NOT NULL,
  entry_type text NOT NULL CHECK (entry_type IN ('course_change', 'position_fix', 'weather_obs', 'vts_report', 'anchoring', 'mooring', 'pilot_boarding', 'speed_change', 'hazard', 'other')),
  position_lat numeric,
  position_lon numeric,
  course numeric,
  speed numeric,
  details jsonb,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 3. COMPLIANCE & TESTING
-- =====================================================

CREATE TABLE IF NOT EXISTS drug_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id uuid NOT NULL REFERENCES crew_members(id),
  test_type text NOT NULL CHECK (test_type IN ('pre_employment', 'random', 'post_incident', 'reasonable_cause', 'follow_up', 'return_to_duty')),
  test_date date NOT NULL,
  collection_site text,
  lab_name text,
  result text DEFAULT 'pending' CHECK (result IN ('negative', 'positive', 'cancelled', 'refused', 'pending')),
  substances_tested jsonb,
  result_date date,
  mro_name text,
  chain_of_custody_number text,
  document_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid
);

-- =====================================================
-- 4. TRAVEL & COST TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS travel_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES bb_assignments(id),
  crew_member_id uuid NOT NULL REFERENCES crew_members(id),
  travel_direction text NOT NULL CHECK (travel_direction IN ('to_vessel', 'from_vessel')),
  origin text,
  destination text,
  vessel_port text,
  planned_arrival timestamptz,
  actual_arrival timestamptz,
  flights jsonb,
  hotel jsonb,
  ground_transport jsonb,
  per_diem_days int,
  booking_status text DEFAULT 'not_booked' CHECK (booking_status IN ('not_booked', 'booked', 'confirmed', 'completed', 'cancelled')),
  flight_booked boolean DEFAULT false,
  hotel_booked boolean DEFAULT false,
  visa_cleared boolean,
  touchbase_sent boolean DEFAULT false,
  touchbase_sent_at timestamptz,
  crew_change_notes text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cost_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id uuid NOT NULL REFERENCES crew_members(id),
  voyage_id uuid REFERENCES voyages(id),
  assignment_id uuid REFERENCES bb_assignments(id),
  travel_record_id uuid REFERENCES travel_records(id),
  event_type text NOT NULL CHECK (event_type IN ('booking', 'change', 'cancellation', 'refund')),
  event_date timestamptz NOT NULL DEFAULT now(),
  vendor text,
  description text,
  reference_number text,
  original_amount numeric,
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  cost_delta numeric DEFAULT 0,
  refund_status text CHECK (refund_status IN ('pending', 'processing', 'credited', 'denied')),
  refund_expected_date date,
  refund_credited_date date,
  reason text,
  parent_event_id uuid REFERENCES cost_events(id),
  approved_by text,
  approved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid
);

-- =====================================================
-- 5. SEA TIME
-- =====================================================

CREATE TABLE IF NOT EXISTS sea_time_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id uuid NOT NULL REFERENCES crew_members(id),
  voyage_id uuid NOT NULL REFERENCES voyages(id),
  vessel_id uuid NOT NULL REFERENCES vessels(id),
  position_id uuid REFERENCES bb_positions(id),
  vessel_name text,
  vessel_type text,
  gross_tons numeric,
  route text,
  days_underway numeric,
  departure_date date,
  arrival_date date,
  capacity text,
  letter_generated_at timestamptz,
  letter_url text,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 6. BILLET MANAGEMENT (Sam's Weekly Report)
-- =====================================================

CREATE TABLE IF NOT EXISTS vessel_billets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid NOT NULL REFERENCES vessels(id),
  position_id uuid REFERENCES bb_positions(id),
  title text NOT NULL,
  department text NOT NULL CHECK (department IN ('deck', 'engine', 'hotel', 'galley', 'expedition')),
  rotation_name text,
  employment_type text NOT NULL CHECK (employment_type IN ('full_time_rotational', 'seasonal', 'temporary')),
  is_required boolean DEFAULT true,
  effective_from date DEFAULT CURRENT_DATE,
  effective_to date,
  sort_order int DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE TABLE IF NOT EXISTS billet_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  billet_id uuid NOT NULL REFERENCES vessel_billets(id),
  crew_member_id uuid NOT NULL REFERENCES crew_members(id),
  assigned_from date NOT NULL,
  assigned_to date,
  assignment_type text NOT NULL CHECK (assignment_type IN ('permanent', 'fill_in', 'transfer', 'temporary')),
  related_event_id uuid,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crew_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id uuid NOT NULL REFERENCES crew_members(id),
  vessel_id uuid REFERENCES vessels(id),
  billet_id uuid REFERENCES vessel_billets(id),
  event_type text NOT NULL CHECK (event_type IN ('termination', 'resignation', 'medical_disembark', 'loa', 'transfer', 'family_emergency', 'promotion', 'contract_end', 'clearance_issue')),
  event_date date NOT NULL,
  end_date date,
  details text,
  impact_on_billet text CHECK (impact_on_billet IN ('vacated', 'temporary_gap', 'no_impact')),
  reported_by uuid,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 7. HIRING & ONBOARDING PIPELINE
-- =====================================================

CREATE TABLE IF NOT EXISTS recruitment_pipeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  billet_id uuid REFERENCES vessel_billets(id),
  vessel_id uuid REFERENCES vessels(id),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'sourcing', 'candidate_identified', 'offer_pending', 'offer_sent', 'awaiting_signature', 'offer_signed', 'onboarding', 'filled', 'on_hold', 'cancelled')),
  candidate_name text,
  candidate_id uuid REFERENCES crew_members(id),
  department text,
  hire_type text CHECK (hire_type IN ('new_hire', 'rehire', 'fill_in', 'promotion', 'transfer')),
  employment_type text CHECK (employment_type IN ('full_time_rotational', 'seasonal', 'temporary')),
  date_needed date,
  anticipated_embark date,
  sourcing_notes text,
  offer_amount numeric,
  offer_sent_at timestamptz,
  offer_signed_at timestamptz,
  opened_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  closed_reason text,
  updated_by uuid,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS onboarding_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id uuid NOT NULL REFERENCES crew_members(id),
  vessel_id uuid NOT NULL REFERENCES vessels(id),
  billet_id uuid REFERENCES vessel_billets(id),
  position_title text,
  hire_type text NOT NULL CHECK (hire_type IN ('new_hire', 'rehire', 'fill_in', 'promotion')),
  employment_type text NOT NULL CHECK (employment_type IN ('full_time_rotational', 'seasonal', 'temporary')),
  department text NOT NULL,
  travel_date date,
  embarkation_date date,
  rotation_name text,
  manager_role text,
  status text DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'complete', 'cancelled')),
  completion_pct int DEFAULT 0,
  items jsonb DEFAULT '[]',
  pipeline_id uuid REFERENCES recruitment_pipeline(id),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 8. VESSEL STATUS & REPORTING
-- =====================================================

CREATE TABLE IF NOT EXISTS vessel_status_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id uuid NOT NULL REFERENCES vessels(id),
  status text NOT NULL CHECK (status IN ('operational', 'repositioning', 'wet_dock', 'dry_dock', 'layup', 'charter')),
  start_date date NOT NULL,
  end_date date,
  location text,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS report_distribution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text NOT NULL,
  vessel_id uuid REFERENCES vessels(id),
  recipient_name text NOT NULL,
  recipient_email text NOT NULL,
  recipient_type text NOT NULL CHECK (recipient_type IN ('to', 'cc', 'bcc')),
  department text,
  organization text,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS report_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text NOT NULL,
  report_date date NOT NULL,
  generated_by uuid,
  generated_at timestamptz DEFAULT now(),
  vessel_ids uuid[],
  recipient_count int,
  attachments jsonb,
  email_subject text,
  email_body_html text,
  status text DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'failed')),
  error_details text,
  notes text
);

-- =====================================================
-- 9. USER PROFILES (links to Supabase Auth)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY, -- matches auth.users.id
  crew_member_id uuid REFERENCES crew_members(id),
  display_name text,
  email text,
  role text NOT NULL DEFAULT 'readonly' CHECK (role IN ('admin', 'vessel_admin', 'officer', 'engineer', 'crew', 'finance', 'readonly')),
  vessels_access uuid[],
  org_id uuid REFERENCES organizations(id),
  last_login timestamptz,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 10. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_crew_members_org ON crew_members(org_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_status ON crew_members(status);
CREATE INDEX IF NOT EXISTS idx_crew_members_department ON crew_members(department);
CREATE INDEX IF NOT EXISTS idx_crew_credentials_crew ON crew_credentials(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_credentials_type ON crew_credentials(credential_type_id);
CREATE INDEX IF NOT EXISTS idx_crew_credentials_expiry ON crew_credentials(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bb_positions_vessel ON bb_positions(vessel_id);
CREATE INDEX IF NOT EXISTS idx_voyages_vessel ON voyages(vessel_id);
CREATE INDEX IF NOT EXISTS idx_voyages_status ON voyages(status);
CREATE INDEX IF NOT EXISTS idx_bb_assignments_crew ON bb_assignments(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_bb_assignments_vessel ON bb_assignments(vessel_id);
CREATE INDEX IF NOT EXISTS idx_bb_assignments_voyage ON bb_assignments(voyage_id);
CREATE INDEX IF NOT EXISTS idx_bb_watch_entries_voyage ON bb_watch_entries(voyage_id);
CREATE INDEX IF NOT EXISTS idx_bb_watch_entries_vessel ON bb_watch_entries(vessel_id);
CREATE INDEX IF NOT EXISTS idx_travel_records_crew ON travel_records(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_travel_records_assignment ON travel_records(assignment_id);
CREATE INDEX IF NOT EXISTS idx_cost_events_crew ON cost_events(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_cost_events_voyage ON cost_events(voyage_id);
CREATE INDEX IF NOT EXISTS idx_cost_events_parent ON cost_events(parent_event_id);
CREATE INDEX IF NOT EXISTS idx_drug_tests_crew ON drug_tests(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_vessel_billets_vessel ON vessel_billets(vessel_id);
CREATE INDEX IF NOT EXISTS idx_billet_assignments_billet ON billet_assignments(billet_id);
CREATE INDEX IF NOT EXISTS idx_billet_assignments_crew ON billet_assignments(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_events_crew ON crew_events(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_events_vessel ON crew_events(vessel_id);
CREATE INDEX IF NOT EXISTS idx_recruitment_pipeline_vessel ON recruitment_pipeline(vessel_id);
CREATE INDEX IF NOT EXISTS idx_recruitment_pipeline_status ON recruitment_pipeline(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_checklists_crew ON onboarding_checklists(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_checklists_vessel ON onboarding_checklists(vessel_id);

-- =====================================================
-- 11. ADD VESSEL COLUMNS (blue-water fields on existing table)
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vessels' AND column_name = 'uscg_doc_number') THEN
    ALTER TABLE vessels ADD COLUMN uscg_doc_number text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vessels' AND column_name = 'call_sign') THEN
    ALTER TABLE vessels ADD COLUMN call_sign text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vessels' AND column_name = 'flag') THEN
    ALTER TABLE vessels ADD COLUMN flag text DEFAULT 'USA';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vessels' AND column_name = 'vessel_type') THEN
    ALTER TABLE vessels ADD COLUMN vessel_type text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vessels' AND column_name = 'gross_tons') THEN
    ALTER TABLE vessels ADD COLUMN gross_tons numeric;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vessels' AND column_name = 'length_ft') THEN
    ALTER TABLE vessels ADD COLUMN length_ft numeric;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vessels' AND column_name = 'home_port') THEN
    ALTER TABLE vessels ADD COLUMN home_port text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vessels' AND column_name = 'coi_expiry') THEN
    ALTER TABLE vessels ADD COLUMN coi_expiry date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vessels' AND column_name = 'drydock_due') THEN
    ALTER TABLE vessels ADD COLUMN drydock_due date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vessels' AND column_name = 'imo_number') THEN
    ALTER TABLE vessels ADD COLUMN imo_number text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vessels' AND column_name = 'vessel_class') THEN
    ALTER TABLE vessels ADD COLUMN vessel_class text;
  END IF;
END $$;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ***************** System related *****************
  CREATE TYPE role AS ENUM (
      'SCHOLAR',    -- This is the role for the students
      'FINANCE',    -- This is the role for the finanial department
      'SPC',        -- This is the role fot the Scholarship Program Coordinator
      'TUTOR',      -- This is the role for the tutors / psychologists
      'ADMIN'       -- This is the role for the system administrators, they have access to everything
  );

  CREATE TABLE "users" (
    "id" uuid PRIMARY KEY NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    "ref_code" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "role" role
  );

-- **********************************

-- ***************** Scholarship related *****************

  CREATE TABLE "departments" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL
  );

  CREATE TABLE "municipalities" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "department_id" INTEGER REFERENCES departments(id) NOT NULL
  );

  CREATE TYPE scholar_state AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'GRADUATED'
  );

  CREATE TABLE "scholars" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" uuid REFERENCES users(id) NOT NULL,
    "dob" TIMESTAMPTZ NOT NULL,
    "gender" TEXT,
    "has_disability" BOOLEAN,
    "disability_description" TEXT,
    "number_of_children" INTEGER,
    "ingress_date" TIMESTAMPTZ,
    "egress_date" TIMESTAMPTZ,
    "egress_comments" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "emergency_contact_relationship" TEXT,
    "dui" TEXT,
    "state" scholar_state NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "created_by" uuid REFERENCES users(id) NOT NULL
  );

  CREATE TABLE "phone_numbers" (
    "id" SERIAL PRIMARY KEY,
    "number" TEXT NOT NULL
  );

  CREATE TABLE "scholar_phone_numbers" (
    "id" SERIAL PRIMARY KEY,
    "scholar_id" uuid REFERENCES scholars(id) NOT NULL,
    "phone_number_id" INTEGER REFERENCES phone_numbers(id) NOT NULL,
    "is_mobile" BOOLEAN NOT NULL DEFAULT TRUE,
    "is_current" BOOLEAN NOT NULL DEFAULT TRUE
  );

  CREATE TABLE "addresses" (
      "id" SERIAL PRIMARY KEY,
      "street_line_1" TEXT NOT NULL,
      "street_line_2" TEXT,
      "apartment_number" TEXT,
      "postal_code" TEXT,
      "municipality_id" INTEGER REFERENCES municipalities(id) NOT NULL,
      "is_urban" BOOLEAN NOT NULL,
      "created_at" TIMESTAMPTZ NOT NULL,
      "created_by" uuid REFERENCES users(id) NOT NULL
  );

  CREATE TABLE "scholar_addresses" (
    "id" SERIAL PRIMARY KEY,
    "scholar_id" uuid REFERENCES scholars(id) NOT NULL,
    "address_id" INTEGER REFERENCES addresses(id) NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMPTZ NOT NULL,
    "created_by" uuid REFERENCES users(id) NOT NULL
  );

  CREATE TABLE "residences" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" INTEGER REFERENCES phone_numbers(id),
    "address_id" INTEGER REFERENCES addresses(id) NOT NULL
  );
  
  CREATE TYPE "bank_account_type" AS ENUM (
    'SAVINGS',
    'CURRENT'
  );

  CREATE TABLE "banks" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL
  );

  CREATE TABLE "bank_accounts" (
    "id" SERIAL PRIMARY KEY,
    "account_number" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT FALSE,
    "account_type" bank_account_type NOT NULL,
    "bank_id" INTEGER REFERENCES banks(id) NOT NULL,
    "scholar_id" uuid REFERENCES scholars(id) NOT NULL
  );

  CREATE TABLE "scholars_logbook" (
    "id" SERIAL PRIMARY KEY,
    "scholar_id" uuid REFERENCES scholars(id) NOT NULL,
    "date" TIMESTAMPTZ,
    "log" varchar(2000),
    "created_at" TIMESTAMPTZ,
    "created_by" uuid REFERENCES users(id)
  );

-- ========================================================
-- COMENTARIOS DE TABLAS Y COLUMNAS
-- ========================================================

  -- Estructura Geográfica
  COMMENT ON TABLE departments IS 'Catálogo de departamentos o divisiones geográficas principales del país';
  COMMENT ON COLUMN departments.id IS 'Identificador único del departamento';
  COMMENT ON COLUMN departments.name IS 'Nombre del departamento';

  COMMENT ON TABLE municipalities IS 'Catálogo de municipios o subdivisiones de los departamentos';
  COMMENT ON COLUMN municipalities.id IS 'Identificador único del municipio';
  COMMENT ON COLUMN municipalities.name IS 'Nombre del municipio';
  COMMENT ON COLUMN municipalities.department_id IS 'Referencia al departamento al que pertenece este municipio';

  -- Sistema de Direcciones
  COMMENT ON TABLE addresses IS 'Registro de direcciones físicas utilizadas en el sistema';
  COMMENT ON COLUMN addresses.id IS 'Identificador único de la dirección';
  COMMENT ON COLUMN addresses.street_line_1 IS 'Primera línea de la dirección (calle principal)';
  COMMENT ON COLUMN addresses.street_line_2 IS 'Segunda línea de la dirección (referencias adicionales)';
  COMMENT ON COLUMN addresses.apartment_number IS 'Número de apartamento o unidad residencial, si aplica';
  COMMENT ON COLUMN addresses.postal_code IS 'Código postal de la dirección';
  COMMENT ON COLUMN addresses.municipality_id IS 'Referencia al municipio al que pertenece esta dirección';
  COMMENT ON COLUMN addresses.is_urban IS 'Indica si la dirección está en área urbana (true) o rural (false)';
  COMMENT ON COLUMN addresses.created_at IS 'Fecha y hora de creación del registro';
  COMMENT ON COLUMN addresses.created_by IS 'Usuario que creó el registro';

  COMMENT ON TABLE residences IS 'Casas o residencias donde habitan las becarias';
  COMMENT ON COLUMN residences.id IS 'Identificador único de la residencia';
  COMMENT ON COLUMN residences.name IS 'Nombre o identificador de la residencia';
  COMMENT ON COLUMN residences.phone IS 'Referencia al número de teléfono de la residencia';
  COMMENT ON COLUMN residences.address_id IS 'Referencia a la dirección física de la residencia';

  -- Sistema de Usuarios y Becarias
  COMMENT ON TABLE scholars IS 'Información detallada de las estudiantes becadas';
  COMMENT ON COLUMN scholars.id IS 'Identificador único de la becaria';
  COMMENT ON COLUMN scholars.user_id IS 'Referencia al usuario asociado a esta becaria';
  COMMENT ON COLUMN scholars.dob IS 'Fecha de nacimiento de la becaria';
  COMMENT ON COLUMN scholars.gender IS 'Género de la becaria';
  COMMENT ON COLUMN scholars.has_disability IS 'Indica si la becaria tiene alguna discapacidad';
  COMMENT ON COLUMN scholars.disability_description IS 'Descripción de la discapacidad, si aplica';
  COMMENT ON COLUMN scholars.number_of_children IS 'Número de hijos que tiene la becaria';
  COMMENT ON COLUMN scholars.ingress_date IS 'Fecha de ingreso al programa de becas';
  COMMENT ON COLUMN scholars.egress_date IS 'Fecha de salida del programa de becas, si aplica';
  COMMENT ON COLUMN scholars.egress_comments IS 'Comentarios sobre la razón de salida del programa';
  COMMENT ON COLUMN scholars.emergency_contact_name IS 'Nombre del contacto de emergencia';
  COMMENT ON COLUMN scholars.emergency_contact_phone IS 'Teléfono del contacto de emergencia';
  COMMENT ON COLUMN scholars.emergency_contact_relationship IS 'Relación del contacto de emergencia con la becaria';
  COMMENT ON COLUMN scholars.dui IS 'Documento Único de Identidad de la becaria';
  COMMENT ON COLUMN scholars.state IS 'Estado actual de la becaria en el programa (ACTIVE, INACTIVE, GRADUATED)';
  COMMENT ON COLUMN scholars.created_at IS 'Fecha y hora de creación del registro';
  COMMENT ON COLUMN scholars.created_by IS 'Usuario que creó el registro';

  COMMENT ON TABLE scholar_addresses IS 'Relación entre becarias y sus direcciones';
  COMMENT ON COLUMN scholar_addresses.id IS 'Identificador único de la relación';
  COMMENT ON COLUMN scholar_addresses.scholar_id IS 'Referencia a la becaria';
  COMMENT ON COLUMN scholar_addresses.address_id IS 'Referencia a la dirección';
  COMMENT ON COLUMN scholar_addresses.is_current IS 'Indica si es la dirección actual de la becaria';
  COMMENT ON COLUMN scholar_addresses.created_at IS 'Fecha y hora de creación del registro';
  COMMENT ON COLUMN scholar_addresses.created_by IS 'Usuario que creó el registro';

  COMMENT ON TABLE scholars_logbook IS 'Registro histórico de eventos relacionados con las becarias';
  COMMENT ON COLUMN scholars_logbook.id IS 'Identificador único del registro';
  COMMENT ON COLUMN scholars_logbook.scholar_id IS 'Referencia a la becaria asociado a este registro';
  COMMENT ON COLUMN scholars_logbook.date IS 'Fecha y hora del evento registrado';
  COMMENT ON COLUMN scholars_logbook.log IS 'Descripción detallada del evento';
  COMMENT ON COLUMN scholars_logbook.created_at IS 'Fecha y hora de creación del registro';
  COMMENT ON COLUMN scholars_logbook.created_by IS 'Usuario que creó el registro';

  -- Sistema de Comunicación
  COMMENT ON TABLE phone_numbers IS 'Catálogo central de números telefónicos';
  COMMENT ON COLUMN phone_numbers.id IS 'Identificador único del número telefónico';
  COMMENT ON COLUMN phone_numbers.number IS 'Número telefónico en formato texto';

  COMMENT ON TABLE scholar_phone_numbers IS 'Relación entre becarias y sus números telefónicos';
  COMMENT ON COLUMN scholar_phone_numbers.id IS 'Identificador único de la relación';
  COMMENT ON COLUMN scholar_phone_numbers.scholar_id IS 'Referencia a la becaria';
  COMMENT ON COLUMN scholar_phone_numbers.phone_number_id IS 'Referencia al número telefónico';
  COMMENT ON COLUMN scholar_phone_numbers.is_mobile IS 'Indica si es un teléfono móvil (true) o fijo (false)';
  COMMENT ON COLUMN scholar_phone_numbers.is_current IS 'Indica si el número está actualmente en uso';

  -- Sistema Financiero
  COMMENT ON TABLE banks IS 'Catálogo de instituciones bancarias';
  COMMENT ON COLUMN banks.id IS 'Identificador único del banco';
  COMMENT ON COLUMN banks.name IS 'Nombre de la institución bancaria';

  COMMENT ON TABLE bank_accounts IS 'Información de cuentas bancarias de las becarias';
  COMMENT ON COLUMN bank_accounts.id IS 'Identificador único de la cuenta bancaria';
  COMMENT ON COLUMN bank_accounts.account_number IS 'Número de cuenta bancaria';
  COMMENT ON COLUMN bank_accounts.account_type IS 'Tipo de cuenta: Ahorro (SAVINGS) o Corriente (CURRENT)';
  COMMENT ON COLUMN bank_accounts.bank_id IS 'Referencia a la institución bancaria';
  COMMENT ON COLUMN bank_accounts.scholar_id IS 'Referencia a la becaria dueño de la cuenta';

-- ========================================================
-- ÍNDICES
-- ========================================================

  -- Estructura Geográfica
  CREATE INDEX idx_municipalities_department_id ON municipalities(department_id);
  CREATE INDEX idx_municipalities_name ON municipalities(name);
  CREATE INDEX idx_departments_name ON departments(name);

  -- Sistema de Direcciones
  CREATE INDEX idx_addresses_municipality_id ON addresses(municipality_id);
  CREATE INDEX idx_addresses_created_by ON addresses(created_by);
  CREATE INDEX idx_addresses_created_at ON addresses(created_at);
  CREATE INDEX idx_residences_address_id ON residences(address_id);
  CREATE INDEX idx_residences_phone ON residences(phone);
  CREATE INDEX idx_residences_name ON residences(name);

  -- Sistema de Usuarios y Becarias
  CREATE INDEX idx_scholars_user_id ON scholars(user_id);
  CREATE INDEX idx_scholars_state ON scholars(state);
  CREATE INDEX idx_scholars_dob ON scholars(dob);
  CREATE INDEX idx_scholars_created_at ON scholars(created_at);
  CREATE INDEX idx_scholars_created_by ON scholars(created_by);
  CREATE INDEX idx_scholars_ingress_date ON scholars(ingress_date);
  CREATE INDEX idx_scholars_egress_date ON scholars(egress_date);

  CREATE INDEX idx_scholar_addresses_scholar_id ON scholar_addresses(scholar_id);
  CREATE INDEX idx_scholar_addresses_address_id ON scholar_addresses(address_id);
  CREATE INDEX idx_scholar_addresses_is_current ON scholar_addresses(is_current);
  CREATE INDEX idx_scholar_addresses_created_at ON scholar_addresses(created_at);

  CREATE INDEX idx_scholars_logbook_scholar_id ON scholars_logbook(scholar_id);
  CREATE INDEX idx_scholars_logbook_date ON scholars_logbook(date);
  CREATE INDEX idx_scholars_logbook_created_at ON scholars_logbook(created_at);
  CREATE INDEX idx_scholars_logbook_created_by ON scholars_logbook(created_by);

  -- Sistema de Comunicación
  CREATE INDEX idx_scholar_phone_numbers_scholar_id ON scholar_phone_numbers(scholar_id);
  CREATE INDEX idx_scholar_phone_numbers_phone_number_id ON scholar_phone_numbers(phone_number_id);
  CREATE INDEX idx_scholar_phone_numbers_is_current ON scholar_phone_numbers(is_current);
  CREATE INDEX idx_scholar_phone_numbers_is_mobile ON scholar_phone_numbers(is_mobile);
  CREATE INDEX idx_phone_numbers_number ON phone_numbers(number);

  -- Sistema Financiero
  CREATE INDEX idx_bank_accounts_scholar_id ON bank_accounts(scholar_id);
  CREATE INDEX idx_bank_accounts_bank_id ON bank_accounts(bank_id);
  CREATE INDEX idx_bank_accounts_account_type ON bank_accounts(account_type);
  CREATE INDEX idx_banks_name ON banks(name);

-- ========================================================
-- TRIGGERS
-- ========================================================

  -- Function to handle new users from Supabase Auth
  CREATE OR REPLACE FUNCTION handle_new_user() 
  RETURNS TRIGGER SECURITY DEFINER SET search_path = '' AS $$ 
  BEGIN
      IF EXISTS (
          SELECT 1
          FROM public.users
          WHERE id = new.id
      ) THEN RETURN new;
      END IF;
      INSERT INTO public.users (id, first_name, last_name, email)
      VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', new.raw_user_meta_data->>'email');
      RETURN new;
  END;
  $$ language plpgsql;

  -- Trigger for new user handling
  CREATE TRIGGER on_auth_user_created 
      AFTER INSERT ON auth.users 
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- **********************************

-- ***************** Academic related *****************

  CREATE TABLE "educational_institutions" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "students_web_portal" TEXT
  );

  CREATE TABLE "study_program_types" (
    "id" SERIAL PRIMARY KEY,
    "description" TEXT NOT NULL
  );

  CREATE TABLE "study_programs" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT UNIQUE NOT NULL,
      "is_stem" BOOLEAN DEFAULT false,
      "type" INTEGER REFERENCES study_program_types(id) NOT NULL,
      "years_to_complete" INTEGER NOT NULL
  );

  CREATE TYPE scholarship_program_state AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'REVOKED',
    'FINISHED'
  );

  CREATE TABLE scholarship_programs (
      "id" SERIAL PRIMARY KEY,
      "scholar_id" INTEGER REFERENCES scholars(id),
      "institution_id" INTEGER REFERENCES educational_institutions(id),
      "study_program_id" INTEGER REFERENCES study_programs(id),
      "start_date" DATE NOT NULL,
      "end_date" DATE,
      "current_period" INTEGER NOT NULL DEFAULT 1,
      "grade_average" DECIMAL(5,2),
      "educational_institution_username" TEXT,
      "educational_institution_password" TEXT,
      "status" scholarship_program_state NOT NULL
  );

  CREATE TYPE academic_period_state AS ENUM (
    'ACTIVE',
    'INCOMPLETE',
    'FINISHED'
  );

  CREATE TABLE academic_periods (
      "id" SERIAL PRIMARY KEY,
      "scholarship_program_id" INTEGER REFERENCES scholarship_programs(id),
      "period_number" INTEGER NOT NULL,
      "start_date" DATE NOT NULL,
      "expected_end_date" DATE NOT NULL,
      "end_date" DATE,
      "grade_average" DECIMAL(5,2),
      "status" academic_period_state NOT NULL
  );

  CREATE TABLE academic_periods_logbook (
      "id" SERIAL PRIMARY KEY,
      "academic_period_id" INTEGER REFERENCES academic_periods(id),
      "date" TIMESTAMPTZ,
      "log" TEXT,
      "created_at" TIMESTAMPTZ,
      "created_by" uuid REFERENCES users(id)
  );

  CREATE TYPE equipment_status AS ENUM (
      'AVAILABLE',
      'RESERVED',
      'ASSIGNED',
      'IN_REPAIR',
      'DISPOSED'
  );

  CREATE TABLE equipment (
      "id" SERIAL PRIMARY KEY,
      "code" TEXT NOT NULL,
      "description" TEXT,
      "estimated_cost" DECIMAL(10,2),
      "status" equipment_status NOT NULL
  );

  CREATE TABLE equipment_assignments (
      "id" SERIAL PRIMARY KEY,
      "equipment_id" INTEGER REFERENCES equipment(id) NOT NULL,
      "academic_period_id" INTEGER REFERENCES academic_periods(id) NOT NULL,
      "start_date" DATE NOT NULL,
      "end_date" DATE,
      "created_at" TIMESTAMPTZ NOT NULL,
      "created_by" uuid REFERENCES users(id) NOT NULL
  );

  CREATE TABLE equipment_comments (
      "id" SERIAL PRIMARY KEY,
      "equipment_id" INTEGER REFERENCES equipment(id) NOT NULL,
      "comment" TEXT NOT NULL,
      "created_at" TIMESTAMPTZ NOT NULL,
      "created_by" uuid REFERENCES users(id) NOT NULL
  );

-- **********************************

-- ***************** Academic & Tutor & Reinforcement related *****************

  -- Subject-related tables
  CREATE TYPE subject_status AS ENUM (
      'PASSED',
      'FAILED',
      'IN_PROGRESS'
  );

  CREATE TABLE subjects (
      "id" SERIAL PRIMARY KEY,
      "academic_period_id" INTEGER REFERENCES academic_periods(id) NOT NULL,
      "name" TEXT NOT NULL,
      "grade" DECIMAL(5,2),
      "needs_tutor" BOOLEAN,
      "status" subject_status NOT NULL DEFAULT 'IN_PROGRESS'
  );

  CREATE TABLE subject_logbook (
      "id" SERIAL PRIMARY KEY,
      "subject_id" INTEGER REFERENCES subjects(id) NOT NULL,
      "date" TIMESTAMPTZ,
      "log" TEXT,
      "created_at" TIMESTAMPTZ,
      "created_by" uuid REFERENCES users(id)
  );

  -- Weekday enum
  CREATE TYPE weekday AS ENUM (
      'MON',
      'TUE',
      'WED',
      'THU',
      'FRI',
      'SAT',
      'SUN'
  );

  -- Schedule-related tables
  CREATE TYPE schedule_type AS ENUM (
      'SUBJECT',
      'ACADEMIC_SUPPORT',
      'PSYCHOLOGICAL_SUPPORT',
      'GROUP_SUPPORT'
  );

  CREATE TABLE schedules (
      "id" SERIAL PRIMARY KEY,
      "type" schedule_type NOT NULL,
      "entity_id" INTEGER NOT NULL, -- This is the id of the subject or support
      "weekday" weekday NOT NULL,
      "start_time" TIME NOT NULL,
      "end_time" TIME NOT NULL
  );

  -- Tutors table
  CREATE TABLE tutors (
      "id" SERIAL PRIMARY KEY,
      "user_id" uuid REFERENCES users(id) NOT NULL,
      "is_volunteer" BOOLEAN NOT NULL,
      "is_psychologist" BOOLEAN NOT NULL,
      "hourly_rate" DECIMAL(6,2),
      "is_active" BOOLEAN NOT NULL
  );

  -- Support type and status
  CREATE TYPE support_type AS ENUM (
      'ACADEMIC',
      'PSYCHOLOGICAL',
      'GROUP'
  );

  CREATE TYPE support_status AS ENUM (
      'ACTIVE',
      'INACTIVE',
      'FINISHED'
  );

  -- Programs/Courses catalog
  CREATE TABLE support_programs (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "is_course" BOOLEAN NOT NULL DEFAULT false,
      "hourly_rate" DECIMAL(6,2),
      "created_at" TIMESTAMPTZ NOT NULL,
      "created_by" uuid REFERENCES users(id) NOT NULL
  );

  -- Support table
  CREATE TABLE support (
      "id" SERIAL PRIMARY KEY,
      "type" support_type NOT NULL,
      "subject_id" INTEGER REFERENCES subjects(id),         -- NULL for psychological or group
      "scholar_id" INTEGER REFERENCES scholars(id),         -- NULL for academic or group
      "program_id" INTEGER REFERENCES support_programs(id), -- NULL for academic or psychological
      "tutor_id" INTEGER REFERENCES tutors(id) NOT NULL,
      "meet_link" TEXT,
      "status" support_status NOT NULL,
      "max_participants" INTEGER
  );

  -- Group membership tracking
  CREATE TABLE support_group_members (
      "id" SERIAL PRIMARY KEY,
      "support_id" INTEGER REFERENCES support(id) NOT NULL,
      "scholar_id" INTEGER REFERENCES scholars(id) NOT NULL,
      "joined_at" TIMESTAMPTZ NOT NULL,
      "left_at" TIMESTAMPTZ,
      "created_at" TIMESTAMPTZ NOT NULL,
      "created_by" uuid REFERENCES users(id) NOT NULL,
      UNIQUE("support_id", "scholar_id", "joined_at")
  );

  -- Support sessions
  CREATE TABLE support_sessions (
      "id" SERIAL PRIMARY KEY,
      "support_id" INTEGER REFERENCES support(id) NOT NULL,
      "date" TIMESTAMPTZ NOT NULL,
      "cost" DECIMAL(8,2)
  );

  -- Session attendance tracking
  CREATE TABLE support_session_attendance (
      "id" SERIAL PRIMARY KEY,
      "session_id" INTEGER REFERENCES support_sessions(id) NOT NULL,
      "scholar_id" INTEGER REFERENCES scholars(id) NOT NULL,
      "attended" BOOLEAN NOT NULL DEFAULT false,
      "attendance_notes" TEXT,
      "created_at" TIMESTAMPTZ NOT NULL,
      "created_by" uuid REFERENCES users(id) NOT NULL,
      UNIQUE("session_id", "scholar_id")
  );

  -- Session notes
  CREATE TABLE session_notes (
      "id" SERIAL PRIMARY KEY,
      "session_id" INTEGER REFERENCES support_sessions(id) NOT NULL,
      "comment" TEXT NOT NULL,
      "is_private" BOOLEAN NOT NULL DEFAULT true,
      "created_at" TIMESTAMPTZ NOT NULL,
      "created_by" uuid REFERENCES users(id) NOT NULL
  );

  -- Support materials
  CREATE TABLE support_materials (
      "id" SERIAL PRIMARY KEY,
      "support_id" INTEGER REFERENCES support(id) NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "file_key" TEXT,          -- For S3 or similar storage
      "file_type" TEXT,
      "created_at" TIMESTAMPTZ NOT NULL,
      "created_by" uuid REFERENCES users(id) NOT NULL
  );

-- **********************************

-- ***************** Budget & Request & Liquidation related *****************

  -- Catálogos
  CREATE TABLE budget_categories (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "requires_explanation" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true
  );

  CREATE TABLE budget_items (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category_id" INTEGER REFERENCES budget_categories(id) NOT NULL
  );

  CREATE TYPE fund_operations_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'APPROVED',
    'REJECTED'
  );

  CREATE TYPE fund_flow_type AS ENUM (
    'BUDGET',
    'REQUEST',
    'LIQUIDATION'
  );

  -- Combined header table
  CREATE TABLE fund_flows (
    "id" SERIAL PRIMARY KEY,
    "type" fund_flow_type NOT NULL,
    "academic_period_id" INTEGER REFERENCES academic_periods(id),   -- For budgets
    "scholar_id" INTEGER REFERENCES scholars(id),                   -- For requests
    "parent_flow_id" INTEGER REFERENCES fund_flows(id),             -- For requests->budgets and liquidations->requests
    "status" fund_operations_status NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "created_by" uuid REFERENCES users(id) NOT NULL,
    "submitted_at" TIMESTAMPTZ,
    "approved_at" TIMESTAMPTZ,
    "approved_by" uuid REFERENCES users(id),
    CONSTRAINT valid_flow CHECK (
      (type = 'BUDGET' AND academic_period_id IS NOT NULL AND scholar_id IS NULL AND parent_flow_id IS NULL) OR
      (type = 'REQUEST' AND academic_period_id IS NULL AND scholar_id IS NOT NULL AND parent_flow_id IS NOT NULL) OR
      (type = 'LIQUIDATION' AND academic_period_id IS NULL AND scholar_id IS NULL AND parent_flow_id IS NOT NULL)
    )
  );

  -- Items table
  CREATE TABLE fund_flow_items (
    "id" SERIAL PRIMARY KEY,
    "fund_flow_id" INTEGER REFERENCES fund_flows(id) NOT NULL,
    "budget_item_id" INTEGER REFERENCES budget_items(id) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "parent_item_id" INTEGER REFERENCES fund_flow_items(id)         -- For linking request->budget items and liquidation->request items
  );

  -- Comments table
  CREATE TABLE fund_flow_comments (
    "id" SERIAL PRIMARY KEY,
    "fund_flow_id" INTEGER REFERENCES fund_flows(id) NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL,
    "created_by" uuid REFERENCES users(id) NOT NULL
  );

  -- Schedule table to track the flow of funds
  CREATE TABLE fund_flow_schedule (
    id SERIAL PRIMARY KEY,
    fund_flow_id INTEGER REFERENCES fund_flows(id) NOT NULL,
    planned_deposit_date TIMESTAMPTZ,
    actual_deposit_date TIMESTAMPTZ,
    liquidation_due_date TIMESTAMPTZ,
    deposited_by uuid REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL,
    created_by uuid REFERENCES users(id) NOT NULL
);

  CREATE TABLE expense_receipts (
    "id" SERIAL PRIMARY KEY,
    "item_id" INTEGER REFERENCES fund_flow_items(id) NOT NULL,
    "file_key" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "receipt_date" TIMESTAMPTZ NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL
  );
-- **********************************

-- CREATE TABLE "det_costos_casa" (
--   "dcc_id" integer PRIMARY KEY,
--   "dcc_comentarios" varchar(500),
--   "dcc_estado" varchar(3),
--   "dcc_monto" numeric(6,2),
--   "rbf_id" integer REFERENCES rubros_fondos(rbf_id),
--   "cas_id" integer REFERENCES casas(cas_id)
-- );


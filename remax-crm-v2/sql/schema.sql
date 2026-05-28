-- ============================================================
-- RE/MAX CRM V2 - SCHEMA SUPABASE
-- ============================================================

-- Tabla: USUARIOS
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE,
  name text,
  role text DEFAULT 'agent',
  avatar_url text,
  settings jsonb DEFAULT '{}',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Tabla: CONTACTOS
CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  status text DEFAULT 'activo',
  type text,
  origin text,
  birthday date,
  notes text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  deleted_at timestamp
);

CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_status ON contacts(status);

-- Tabla: PROPIEDADES
CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address text NOT NULL,
  type text,
  price_usd numeric,
  price_ars numeric,
  area_sqm numeric,
  rooms integer,
  bathrooms integer,
  location jsonb,
  photos jsonb DEFAULT '[]',
  notes text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX idx_properties_user_id ON properties(user_id);

-- Tabla: OPERACIONES
CREATE TABLE operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_contact_id uuid REFERENCES contacts(id),
  buyer_contact_id uuid REFERENCES contacts(id),
  property_id uuid REFERENCES properties(id),
  type text,
  stage text DEFAULT 'propuesta',
  price_usd numeric,
  price_ars numeric,
  commission_percent numeric DEFAULT 0,
  commission_amount numeric,
  stage_date timestamp DEFAULT now(),
  notes text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  deleted_at timestamp
);

CREATE INDEX idx_operations_user_id ON operations(user_id);
CREATE INDEX idx_operations_stage ON operations(stage);

-- Tabla: OPERACION - HISTORIAL DE ETAPAS
CREATE TABLE operation_stage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id uuid NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  from_stage text,
  to_stage text,
  changed_by uuid REFERENCES users(id),
  changed_at timestamp DEFAULT now()
);

-- Tabla: TRANSACCIONES / FINANZAS
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  category text,
  amount_ars numeric NOT NULL,
  amount_usd numeric,
  description text,
  date date DEFAULT now(),
  notes text,
  created_at timestamp DEFAULT now()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);

-- Tabla: SEGUIMIENTO SEMANAL
CREATE TABLE tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year integer NOT NULL,
  week_number integer NOT NULL,
  month integer,
  days jsonb,
  weekly_totals jsonb,
  updated_at timestamp DEFAULT now(),
  UNIQUE(user_id, year, week_number)
);

CREATE INDEX idx_tracking_user_week ON tracking(user_id, year, week_number);

-- Tabla: TASACIONES (ACM)
CREATE TABLE appraisals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id),
  property_id uuid REFERENCES properties(id),
  address text,
  area_sqm numeric,
  estimated_price_usd numeric,
  status text DEFAULT 'pendiente',
  result text,
  notes text,
  appraisal_date date,
  created_at timestamp DEFAULT now()
);

CREATE INDEX idx_appraisals_user_id ON appraisals(user_id);
CREATE INDEX idx_appraisals_status ON appraisals(status);

-- Tabla: NURTURING (SEGUIMIENTO AUTOMATICO)
CREATE TABLE nurturing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  current_stage text DEFAULT 'inicial',
  days_in_stage integer DEFAULT 0,
  last_touch timestamp,
  next_touch timestamp,
  touch_history jsonb DEFAULT '[]',
  notes text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX idx_nurturing_user_contact ON nurturing(user_id, contact_id);

-- Tabla: POST-VENTA
CREATE TABLE postsales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  operation_id uuid REFERENCES operations(id),
  contact_id uuid REFERENCES contacts(id),
  stage text DEFAULT '3_weeks',
  satisfaction_score integer,
  referral_contact_id uuid REFERENCES contacts(id),
  referral_converted boolean DEFAULT false,
  notes text,
  created_at timestamp DEFAULT now()
);

CREATE INDEX idx_postsales_user_id ON postsales(user_id);

-- Tabla: COLEGAS
CREATE TABLE colleagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  company text,
  notes text,
  created_at timestamp DEFAULT now()
);

-- Tabla: AUDITORÍA
CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  action text,
  table_name text,
  record_id uuid,
  changes jsonb,
  ip_address text,
  created_at timestamp DEFAULT now()
);

CREATE INDEX idx_audit_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_created_at ON audit_log(created_at);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE appraisals ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurturing ENABLE ROW LEVEL SECURITY;
ALTER TABLE postsales ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (usuarios ven solo sus datos)
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can read own contacts" ON contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contacts" ON contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts" ON contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts" ON contacts
  FOR DELETE USING (auth.uid() = user_id);

-- Similar para otras tablas...

-- ============================================================
-- FUNCIONES ÚTILES
-- ============================================================

-- Función para obtener comisión de operación
CREATE OR REPLACE FUNCTION calculate_commission(price NUMERIC, percent NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  RETURN price * (percent / 100);
END;
$$ LANGUAGE plpgsql;

-- Función para auditoría (registrar cambios)
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (user_id, action, table_name, record_id, changes)
  VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Activar trigger para auditoría
-- CREATE TRIGGER audit_operations AFTER INSERT OR UPDATE ON operations FOR EACH ROW EXECUTE FUNCTION log_audit();

-- ============================================================
-- DATOS DE EJEMPLO
-- ============================================================

-- Insertar usuario demo (comentado, descomentar si necesitas)
-- INSERT INTO users (id, email, name, role)
-- VALUES ('550e8400-e29b-41d4-a716-446655440000', 'demo@remax.com', 'Demo User', 'agent');

-- ============================================================
-- FIN SCHEMA
-- ============================================================

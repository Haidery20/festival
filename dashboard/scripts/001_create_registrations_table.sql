-- Create registrations table for Land Rover Festival
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number TEXT UNIQUE NOT NULL,
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT,
  emergency_contact TEXT NOT NULL,
  emergency_phone TEXT NOT NULL,
  
  -- Vehicle Information
  vehicle_model TEXT NOT NULL,
  vehicle_year TEXT NOT NULL,
  model_description TEXT NOT NULL,
  engine_size TEXT,
  modifications TEXT,
  
  -- Additional Information
  accommodation_type TEXT,
  dietary_restrictions TEXT,
  medical_conditions TEXT,
  previous_participation BOOLEAN DEFAULT false,
  hear_about_us TEXT,
  
  -- Terms and Consents
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  insurance_confirmed BOOLEAN NOT NULL DEFAULT false,
  safety_acknowledged BOOLEAN NOT NULL DEFAULT false,
  media_consent BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);

-- Create index on registration_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_registrations_number ON registrations(registration_number);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at DESC);

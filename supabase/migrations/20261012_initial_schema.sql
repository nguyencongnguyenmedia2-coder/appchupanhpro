-- supabase/migrations/20261012_initial_schema.sql
-- ====================================================================
-- TIMESTAMP PRO – CHỤP ẢNH THỰC TẾ & QUẢN LÝ CHẤM CÔNG
-- PostgreSQL Database Schema & Row Level Security (RLS) Policies
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    tax_code VARCHAR(50),
    address TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Profiles (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    employee_code VARCHAR(50),
    department VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(30) DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff')),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Organization Members
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(30) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 5. Teams (Work groups)
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(30) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Team Members
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(30) DEFAULT 'member' CHECK (role IN ('leader', 'member')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- 7. Projects (Work sites, constructions)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location_address TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    radius_meters INT DEFAULT 300,
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Stamp Templates
CREATE TABLE IF NOT EXISTS public.stamp_templates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    badge_text TEXT,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_vip BOOLEAN DEFAULT FALSE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Photos (Primary Records)
CREATE TABLE IF NOT EXISTS public.photos (
    id VARCHAR(100) PRIMARY KEY, -- TSP-20261012-XXXX
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    original_image_path TEXT,
    stamped_image_path TEXT NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL,
    server_received_at TIMESTAMPTZ DEFAULT NOW(),
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    gps_accuracy INT,
    address TEXT NOT NULL,
    note TEXT,
    sha256_hash VARCHAR(64) NOT NULL,
    template_id VARCHAR(50) REFERENCES public.stamp_templates(id) ON DELETE SET NULL,
    sync_status VARCHAR(30) DEFAULT 'synced' CHECK (sync_status IN ('pending', 'syncing', 'synced', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Photo Metadata (EXIF, Device, Network info)
CREATE TABLE IF NOT EXISTS public.photo_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id VARCHAR(100) NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
    device_model VARCHAR(100),
    os_version VARCHAR(50),
    app_version VARCHAR(20),
    camera_facing VARCHAR(10),
    is_mock_location BOOLEAN DEFAULT FALSE,
    network_type VARCHAR(30),
    file_size_bytes INT,
    image_width INT,
    image_height INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(photo_id)
);

-- 11. Photo Verifications (Audit & Tamper Check)
CREATE TABLE IF NOT EXISTS public.photo_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id VARCHAR(100) NOT NULL REFERENCES public.photos(id) ON DELETE CASCADE,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_valid BOOLEAN NOT NULL,
    computed_hash VARCHAR(64) NOT NULL,
    expected_hash VARCHAR(64) NOT NULL,
    verification_notes TEXT[],
    verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Attendance Records (Chấm Công)
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('check_in', 'check_out', 'overtime_in', 'overtime_out')),
    captured_at TIMESTAMPTZ NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    gps_accuracy INT,
    address TEXT,
    distance_meters INT,
    is_within_geofence BOOLEAN DEFAULT TRUE,
    photo_id VARCHAR(100) REFERENCES public.photos(id) ON DELETE SET NULL,
    sha256_hash VARCHAR(64),
    status VARCHAR(30) DEFAULT 'on_time' CHECK (status IN ('on_time', 'late', 'early_leave', 'outside_geofence')),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Subscriptions (Bản Quyền VIP/Plus/Enterprise)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    tier VARCHAR(30) NOT NULL CHECK (tier IN ('free', 'plus', 'enterprise')),
    storage_limit_bytes BIGINT DEFAULT 16106127360, -- 15 GB
    storage_used_bytes BIGINT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'canceled')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Payments (Lịch Sử Thanh Toán)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'VND',
    payment_method VARCHAR(50) CHECK (payment_method IN ('vietqr', 'momo', 'vnpay', 'zalopay', 'bank_transfer')),
    transaction_code VARCHAR(100) UNIQUE,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Audit Logs (Nhật Ký Kiểm Toán Toàn Vẹn)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    ip_address VARCHAR(50),
    user_agent TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_photos_owner ON public.photos(owner_id);
CREATE INDEX IF NOT EXISTS idx_photos_project ON public.photos(project_id);
CREATE INDEX IF NOT EXISTS idx_photos_team ON public.photos(team_id);
CREATE INDEX IF NOT EXISTS idx_photos_captured_at ON public.photos(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_sha256 ON public.photos(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON public.attendance_records(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records(captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles policy: Users can view their own profile and teammates
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. Photos policy: Users can see their own photos and photos of their assigned projects
CREATE POLICY "Users can select permitted photos"
    ON public.photos FOR SELECT
    USING (
        auth.uid() = owner_id OR
        EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = photos.team_id AND tm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their photos"
    ON public.photos FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- 3. Attendance policy: Staff can see own attendance, managers see all team attendance
CREATE POLICY "Attendance visibility policy"
    ON public.attendance_records FOR SELECT
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Users can insert attendance records"
    ON public.attendance_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 4. Audit logs: Read-only for authorized admins
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

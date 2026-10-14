-- Uni-Tap Phase 2 Row Level Security
-- Run after the complete database schema has been created.

CREATE OR REPLACE FUNCTION public.has_role(req_role public.user_role_enum)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = req_role
  );
$$;

REVOKE ALL ON FUNCTION public.has_role(public.user_role_enum) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(public.user_role_enum) TO authenticated;

DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  END LOOP;
END;
$$;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_section_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorized_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE charge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_scoped
ON profiles FOR SELECT TO authenticated
USING (
  id = auth.uid()
  OR public.has_role('csg_officer'::public.user_role_enum)
  OR public.has_role('csg_admin'::public.user_role_enum)
);

CREATE POLICY profiles_admin_manage
ON profiles FOR ALL TO authenticated
USING (public.has_role('csg_admin'::public.user_role_enum))
WITH CHECK (public.has_role('csg_admin'::public.user_role_enum));

CREATE POLICY user_roles_select_scoped
ON user_roles FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_role('csg_admin'::public.user_role_enum)
);

CREATE POLICY user_roles_admin_manage
ON user_roles FOR ALL TO authenticated
USING (public.has_role('csg_admin'::public.user_role_enum))
WITH CHECK (public.has_role('csg_admin'::public.user_role_enum));

CREATE POLICY academic_terms_authenticated_read
ON academic_terms FOR SELECT TO authenticated
USING (true);

CREATE POLICY academic_terms_admin_manage
ON academic_terms FOR ALL TO authenticated
USING (public.has_role('csg_admin'::public.user_role_enum))
WITH CHECK (public.has_role('csg_admin'::public.user_role_enum));

CREATE POLICY sections_authenticated_read
ON sections FOR SELECT TO authenticated
USING (true);

CREATE POLICY sections_admin_manage
ON sections FOR ALL TO authenticated
USING (public.has_role('csg_admin'::public.user_role_enum))
WITH CHECK (public.has_role('csg_admin'::public.user_role_enum));

CREATE POLICY student_history_select_scoped
ON student_section_history FOR SELECT TO authenticated
USING (
  student_id = auth.uid()
  OR public.has_role('csg_officer'::public.user_role_enum)
  OR public.has_role('csg_admin'::public.user_role_enum)
);

CREATE POLICY student_history_admin_manage
ON student_section_history FOR ALL TO authenticated
USING (public.has_role('csg_admin'::public.user_role_enum))
WITH CHECK (public.has_role('csg_admin'::public.user_role_enum));

CREATE POLICY nfc_cards_select_scoped
ON nfc_cards FOR SELECT TO authenticated
USING (
  student_id = auth.uid()
  OR public.has_role('csg_officer'::public.user_role_enum)
  OR public.has_role('csg_admin'::public.user_role_enum)
);

CREATE POLICY nfc_cards_admin_manage
ON nfc_cards FOR ALL TO authenticated
USING (public.has_role('csg_admin'::public.user_role_enum))
WITH CHECK (public.has_role('csg_admin'::public.user_role_enum));

CREATE POLICY devices_select_scoped
ON authorized_devices FOR SELECT TO authenticated
USING (
  officer_id = auth.uid()
  OR public.has_role('csg_admin'::public.user_role_enum)
);

CREATE POLICY devices_admin_manage
ON authorized_devices FOR ALL TO authenticated
USING (public.has_role('csg_admin'::public.user_role_enum))
WITH CHECK (public.has_role('csg_admin'::public.user_role_enum));

CREATE POLICY attendance_select_scoped
ON attendance_records FOR SELECT TO authenticated
USING (
  student_id = auth.uid()
  OR public.has_role('csg_officer'::public.user_role_enum)
  OR public.has_role('csg_admin'::public.user_role_enum)
);

CREATE POLICY attendance_officer_insert
ON attendance_records FOR INSERT TO authenticated
WITH CHECK (
  public.has_role('csg_officer'::public.user_role_enum)
  OR public.has_role('csg_admin'::public.user_role_enum)
);

CREATE POLICY attendance_admin_manage
ON attendance_records FOR ALL TO authenticated
USING (public.has_role('csg_admin'::public.user_role_enum))
WITH CHECK (public.has_role('csg_admin'::public.user_role_enum));

CREATE POLICY scan_audit_officer_read
ON scan_audit_logs FOR SELECT TO authenticated
USING (
  public.has_role('csg_officer'::public.user_role_enum)
  OR public.has_role('csg_admin'::public.user_role_enum)
);

CREATE POLICY scan_audit_officer_insert
ON scan_audit_logs FOR INSERT TO authenticated
WITH CHECK (
  scanned_by_officer_id = auth.uid()
  AND (
    public.has_role('csg_officer'::public.user_role_enum)
    OR public.has_role('csg_admin'::public.user_role_enum)
  )
);

CREATE POLICY wallets_select_scoped
ON wallets FOR SELECT TO authenticated
USING (
  student_id = auth.uid()
  OR public.has_role('csg_admin'::public.user_role_enum)
);

CREATE POLICY wallet_ledger_select_scoped
ON wallet_ledger FOR SELECT TO authenticated
USING (
  student_id = auth.uid()
  OR public.has_role('csg_admin'::public.user_role_enum)
);

CREATE POLICY charge_templates_authenticated_read
ON charge_templates FOR SELECT TO authenticated
USING (true);

CREATE POLICY student_charges_select_scoped
ON student_charges FOR SELECT TO authenticated
USING (
  student_id = auth.uid()
  OR public.has_role('csg_admin'::public.user_role_enum)
);

CREATE POLICY payments_select_scoped
ON payments FOR SELECT TO authenticated
USING (
  student_id = auth.uid()
  OR public.has_role('csg_admin'::public.user_role_enum)
);

CREATE POLICY payment_items_select_scoped
ON payment_items FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM payments
    WHERE payments.id = payment_items.payment_id
      AND (
        payments.student_id = auth.uid()
        OR public.has_role('csg_admin'::public.user_role_enum)
      )
  )
);

CREATE POLICY audit_logs_insert_own
ON system_audit_logs FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY audit_logs_admin_read
ON system_audit_logs FOR SELECT TO authenticated
USING (public.has_role('csg_admin'::public.user_role_enum));

-- Events and schedules are intentionally deny-by-default until Phase 3
-- policies are defined for event ownership and student visibility.

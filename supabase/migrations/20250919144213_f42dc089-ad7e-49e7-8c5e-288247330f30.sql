-- Continue fixing security definer functions

-- 3. Modify check_project_alerts to work without SECURITY DEFINER
-- This function just checks project expiration, doesn't need elevated privileges
CREATE OR REPLACE FUNCTION public.check_project_alerts()
RETURNS TABLE(project_id uuid, nome_projeto text, days_remaining integer)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nome_projeto,
    EXTRACT(DAY FROM p.expires_at - now())::INTEGER as days_remaining
  FROM public.projects p
  WHERE p.project_status = 'ativo'
    AND p.expires_at <= now() + INTERVAL '10 days'
    AND p.expires_at > now()
    AND p.alert_sent = false;
END;
$function$;

-- 4. Modify renew_project to work without SECURITY DEFINER
-- Add proper user authentication check instead of bypassing RLS
CREATE OR REPLACE FUNCTION public.renew_project(project_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  current_project RECORD;
  renewal_record JSONB;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get current project with proper user check (respects RLS)
  SELECT * INTO current_project FROM public.projects WHERE id = project_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Create renewal record
  renewal_record = jsonb_build_object(
    'renewed_at', now(),
    'previous_expiry', current_project.expires_at,
    'renewed_by', auth.uid()
  );
  
  -- Update project with new expiry and renewal info (respects RLS)
  UPDATE public.projects SET
    expires_at = now() + INTERVAL '90 days',
    renewal_count = renewal_count + 1,
    renewal_history = renewal_history || renewal_record,
    renewal_requested = false,
    alert_sent = false,
    updated_at = now()
  WHERE id = project_id;
  
  RETURN TRUE;
END;
$function$;
-- Fix security definer functions that don't need elevated privileges

-- 1. Remove SECURITY DEFINER from validate_password_strength (pure function, no DB access needed)
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check minimum length
  IF length(password) < 8 THEN
    RETURN false;
  END IF;
  
  -- Check for at least one uppercase letter
  IF password !~ '[A-Z]' THEN
    RETURN false;
  END IF;
  
  -- Check for at least one lowercase letter
  IF password !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- Check for at least one number
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;

-- 2. Remove SECURITY DEFINER from generate_workflow_documentation (doesn't need elevated access)
CREATE OR REPLACE FUNCTION public.generate_workflow_documentation(workflow_content jsonb)
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
DECLARE
  node_count integer;
  node_types text[];
  workflow_description text;
BEGIN
  -- Extract basic info from workflow content
  node_count := jsonb_array_length(workflow_content->'nodes');
  
  -- Extract node types
  SELECT array_agg(DISTINCT node_info->>'type') 
  INTO node_types
  FROM jsonb_array_elements(workflow_content->'nodes') AS node_info;
  
  -- Generate basic documentation template
  workflow_description := 'Este workflow contém ' || node_count || ' nodes e utiliza os seguintes tipos de integração: ' || array_to_string(node_types, ', ') || '.';
  
  RETURN workflow_description;
END;
$function$;
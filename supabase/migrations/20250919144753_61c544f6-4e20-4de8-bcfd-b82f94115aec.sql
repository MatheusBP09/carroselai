-- Create a privacy-focused leaderboard system that doesn't need SECURITY DEFINER
-- This creates anonymized leaderboard data that can be accessed without elevated privileges

-- First, create a view that provides anonymized leaderboard data
CREATE OR REPLACE VIEW public.leaderboard_data AS
SELECT 
    p.user_id,
    -- Anonymize the display name for privacy
    CASE 
        WHEN LENGTH(COALESCE(p.full_name, '')) > 0 THEN 
            LEFT(p.full_name, 1) || '***'
        ELSE 'User***'
    END as display_name,
    COUNT(cp.id) as course_score,
    COALESCE(SUM(uw.workflows_count), 0) as workflow_score
FROM public.profiles p
LEFT JOIN public.course_progress cp ON p.user_id = cp.user_id
LEFT JOIN public.user_workflows_created uw ON p.user_id = uw.user_id
GROUP BY p.user_id, p.full_name;

-- Enable RLS on this view
ALTER VIEW public.leaderboard_data SET (security_barrier = true);

-- Create RLS policy that allows everyone to see the anonymized leaderboard data
CREATE POLICY "Everyone can view anonymized leaderboard data" 
ON public.leaderboard_data 
FOR SELECT 
USING (true);

-- Now create replacement functions that don't need SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_course_leaderboard_secure()
RETURNS TABLE(user_id uuid, display_name text, score bigint, rank bigint)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT 
    ld.user_id,
    ld.display_name,
    ld.course_score as score,
    ROW_NUMBER() OVER (ORDER BY ld.course_score DESC) as rank
  FROM public.leaderboard_data ld
  ORDER BY score DESC
  LIMIT 100;
$function$;

CREATE OR REPLACE FUNCTION public.get_workflow_leaderboard_secure()
RETURNS TABLE(user_id uuid, display_name text, score bigint, rank bigint)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT 
    ld.user_id,
    ld.display_name,
    ld.workflow_score as score,
    ROW_NUMBER() OVER (ORDER BY ld.workflow_score DESC) as rank
  FROM public.leaderboard_data ld
  ORDER BY score DESC
  LIMIT 100;
$function$;
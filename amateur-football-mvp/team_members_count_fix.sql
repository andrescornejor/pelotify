-- TRIGGER TO AUTOMATICALLY SYNC THE MEMBERS_COUNT IN THE TEAMS TABLE
-- This trigger ensures that only CONFIRMED members are counted towards the members_count.
-- This fix addresses the bug where invited/requested players were being counted before accepting.

-- 1. Create or replace the function to handle member change
CREATE OR REPLACE FUNCTION public.handle_team_member_count_sync()
RETURNS TRIGGER AS $$
DECLARE
    v_team_id UUID;
BEGIN
    -- Determine which team we are updating
    IF (TG_OP = 'DELETE') THEN
        v_team_id := OLD.team_id;
    ELSE
        v_team_id := NEW.team_id;
    END IF;

    -- Update the teams table with the correct count of confirmed members
    UPDATE public.teams
    SET members_count = (
        SELECT count(*)
        FROM public.team_members
        WHERE team_id = v_team_id AND status = 'confirmed'
    )
    WHERE id = v_team_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the trigger to the team_members table
DROP TRIGGER IF EXISTS tr_team_member_count_sync ON public.team_members;
CREATE TRIGGER tr_team_member_count_sync
AFTER INSERT OR UPDATE OR DELETE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.handle_team_member_count_sync();

-- 3. Run an initial sync for all existing teams to correct any current errors
UPDATE public.teams t
SET members_count = (
    SELECT count(*)
    FROM public.team_members tm
    WHERE tm.team_id = t.id AND tm.status = 'confirmed'
);

-- 4. OPTIONAL: If the captain is not automatically added on creation, 
-- we ensure the captain is always part of the team members as 'confirmed'.
-- This trigger handles automatic captain-to-member inclusion if it's not already in place.
CREATE OR REPLACE FUNCTION public.ensure_captain_is_member()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.team_members (team_id, user_id, profile_id, role, status)
    VALUES (NEW.id, NEW.captain_id, NEW.captain_id, 'captain', 'confirmed')
    ON CONFLICT (team_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_ensure_captain_is_member ON public.teams;
CREATE TRIGGER tr_ensure_captain_is_member
AFTER INSERT ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.ensure_captain_is_member();

alter table public.matches
add column if not exists sport text not null default 'football';

alter table public.matches
drop constraint if exists matches_sport_check;

alter table public.matches
add constraint matches_sport_check
check (sport in ('football', 'padel', 'basket'));

update public.matches
set sport = case
  when type = 'PADEL' then 'padel'
  when type = 'BASKET' then 'basket'
  else 'football'
end
where sport is null
   or sport not in ('football', 'padel', 'basket');

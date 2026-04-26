begin;

-- Phase 3 seller recovery foundation.
-- Keep this migration focused on schema/type foundations only; application
-- flows, UI, and business logic are handled in later phases.

alter table public.seller_profiles
  add column if not exists support_email text null,
  add column if not exists business_email text null,
  add column if not exists phone text null,
  add column if not exists country_code text null,
  add column if not exists agreement_accepted_at timestamptz null,
  add column if not exists rejection_reason text null,
  add column if not exists suspension_reason text null,
  add column if not exists resubmitted_at timestamptz null,
  add column if not exists approved_at timestamptz null,
  add column if not exists approved_by uuid null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.seller_profiles'::regclass
      and conname = 'seller_profiles_approved_by_fkey'
  ) then
    alter table public.seller_profiles
      add constraint seller_profiles_approved_by_fkey
      foreign key (approved_by)
      references public.profiles(id)
      on delete set null;
  end if;
end
$$;

create index if not exists seller_profiles_country_code_idx
  on public.seller_profiles (country_code)
  where country_code is not null;

create index if not exists seller_profiles_support_email_idx
  on public.seller_profiles (support_email)
  where support_email is not null;

create index if not exists seller_profiles_resubmitted_at_desc_idx
  on public.seller_profiles (resubmitted_at desc)
  where resubmitted_at is not null;

commit;

insert into public.frameworks (key, name, summary, components)
values
  (
    'CARE',
    'CARE',
    'Context -> Answer -> Reason -> Example',
    '[{"key":"context","label":"Context"},{"key":"answer","label":"Answer"},{"key":"reason","label":"Reason"},{"key":"example","label":"Example"}]'::jsonb
  ),
  (
    'PREP',
    'PREP',
    'Point -> Reason -> Example -> Point',
    '[{"key":"point_open","label":"Point"},{"key":"reason","label":"Reason"},{"key":"example","label":"Example"},{"key":"point_close","label":"Re-point"}]'::jsonb
  ),
  (
    'STAR',
    'STAR',
    'Situation -> Task -> Action -> Result',
    '[{"key":"situation","label":"Situation"},{"key":"task","label":"Task"},{"key":"action","label":"Action"},{"key":"result","label":"Result"}]'::jsonb
  )
on conflict (key) do nothing;

insert into public.topic_framework_rules (topic_category, default_framework, allow_manual_override)
values
  ('general_thinking', 'CARE', true),
  ('opinion', 'PREP', true),
  ('interview', 'STAR', true);

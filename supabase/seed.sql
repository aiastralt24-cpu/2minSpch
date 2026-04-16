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
  ('interview', 'STAR', true)
on conflict (topic_category) do update
set
  default_framework = excluded.default_framework,
  allow_manual_override = excluded.allow_manual_override;

insert into public.topics (title, category, difficulty, framework, tags, prompt_style, is_active)
values
  (
    'Why is time management important in everyday life?',
    'general_thinking',
    'easy',
    'CARE',
    array['productivity', 'self-management'],
    'reflective',
    true
  ),
  (
    'What makes someone a strong lifelong learner?',
    'general_thinking',
    'medium',
    'CARE',
    array['growth', 'mindset'],
    'reflective',
    true
  ),
  (
    'How should people respond to difficult feedback?',
    'general_thinking',
    'hard',
    'CARE',
    array['communication', 'self-awareness'],
    'reflective',
    true
  ),
  (
    'Is remote work better than office work?',
    'opinion',
    'easy',
    'PREP',
    array['workplace', 'hybrid'],
    'debate',
    true
  ),
  (
    'Should AI be a core part of school education?',
    'opinion',
    'medium',
    'PREP',
    array['education', 'ai'],
    'debate',
    true
  ),
  (
    'Would a four-day workweek improve productivity?',
    'opinion',
    'hard',
    'PREP',
    array['future-of-work', 'productivity'],
    'debate',
    true
  ),
  (
    'Tell me about a time you handled conflict on a team.',
    'interview',
    'medium',
    'STAR',
    array['teamwork', 'conflict'],
    'behavioral',
    true
  ),
  (
    'Tell me about a time you failed and what you learned.',
    'interview',
    'medium',
    'STAR',
    array['growth', 'resilience'],
    'behavioral',
    true
  ),
  (
    'Describe a time you took ownership under pressure.',
    'interview',
    'hard',
    'STAR',
    array['leadership', 'ownership'],
    'behavioral',
    true
  )
on conflict (title) do update
set
  category = excluded.category,
  difficulty = excluded.difficulty,
  framework = excluded.framework,
  tags = excluded.tags,
  prompt_style = excluded.prompt_style,
  is_active = excluded.is_active;

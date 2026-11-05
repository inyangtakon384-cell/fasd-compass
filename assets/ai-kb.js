// FASD Compass AI knowledge base. v1.2.10
// Every answer here is written in advance and needs clinical review before release.
// Fields: id, q (example question, also used for suggestion buttons), aud (audiences the
// answer is written for: parent, teacher, clinician), tags (words and phrases to match),
// answer, src (where the information comes from), page (FASD Compass page to read more),
// unc (optional line about uncertainty in the evidence).
(function (root) {
const PRACTICAL = 'Practical strategies come from clinical experience and expert consensus. There is little trial evidence for individual strategies, so try them and keep what works for the child.';
const KB = [
  // ── ABOUT FASD ──────────────────────────────────────────────────────
  { id: 'what-is', q: 'What is FASD?', aud: ['parent', 'teacher', 'clinician'],
    tags: ['what is fasd', 'what does fasd', 'fasd mean', 'about fasd', 'fetal alcohol spectrum', 'meaning of fasd', 'what causes fasd', 'cause of fasd', 'caused by alcohol', 'alcohol abuse', 'alcohol misuse'],
    answer: `**What is FASD?**

Fetal Alcohol Spectrum Disorder (FASD) is a lifelong neurodevelopmental condition caused by exposure to alcohol before birth. It affects how the brain grows and works. This can lead to difficulties with learning, memory, attention, language, behaviour and everyday living.

SIGN 156 describes two types:
• **FASD with sentinel facial features:** all three facial features linked to alcohol exposure are present.
• **FASD without sentinel facial features:** most people with FASD have no visible facial features, but their brain is still affected.

FASD is often missed. Many children with FASD also have strengths, and the right support makes a real difference.`,
    src: 'SIGN 156 (2019) and NICE QS204 (2022)', page: 'parents' },

  { id: 'prevalence', q: 'How common is FASD?', aud: ['parent', 'teacher', 'clinician'],
    tags: ['how common', 'prevalence', 'how many people', 'how many children', 'affected by fasd', 'statistics'],
    answer: `**How common is FASD?**

SIGN estimates that about 3.2% of babies born in the UK are affected by FASD, and that up to 172,000 people in Scotland may be affected.

In a small study of three primary schools in Greater Manchester, 1.8% of children had FASD, or 3.6% when possible cases were included. None of them had been diagnosed before.

FASD is underdiagnosed. Between 2010 and 2015, only 41 cases of fetal alcohol syndrome were identified in Scotland in children under six. This is far fewer than population estimates would predict.

Reasons it is missed include:
• alcohol in pregnancy is often not considered as a cause of developmental difficulties
• most children with FASD have no visible facial features
• some professionals are not confident about making the diagnosis
• FASD can be mistaken for ADHD, autism or conduct difficulties`,
    unc: 'These figures are estimates. The UK has not yet had a large national study, and results vary with the method used, so the true number is uncertain.',
    src: 'SIGN 156 (2019) and McCarthy et al. (2021)', page: 'evidence' },

  { id: 'fas-vs-fasd', q: 'What is the difference between FAS and FASD?', aud: ['parent', 'teacher', 'clinician'],
    tags: ['fas and fasd', 'fas or fasd', 'fas vs', 'fetal alcohol syndrome', 'difference between fas', 'fae', 'arnd', 'pfas'],
    answer: `**What is the difference between FAS and FASD?**

Fetal alcohol syndrome (FAS) is an older term. It was used for people with the facial features, growth problems and brain differences linked to alcohol exposure. Other older terms include partial FAS and alcohol-related neurodevelopmental disorder (ARND).

In the UK, SIGN 156 replaced these terms with FASD, an umbrella term with two types:
• **FASD with sentinel facial features**, which covers most people who would once have been diagnosed with FAS
• **FASD without sentinel facial features**, which is far more common

You may still see the older terms in older reports and letters. A child with "FASD without sentinel facial features" is not less affected. Their brain-based difficulties can be just as significant.`,
    src: 'SIGN 156 (2019)', page: 'clinicians' },

  { id: 'is-genetic', q: 'Is FASD genetic?', aud: ['parent', 'teacher'],
    tags: ['genetic', 'genes', 'inherited', 'hereditary', 'run in families', 'runs in families', 'passed down', 'brothers and sisters', 'siblings', 'brother', 'sister'],
    answer: `**Is FASD genetic?**

No. FASD is caused by alcohol exposure before birth. It is not passed down in genes like an inherited condition.

There are some links with genes and families, though:
• Researchers think genes may affect how strongly alcohol affects a developing baby. This is one reason the effects differ between pregnancies.
• Some genetic conditions can cause difficulties that look similar to FASD. This is why doctors look for other causes, and may suggest genetic tests, as part of an assessment.
• Brothers and sisters may also have been exposed to alcohol before birth. National FASD advises that if one child in a family has FASD, their brothers and sisters should be assessed or noted for follow-up.`,
    unc: 'Research on how genes affect the risk of FASD is still at an early stage.',
    src: 'SIGN 156 (2019) and National FASD', page: 'parents' },

  { id: 'cure-test', q: 'Is there a test for FASD, and can it be cured?', aud: ['parent', 'teacher'],
    tags: ['cure', 'cured', 'curable', 'grow out', 'go away', 'blood test', 'genetic test for fasd', 'scan for fasd', 'is there a test', 'brain scan', 'medication for fasd', 'treatment for fasd', 'treat fasd'],
    answer: `**Is there a test for FASD, and can it be cured?**

There is no single blood test or scan that shows FASD. Diagnosis needs an assessment by a team of professionals who look at the alcohol history, growth, facial features and how the brain is working in different areas. Tests such as genetic tests are sometimes done to look for other causes.

FASD is lifelong and there is no cure. There is also no medicine that treats FASD itself. Doctors may offer treatment for conditions that can happen alongside it, such as ADHD or sleep problems.

What helps most is understanding and support: adjustments at home and school, therapy for specific needs, and support for the family. Children with FASD keep learning and developing, and many do well with the right help.`,
    src: 'SIGN 156 (2019)', page: 'parents' },

  // ── EARLY SIGNS AND EVERYDAY DIFFICULTIES ───────────────────────────
  { id: 'early-signs', q: 'What are the signs of FASD in young children?', aud: ['parent'],
    tags: ['toddler', 'toddlers', 'baby', 'babies', 'preschool', 'nursery', 'early signs', 'signs of fasd', 'signs in', 'young child', 'under 5', 'under five', 'symptoms'],
    answer: `**Possible signs in babies and young children**

Signs of FASD in young children are often not specific, and many have other causes. Families and professionals sometimes notice:

• feeding or sleeping difficulties, and being very unsettled
• slow growth, or a small head size
• delays in talking, walking or other milestones
• being very active, easily overwhelmed or hard to settle
• difficulty following simple routines as they get older

None of these on its own means a child has FASD. If you are worried about your child's development, talk to your health visitor or GP, and tell them anything you know about alcohol in the pregnancy. Our Age-Based Support Pathways page has ideas for ages 0 to 5.`,
    src: 'FASD Compass Age-Based Support Pathways, drawing on SIGN 156 (2019)', page: 'age-pathways' },

  { id: 'forget', q: 'Why does my child forget instructions?', aud: ['parent'],
    tags: ['forget', 'forgets', 'forgetting', 'forgot', 'remember', 'memory', 'instructions', 'told them', 'told him', 'told her', 'loses things', 'losing things', 'lose things'],
    answer: `**Why might a child forget instructions?**

Many children with FASD, and children with other conditions such as ADHD or language difficulties, find it hard to hold several steps in their head. They may understand an instruction when they hear it and lose it a minute later. This is not laziness or defiance.

• **Give one step at a time,** and wait until it is done before giving the next.
• **Show as well as tell.** Use pictures, checklists or a demonstration.
• **Ask them to show you** what to do, rather than asking "Do you understand?"
• **Keep routines the same** so they rely less on memory.

Forgetting can have several causes. If it is affecting school or daily life, talk to the school SENCO or your GP. Our Everyday Challenges Library has more ideas.`,
    unc: PRACTICAL, src: 'FASD Compass Everyday Challenges Library', page: 'everyday-solutions' },

  { id: 'forget-class', q: 'How can I support a pupil who forgets instructions?', aud: ['teacher'],
    tags: ['forget', 'forgets', 'forgetting', 'memory', 'working memory', 'instructions', 'pupil', 'remember', 'retain', 'learned yesterday'],
    answer: `**Supporting a pupil who forgets instructions or learning**

Many pupils find it hard to hold several steps in mind or to keep hold of new learning. This is common in FASD and in many other conditions. It is not a sign of FASD on its own.

• **One instruction at a time,** in the order it should be done.
• **Show as well as tell.** Model the first step and leave a written or picture checklist on the desk.
• **Check understanding by asking the pupil to show you,** not by asking "Do you understand?"
• **Reteach and revisit often.** Expect learning to need repeating, and use the same words each time.
• **Reduce what needs remembering:** pre-printed notes instead of copying from the board, and a visual timetable in sight.

If there are concerns about hearing, vision or skills going backwards, talk to the SENCO or ALNCo and the family.`,
    unc: PRACTICAL, src: 'FASD Compass behaviour guide and School Support Toolkit', page: 'behaviour-guide' },

  { id: 'meltdowns', q: 'How can I help with meltdowns?', aud: ['parent', 'teacher'],
    tags: ['meltdown', 'meltdowns', 'outburst', 'tantrum', 'emotional', 'dysregulat', 'angry', 'anger', 'explode', 'rage', 'kicks off', 'calm down'],
    answer: `**Understanding and managing meltdowns**

A meltdown happens when a child is overwhelmed and can no longer manage their feelings. It is not deliberate. In children with FASD, the parts of the brain that help with regulation may work differently. Many other things can also lead to meltdowns, including tiredness, hunger, pain, worry, sensory overload and difficult experiences.

**Common triggers:** transitions, unexpected changes, noise or crowds, tiredness, and tasks that feel too hard.

**What helps:**
• Notice and reduce triggers where you can.
• Give warnings before changes, such as "Five more minutes, then bath time."
• Keep the environment calm and predictable.
• Have a calm space the child can go to.
• During a meltdown, keep them safe and say very little. Reasoning does not work at this point.
• Talk about what happened later, once everyone is calm.

Consequences alone rarely help with meltdowns. Planning ahead usually works better. If meltdowns are frequent or someone is getting hurt, talk to your GP or the school SENCO.`,
    unc: PRACTICAL, src: 'FASD Compass Regulation Toolkit, and SIGN 156 (2019) on affect regulation', page: 'regulation-toolkit' },

  { id: 'lying-stealing', q: 'Why might a child say things that are not true or take things?', aud: ['parent', 'teacher'],
    tags: ['lying', 'lies', 'lie', 'not true', 'making things up', 'confabulat', 'stealing', 'steals', 'stole', 'takes things', 'taking things', 'belong to others'],
    answer: `**Saying things that are not true, or taking things**

These behaviours are common in many children and have many possible causes. They are not a sign of FASD on their own.

**Saying things that are not true** can happen when a child:
• fills gaps in memory with what seems to make sense (sometimes called confabulation)
• gives the answer they think the adult wants
• is easily led by questions
• is trying to avoid getting into trouble

**Taking things** can happen when a child acts on impulse, does not fully understand ownership, is encouraged by others, or needs something such as food.

**What helps:**
• Focus on what needs to happen now, rather than proving what happened.
• Ask open questions, such as "Tell me what happened", not leading ones.
• Teach rules like "ask before you touch" directly, and practise them.
• Calmly return items without a long conversation.

If a child describes something that could mean they are being harmed, or may be being exploited by others, follow safeguarding procedures straight away.`,
    unc: PRACTICAL, src: 'FASD Compass behaviour guide', page: 'behaviour-guide' },

  { id: 'sleep', q: 'How can I help my child sleep better?', aud: ['parent'],
    tags: ['sleep', 'sleeping', 'bedtime', 'night waking', 'wakes up', 'wakes in the night', 'insomnia', 'melatonin', 'tired', 'settle at night'],
    answer: `**Helping with sleep**

Sleep problems are common in children with FASD. In one study, about half of children with FASD had sleep difficulties, compared with about one in five other children. Sleep problems are common in many children, so they are not a sign of FASD on their own.

**Things to try:**
• Keep the same calm bedtime routine every night, including weekends. A picture routine can help.
• Turn screens off well before bed, and keep the bedroom dark and quiet.
• Keep wake-up times regular.

**See your GP** if poor sleep goes on for more than a few weeks or affects daytime life. Mention it if your child snores loudly, gasps or seems to stop breathing in their sleep. A doctor can talk to you about whether any treatment might help.`,
    unc: 'The figure comes from one study. Estimates of sleep problems in FASD vary between studies.',
    src: 'FASD Compass Everyday Challenges Library and published research it cites', page: 'everyday-solutions' },

  { id: 'transitions', q: 'How can I help with transitions?', aud: ['teacher', 'parent'],
    tags: ['transition', 'transitions', 'change of routine', 'changes', 'moving class', 'new class', 'new school', 'secondary school', 'starting school', 'moving up', 'supply teacher'],
    answer: `**Helping with transitions**

Moving between activities, places or people is hard for many children. Children with FASD often find change especially difficult, because it puts extra load on memory, planning and regulation.

**Small, daily transitions:**
• Give a warning before a change, and use a visual timer.
• Use a visual timetable, and point to what comes next.
• Keep a short, familiar routine for moving between places.

**Bigger transitions, such as a new class or school:**
• Plan early and share a one-page pupil profile with the new staff.
• Arrange extra visits, photos of new rooms and staff, and a named adult.
• Tell the child about changes such as a supply teacher the day before, if you can.
• Review support plans at each move. SIGN 156 says reassessment is particularly important at transition stages.`,
    unc: PRACTICAL, src: 'FASD Compass School Support Toolkit, and SIGN 156 (2019) on transitions', page: 'school-support-toolkit' },

  { id: 'home-strategies', q: 'What strategies help at home?', aud: ['parent'],
    tags: ['strategies', 'strategy', 'at home', 'home strategies', 'tips', 'parenting', 'help my child', 'routine', 'routines', 'visual support'],
    answer: `**Strategies that help at home**

1. **Predictable routines.** Keep daily routines the same, with a visual timetable. Give warnings before changes.
2. **Visual supports.** Pair spoken instructions with pictures or written steps. A picture checklist for the morning can make a big difference.
3. **One instruction at a time.** Use short, concrete words. Ask your child to show you what to do.
4. **Calm first, talk later.** When your child is overwhelmed, help them calm down before you talk about what happened.
5. **Think "can't" before "won't".** Many difficulties come from how the brain is working, not from choosing to misbehave. Consequences alone rarely work.
6. **Build on strengths.** Notice what your child enjoys and does well.
7. **Look after yourself.** Caring for a child with complex needs is demanding. Support groups and National FASD can help.

Our Routine Builder can help you make picture routines.`,
    unc: PRACTICAL, src: 'FASD Compass Everyday Challenges Library and Routine Builder', page: 'everyday-solutions' },

  { id: 'safety', q: 'My child has no sense of danger. How can I keep them safe?', aud: ['parent', 'teacher'],
    tags: ['sense of danger', 'no fear', 'danger', 'dangerous', 'strangers', 'stranger danger', 'too trusting', 'trusting', 'friendly with', 'runs off', 'running off', 'wanders off', 'risks', 'online safety', 'keep safe', 'keeping safe', 'vulnerable'],
    answer: `**Keeping safe**

Some children run off, go with strangers, take risks or forget safety rules they seemed to know. Children with FASD may not see danger, may be very trusting of strangers, and may find it hard to learn safety rules. Many other children find this hard too. They often need more supervision than others their age.

**Things to try:**
• Teach safety rules in a simple, concrete way, and practise them often.
• Agree a short list of safe adults your child can go to for help.
• Use parental controls, and supervise time online.

**Get help straight away** if your child goes missing, is being exploited or is at risk from others, online or in person. Call 999 in an emergency. If you have a social worker, tell them.`,
    unc: PRACTICAL, src: 'FASD Compass Everyday Challenges Library', page: 'everyday-solutions' },

  { id: 'exclusion', q: 'My child is at risk of exclusion from school. What can I do?', aud: ['parent'],
    tags: ['exclusion', 'excluded', 'exclude', 'suspended', 'suspension', 'sent home', 'reduced timetable', 'part-time timetable', 'expelled'],
    answer: `**If your child is at risk of exclusion**

Exclusions and reduced timetables can be a sign that a child's needs are not yet understood or met. Behaviour is often a way of showing that something is hard.

• **Ask for a meeting** with the SENCO to review your child's support, and whether it is working.
• **Ask what is behind the behaviour,** and whether adjustments such as a named adult, a calm space and a regulation plan are in place.
• **Ask whether more assessment or advice would help,** for example from an educational psychologist.
• **Keep records** of exclusions, reduced timetables and incidents. They are useful for school planning and for any health assessment.
• **Get free, impartial advice** on your child's rights. In England, contact your local SENDIASS or IPSEA. In Scotland, contact Enquire. In Wales, contact SNAP Cymru.

Our Template Letters can help you put your concerns in writing.`,
    unc: 'The rules on exclusion are different in each nation and change over time. An advice service can tell you what applies to your child.',
    src: 'FASD Compass Template Letters and School Support Pathways', page: 'template-letters' },

  // ── SCHOOL ──────────────────────────────────────────────────────────
  { id: 'school-support', q: 'What support can I request from school?', aud: ['parent'],
    tags: ['support from school', 'ask the school', 'request from school', 'ask school', 'sen support', 'school support', 'ehcp', 'ehc plan', 'ehc needs', 'without a diagnosis', 'school help'],
    answer: `**What support can I ask the school for?**

Your child does not need a diagnosis to get support at school. Support should be based on their needs.

• **SEN support:** ask the SENCO whether your child should be recorded as needing SEN support, with a plan that is reviewed regularly.
• **Reasonable adjustments:** for example, instructions broken into steps, visual timetables, a named adult and a quiet space.
• **Advice from other professionals:** such as an educational psychologist or speech and language therapist.
• **An EHC needs assessment (England):** if SEN support is not enough, you can ask the local authority yourself. You do not need the school's agreement or a diagnosis.

Wales, Scotland and Northern Ireland have different systems. Our School Support Pathways page explains each one, and our Template Letters can help you put requests in writing.`,
    src: 'SEND Code of Practice (England) and IPSEA guidance, summarised in our While You Wait guide', page: 'while-you-wait' },

  { id: 'nations', q: 'How does school support work in Wales, Scotland or Northern Ireland?', aud: ['teacher', 'parent'],
    tags: ['wales', 'welsh', 'scotland', 'scottish', 'northern ireland', 'idp', 'individual development plan', 'aln', 'alnco', 'additional learning needs', 'additional support for learning', 'asl', 'csp', 'coordinated support plan', 'girfec', 'named person', 'statement of special educational needs', 'four nations', 'each nation', 'ehcp', 'ehc plan', 'ehc needs'],
    answer: `**School support across the UK**

In all four nations, support should be based on what a pupil needs. A diagnosis is not needed.

• **England:** SEN support led by the SENCO. If that is not enough, an EHC needs assessment can lead to an Education, Health and Care plan.
• **Wales:** talk to the ALNCo. A learner with additional learning needs (ALN) has an Individual Development Plan (IDP), reviewed at least every 12 months.
• **Scotland:** under the Additional Support for Learning Act, schools must identify and meet additional support needs. GIRFEC gives families a named person. A child's plan or a coordinated support plan (CSP) may be used for more complex needs.
• **Northern Ireland:** the SENCO plans support using a staged approach. If more is needed, the school or parents can ask the Education Authority for a statutory assessment, which may lead to a statement of special educational needs.

Free advice: SENDIASS (England), SNAP Cymru (Wales), Enquire (Scotland). Our School Support Pathways page has the details and links.`,
    unc: 'The Northern Ireland framework is changing. Check the Education Authority for the latest arrangements.',
    src: 'SEND Code of Practice (England), Welsh Government ALN guidance, Scottish ASL Code of Practice, NI Code of Practice', page: 'school-pathways' },

  { id: 'classroom', q: 'What classroom adjustments help pupils with FASD?', aud: ['teacher'],
    tags: ['classroom', 'adjustment', 'adjustments', 'reasonable adjustment', 'reasonable adjustments', 'in class', 'teaching strategies', 'teach', 'lessons', 'inclusion', 'school strategies', 'support plan'],
    answer: `**Classroom adjustments for pupils with FASD**

These help many pupils, with or without a diagnosis.

**Environment:** seat the pupil near you and away from distractions. Reduce visual clutter. Allow movement breaks and fidget tools. Provide a calm space they can use.

**Instructions:** give one instruction at a time and check understanding. Use concrete, literal language, and avoid sarcasm and idioms. Pair spoken words with visual cues. Allow extra processing time.

**Routines:** keep a visual timetable on the desk. Warn before transitions, and prepare the pupil for changes the day before.

**Workload:** break tasks into small steps. Accept spoken answers where possible. Allow extra time. Give pre-printed notes instead of copying from the board.

**Behaviour:** avoid punitive approaches for difficulties the pupil cannot control. Find triggers and agree a regulation plan with the family. Use calm spaces, not exclusion.

**Working with families:** keep in regular, brief, positive contact. Share what went well, not only what didn't.

Our Classroom Support Plan tool turns these into a plan you can print.`,
    unc: PRACTICAL, src: 'FASD Compass School Support Toolkit, drawing on SIGN 156 (2019)', page: 'classroom-support-plan' },

  { id: 'teacher-concern', q: 'What should I do if I am concerned about a pupil?', aud: ['teacher'],
    tags: ['teacher', 'concerned about a pupil', 'worried about a pupil', 'pupil', 'senco', 'educator', 'refer', 'my class', 'student'],
    answer: `**What should teachers do if they are concerned?**

**1. Talk to the parents or carers.** Share what you have noticed, and listen to what they see at home. Do not ask about, or guess at, alcohol in pregnancy from a pupil's behaviour, family or care history.

**2. Talk to the SENCO** (ALNCo in Wales). They can plan support, involve outside specialists, and advise on next steps such as an EHC needs assessment.

**3. Agree who will contact health services.** Schools do not diagnose FASD. If the family agrees, the GP, school nurse or health visitor can consider a referral. NICE QS204 says children with probable prenatal alcohol exposure and significant difficulties should be referred for assessment.

**4. Start support now.** Do not wait for a diagnosis. One instruction at a time, visual timetables, movement breaks and a calm space help many pupils.

**5. Share information when asked.** School reports and observations are valuable to the assessment team.

Performance that varies from day to day is common and is not deliberate. If you think a child is being harmed, follow your safeguarding procedures straight away.`,
    src: 'NICE QS204 (2022) Statement 3, and the FASD Compass School Support Pathways', page: 'school-pathways' },

  // ── ASSESSMENT AND DIAGNOSIS ────────────────────────────────────────
  { id: 'diagnosis-plain', q: 'How is FASD diagnosed?', aud: ['parent', 'teacher'],
    tags: ['diagnos', 'diagnosed', 'diagnosis', 'assessment', 'assessed', 'get a diagnosis', 'how is fasd'],
    answer: `**How is FASD diagnosed?**

FASD is diagnosed by a team of professionals, usually led by a paediatrician, after a full assessment. There is no single test.

The team will usually:
• ask about the pregnancy, including any alcohol, and about your child's health and development
• measure growth and head size, and look for three specific facial features
• assess how your child is doing in different areas, such as memory, attention, language, learning, movement, emotions and daily living skills
• look for other possible causes, including genetic factors

A diagnosis is made when there are significant difficulties in at least three areas of brain function, together with confirmed alcohol exposure in pregnancy, or all three facial features. Children who do not meet the criteria yet may be described as "at risk", so they can be followed up.

Assessments often take more than one appointment. Our GP evidence checklist helps you prepare.`,
    src: 'SIGN 156 (2019), section 3', page: 'gp-checklist' },

  { id: 'diagnosis', q: 'What are the diagnostic criteria for FASD?', aud: ['clinician'],
    tags: ['diagnos', 'diagnosed', 'diagnosis', 'how is fasd', 'criteria', 'diagnostic criteria', 'meets criteria', 'sign 156 criteria', 'with sentinel', 'without sentinel', 'severe impairment', 'standard deviations'],
    answer: `**SIGN 156 diagnostic criteria**

Diagnosis needs a multidisciplinary assessment.

**FASD with sentinel facial features:**
• all three sentinel facial features present
• prenatal alcohol exposure confirmed or unknown
• severe impairment in three or more of the ten neurodevelopmental areas, or microcephaly in infants and young children

**FASD without sentinel facial features:**
• confirmed prenatal alcohol exposure
• severe impairment in three or more of the ten neurodevelopmental areas

**Severe impairment** means a global score, or a major subdomain score, of two or more standard deviations below the mean on a standardised measure.

**At risk for neurodevelopmental disorder and FASD** is used when criteria are not yet met, for example in young children.

Other causes, including genetic factors, should be considered in all cases. The Clinical Quick Reference summarises the criteria on one page.`,
    src: 'SIGN 156 (2019), section 3', page: 'clinical-quick-reference' },

  { id: 'domains', q: 'What are the ten neurodevelopmental areas of assessment?', aud: ['clinician', 'teacher'],
    tags: ['domain', 'domains', 'areas of assessment', 'ten areas', '10 areas', 'neurodevelopmental areas', 'brain domains', 'brain areas'],
    answer: `**The ten SIGN 156 neurodevelopmental areas of assessment**

Severe impairment in three or more areas indicates pervasive brain dysfunction.

1. **Brain structure or neurophysiology** (for example microcephaly or structural brain differences)
2. **Motor skills** (fine and gross motor, coordination, graphomotor)
3. **Cognition** (IQ, processing, reasoning)
4. **Language** (receptive and expressive)
5. **Academic achievement** (reading, maths, writing)
6. **Memory** (verbal and visual)
7. **Attention** (sustained and selective attention, not impulse control)
8. **Executive function** (impulse control, hyperactivity, working memory, planning, flexibility)
9. **Affect regulation** (long-standing emotional dysregulation, anxiety, mood disorders)
10. **Adaptive behaviour, social skills and social communication**

Affect regulation difficulties must be long-standing and not solely explained by adverse life events, such as multiple placements.`,
    src: 'SIGN 156 (2019), section 3.4', page: 'clinicians' },

  { id: 'face-plain', q: 'Can FASD occur without facial features?', aud: ['parent', 'teacher'],
    tags: ['without facial', 'no facial', 'without the face', 'looks normal', 'doesn\'t look', 'does not look', 'facial features', 'face', 'facial'],
    answer: `**Can FASD occur without facial features?**

Yes. Most people with FASD do not have the facial features linked to alcohol exposure. UK government figures say the features are absent in more than 90% of people with FASD.

Not having the facial features does not mean the condition is milder. A child can have significant difficulties with learning, memory, attention or behaviour without any visible signs. This is one reason FASD is often missed.

For a diagnosis without the facial features, the assessment team needs confirmed information that there was alcohol in the pregnancy, as well as significant difficulties in at least three areas of brain function.`,
    src: 'SIGN 156 (2019), and the UK Government FASD health needs assessment', page: 'parents' },

  { id: 'facial', q: 'What are the sentinel facial features?', aud: ['clinician'],
    tags: ['sentinel', 'facial features', 'philtrum', 'vermilion', 'vermillion', 'palpebral', 'fissure', 'lip-philtrum', 'lip philtrum', 'facial'],
    answer: `**The sentinel facial features of FASD**

When all three are present together, they are specific enough to prenatal alcohol exposure that confirmation of exposure is not needed for diagnosis.

• **Smooth philtrum:** rank 4 or 5 on the University of Washington Lip-Philtrum Guide
• **Thin upper lip vermilion:** rank 4 or 5 on the Lip-Philtrum Guide
• **Short palpebral fissures:** two or more standard deviations below the mean

The features are absent in more than 90% of people with FASD. Their absence does not mean the condition is milder.

Associated features, such as midface hypoplasia or epicanthal folds, should be recorded but do not contribute to confirming or ruling out FASD. Young children with all three features but no microcephaly should be referred to a clinical geneticist (section 3.5).`,
    src: 'SIGN 156 (2019), sections 3.3 and 3.5', page: 'clinical-quick-reference' },

  { id: 'pae-confirm', q: 'How is prenatal alcohol exposure confirmed?', aud: ['clinician'],
    tags: ['confirm exposure', 'confirmed exposure', 'confirming exposure', 'confirmation of', 'pae', 'prenatal alcohol exposure', 'reliable source', 'exposure history', 'alcohol history'],
    answer: `**Confirming prenatal alcohol exposure**

SIGN 156 says confirmation needs documentation that the birth mother drank alcohol during the pregnancy, based on:
• reliable clinical observation
• self-report, or report by a reliable source
• medical records documenting positive blood alcohol concentrations
• alcohol treatment, or other social, legal or medical problems related to drinking during the pregnancy

Unsubstantiated information, lifestyle, other drug use, or alcohol use in a previous pregnancy cannot, on their own, confirm exposure in the index pregnancy. Do not infer exposure from care history or social circumstances.

When all three sentinel facial features are present, confirmation is not needed.

For screening in pregnancy, SIGN 156 recommends a validated tool such as T-ACE, TWEAK or AUDIT-C (recommendations 2.3 and 2.4).`,
    src: 'SIGN 156 (2019), section 2.1', page: 'clinical-assessment-checklist' },

  { id: 'unknown-exposure', q: 'Can my child be assessed if we do not know about alcohol in the pregnancy?', aud: ['parent', 'teacher', 'clinician'],
    tags: ['don\'t know if', 'do not know if', 'unknown exposure', 'exposure is unknown', 'no records', 'no information about the pregnancy', 'not sure if she drank', 'not sure if the birth mother', 'don\'t know whether', 'birth mother drank', 'birth history', 'unknown history', 'don\'t know about alcohol', 'do not know about alcohol'],
    answer: `**When alcohol exposure in pregnancy is unknown**

Many families, including adoptive, foster and kinship families, do not know whether a child was exposed to alcohol before birth. Unknown does not mean there was exposure, and it does not mean there was none.

• **Your child can still be assessed** for their developmental needs, and support should be based on those needs.
• **For an FASD diagnosis,** SIGN 156 usually needs confirmed alcohol exposure. The exception is when all three sentinel facial features are present.
• **Ask for records.** A social worker or adoption agency may hold birth, medical or court records that mention alcohol.
• **Tell the GP or paediatrician what you know and what you don't know.** Don't guess.

Our guide for adoptive, foster and kinship families explains which records to ask for.`,
    src: 'SIGN 156 (2019), sections 2.1 and 3', page: 'adoptive-foster-kinship' },

  { id: 'differentials', q: 'What should the differential diagnosis include?', aud: ['clinician'],
    tags: ['differential', 'differentials', 'other causes', 'rule out other', 'genetic', 'genetics', 'syndrome', 'mimic', 'look alike', 'what else could', 'differential diagnos', 'what tests', 'tests should', 'investigations', 'work-up', 'workup', 'blood tests'],
    answer: `**Differential diagnosis**

FASD shares features with many other conditions, so the assessment should look for other explanations and for co-occurring conditions.

• **Genetic factors** should be considered in all cases. Use genetic testing in line with local genetics guidance.
• **Other exposures in pregnancy** that can affect development, such as some anticonvulsant medicines.
• **Other neurodevelopmental conditions,** such as ADHD, autism, developmental language disorder and intellectual disability. These can co-occur with FASD.
• **Early adversity and trauma.** Difficulties may come from early experiences, FASD, or both.
• **Hearing and vision** should be checked.

Microcephaly is an OFC below the 3rd centile. Record associated facial features, but they do not confirm or rule out FASD.

Our Clinical Assessment Checklist includes a differential diagnosis section.`,
    src: 'SIGN 156 (2019), section 3', page: 'clinical-assessment-checklist' },

  { id: 'at-risk', q: 'What does "at risk" for FASD mean?', aud: ['clinician', 'parent'],
    tags: ['at risk', 'at-risk', 'too young', 'too young to diagnose', 'incomplete', 'not yet meet', 'young baby', 'infant'],
    answer: `**"At risk for neurodevelopmental disorder and FASD"**

This is not a diagnosis. It is a formal designation so a child is monitored and supported while they are too young, or the information is not yet complete, for a full diagnosis.

SIGN 156 uses it when a child:
• has confirmed prenatal alcohol exposure, or all three sentinel facial features
• does not yet meet the criteria for FASD, for example because they are too young for a full assessment
• shows some sign of neurodevelopmental concern

It should not be used when exposure is confirmed to be absent. It should be recorded so all professionals involved can see it, and the child should be reassessed when older.

Support should be based on need and should not wait for a diagnosis.`,
    src: 'SIGN 156 (2019), section 3', page: 'clinical-quick-reference' },

  { id: 'snomed', q: 'Which SNOMED CT codes should I use for FASD?', aud: ['clinician'],
    tags: ['snomed', 'code', 'codes', 'coding', 'read code', 'record the diagnosis', 'clinical code'],
    answer: `**SNOMED CT codes for FASD**

NHS England introduced these codes in April 2024:
• **FASD with sentinel facial features:** 1894471000000108
• **FASD without sentinel facial features:** 1894461000000101
• **At risk for neurodevelopmental disorder and FASD:** 2078801000000102

Record the history of prenatal alcohol exposure in the child's notes too, and share it when referring. Check your local system for how these codes appear in your clinical software.`,
    src: 'NHS England SNOMED CT release (April 2024), summarised in our guide for GPs', page: 'for-your-gp' },

  { id: 'adults', q: 'Can adults be diagnosed with FASD?', aud: ['clinician', 'parent'],
    tags: ['adult', 'adults', 'grown up', 'as an adult', 'adults get', 'adult diagnosis', 'could i have', 'do i have', 'i have fasd', 'myself', 'over 18'],
    answer: `**FASD in adults**

FASD is lifelong, and adults can be diagnosed. SIGN 156 says the diagnostic criteria are the same for adults as for younger people.

Assessment in adults can be harder, because information about the pregnancy may be difficult to get, and facial features can change with age. Some adults find that a diagnosis helps them make sense of their experiences and get the right support.

An adult who thinks they may have FASD can talk to their GP. Many areas do not have an adult FASD service. Our page on routes when there is no local service explains the options, including the National FASD Clinic.`,
    src: 'SIGN 156 (2019), recommendation 8.1', page: 'no-local-fasd-service' },

  { id: 'cooccurring', q: 'Can a child have FASD and ADHD at the same time?', aud: ['parent', 'teacher', 'clinician'],
    tags: ['adhd', 'autism', 'autistic', 'asd', 'comorbid', 'co-occurring', 'coexist', 'anxiety', 'depression', 'mental health', 'both', 'at the same time', 'as well as'],
    answer: `**FASD and other conditions**

Yes. A child can have FASD and other conditions at the same time. A large review found more than 400 conditions that can occur alongside FASD.

Conditions that are often seen alongside FASD include:
• **ADHD:** often the first diagnosis given. Response to medication may be different from what is expected.
• **Autism** or autistic features
• **Anxiety and low mood,** particularly in teenagers and adults
• **Sleep difficulties**
• **Language and learning difficulties**

A child's difficulties should not all be put down to one condition. Early experiences, trauma, and other health needs can also play a part, and each needs its own assessment and support.

If a child with ADHD is not responding to treatment as expected, or their difficulties are wider than ADHD alone, it may be worth asking whether FASD has been considered.`,
    unc: 'The figure of more than 400 conditions comes from one large review of studies. The studies varied, and many were in clinical groups, so it does not tell you how likely any one condition is.',
    src: 'Popova and colleagues, The Lancet (2016), and SIGN 156 (2019)', page: 'clinicians' },

  // ── GETTING HELP ────────────────────────────────────────────────────
  { id: 'gp', q: 'What should I discuss with my GP?', aud: ['parent'],
    tags: ['gp', 'my gp', 'doctor', 'health visitor', 'discuss', 'referral', 'refer', 'tell the gp', 'appointment', 'worried', 'concerned', 'suspect'],
    answer: `**Talking to your GP**

**1. Book an appointment and explain your concerns.** Bring notes or examples of the difficulties you see, and anything the school has said.

**2. Share what you know about alcohol in the pregnancy.** Say what you don't know, too. NICE QS204 says children with probable alcohol exposure and significant difficulties should be referred for assessment.

**3. Ask for a referral,** usually to community paediatrics, a child development centre or CAMHS. Ask for FASD to be considered as part of the assessment.

**4. Ask for support now.** Support at school should not wait for a diagnosis.

**5. Get support for yourself.** National FASD offers information and peer support at nationalfasd.org.uk.

Our evidence checklist helps you prepare, and our guide for GPs explains the referral criteria. You can print it and take it with you.`,
    src: 'NICE QS204 (2022) Statement 3', page: 'gp-checklist' },

  { id: 'gp-referral', q: 'When should a GP refer for FASD assessment?', aud: ['clinician'],
    tags: ['when to refer', 'referral criteria', 'gp referral', 'refer for assessment', 'where to refer', 'referral pathway', 'qs3', 'statement 3'],
    answer: `**Referral for FASD assessment**

NICE QS204 Statement 3: children and young people with probable prenatal alcohol exposure and significant physical, developmental or behavioural difficulties are referred for assessment.

**Probable exposure** can come from reliable clinical observation, self-report or report by a reliable source, medical records of positive blood alcohol, or treatment for alcohol-related problems. It is not needed when all three sentinel facial features are present.

**Significant difficulties** are those that disrupt the child's or family's ability to manage daily life.

**Where to refer:** community paediatrics, a child development centre or CAMHS, for assessment by a professional with additional training in FASD. State the alcohol history in the letter and ask for FASD to be considered. If there is no local pathway, the National FASD Clinic accepts referrals from across the UK, usually with ICB funding agreed first.`,
    src: 'NICE QS204 (2022) Statement 3, and SIGN 156 (2019)', page: 'for-your-gp' },

  { id: 'waiting', q: 'What can we do while we wait for an assessment?', aud: ['parent'],
    tags: ['waiting list', 'waiting', 'wait', 'long wait', 'while we wait', 'no service', 'no local', 'no fasd service', 'not available', 'years'],
    answer: `**While you wait for an assessment**

Waiting lists can be long. Your child does not need a diagnosis to get support.

• **At school:** ask the SENCO about SEN support. In England, you can ask the local authority for an EHC needs assessment yourself.
• **Money and practical help:** you can apply for Disability Living Allowance based on your child's needs, and ask your council for a parent carer needs assessment.
• **At home:** FASD-informed strategies help many children, with or without a diagnosis.
• **Free advice:** SENDIASS (England), SNAP Cymru (Wales) or Enquire (Scotland).
• **Keep notes** of what you see, and keep reports in one place.

If there is no FASD service in your area, our page on routes to an assessment explains options such as an Individual Funding Request and the National FASD Clinic.`,
    src: 'IPSEA, gov.uk and NICE QS204 (2022), summarised in our While You Wait guide', page: 'while-you-wait' },

  { id: 'benefits', q: 'Can we get DLA or other benefits?', aud: ['parent'],
    tags: ['dla', 'disability living allowance', 'benefit', 'benefits', 'pip', 'personal independence payment', 'carer\'s allowance', 'carers allowance', 'money', 'financial', 'blue badge'],
    answer: `**Benefits and financial help**

Disability Living Allowance (DLA) for children is for children under 16 who need much more looking after than other children of the same age, or who have difficulty getting about. The needs must have lasted at least 3 months and be expected to last at least 6 months. It is based on your child's needs, not a diagnosis.

Young people aged 16 and over apply for Personal Independence Payment (PIP) instead.

You can also ask your council for a parent carer needs assessment, which may lead to support such as short breaks.

I can't tell you whether your family will qualify. Check gov.uk, or ask a welfare rights adviser or Citizens Advice for help with the forms.`,
    unc: 'Benefit rules change, and they are different in Scotland, where Child Disability Payment has replaced DLA. Check the current rules for where you live.',
    src: 'gov.uk, summarised in our While You Wait guide', page: 'while-you-wait' },

  { id: 'after-diagnosis', q: 'What happens after an FASD diagnosis?', aud: ['parent', 'clinician'],
    tags: ['after diagnosis', 'after the diagnosis', 'management plan', 'just been diagnosed', 'diagnosed with fasd', 'what next', 'what happens next', 'post diagnosis'],
    answer: `**What happens after an FASD diagnosis?**

NICE QS204 Statement 5 says children with a diagnosis of FASD should have a **management plan** to address their needs. SIGN 156 describes what it can cover:

• therapy needs, such as speech and language therapy, occupational therapy, psychology or CAMHS
• school adjustments and links with SEN support or an EHC plan
• information and support for the family
• signposting to local and national organisations
• a review schedule, with reassessment at transition stages such as starting secondary school and moving to adult services

**You can ask the paediatrician to:**
• share the plan with school and other professionals involved
• tell you when it will be reviewed
• link your family to FASD support organisations

National FASD (nationalfasd.org.uk) has resources for families after diagnosis. Our Support Plan tool can help you write things down.`,
    src: 'NICE QS204 (2022) Statement 5, and SIGN 156 (2019), section 4', page: 'support-plan' },

  { id: 'nice', q: 'What are the NICE QS204 quality statements?', aud: ['clinician', 'teacher'],
    tags: ['nice', 'qs204', 'quality standard', 'quality statement', 'quality statements'],
    answer: `**NICE QS204: the five quality statements**

NICE Quality Standard QS204 (March 2022) applies in England. Wales, Scotland and Northern Ireland have their own arrangements.

**Statement 1:** pregnant women are advised throughout pregnancy not to drink alcohol.
**Statement 2:** alcohol use is asked about and recorded throughout pregnancy.
**Statement 3:** children with probable prenatal alcohol exposure and significant physical, developmental or behavioural difficulties are **referred for assessment**.
**Statement 4:** children with confirmed exposure or all three sentinel facial features have a **neurodevelopmental assessment** if there are clinical concerns.
**Statement 5:** children with a diagnosis of FASD have a **management plan** to address their needs.

Support should be based on need and should not wait for a diagnosis.`,
    src: 'NICE QS204 (2022)', page: 'clinicians' },

  // ── FAMILIES ────────────────────────────────────────────────────────
  { id: 'care', q: 'We are adopting or fostering. What should we know about FASD?', aud: ['parent'],
    tags: ['foster', 'fostering', 'adopt', 'adopted', 'adoption', 'adoptive', 'kinship', 'looked after', 'special guardian', 'in care', 'social worker'],
    answer: `**FASD and adoptive, foster or kinship families**

Many children who have been in care were exposed to alcohol before birth, and FASD is often undiagnosed. But being in care does not mean a child was exposed. Exposure can only be confirmed from reliable information about the pregnancy.

**What you can do:**
• **Ask for records,** such as the Child Permanence Report, adoption medicals and social work reports. They may mention alcohol in the pregnancy.
• **Share what you know, and what you don't know,** with the GP or paediatrician.
• **Ask for an assessment that looks at all possible causes.** Early trauma, attachment difficulties and FASD can look similar, and a child can have more than one.
• **Ask about support funding.** In England, the Adoption and Special Guardianship Support Fund may pay for some therapy and assessments.

Carers often hold key information for an assessment. National FASD (nationalfasd.org.uk) has resources for carers.`,
    src: 'SIGN 156 (2019) and National FASD, summarised in our guide for adoptive, foster and kinship families', page: 'adoptive-foster-kinship' },

  { id: 'guilt', q: 'I drank before I knew I was pregnant. Is it my fault?', aud: ['parent'],
    tags: ['guilt', 'guilty', 'my fault', 'blame', 'blamed', 'ashamed', 'shame', 'before i knew', 'didn\'t know i was pregnant', 'did not know i was pregnant', 'i drank', 'judged'],
    answer: `**Feelings of guilt and blame**

Many birth mothers feel guilt or worry about drinking in pregnancy, especially before they knew they were pregnant. These feelings are very common, and you deserve support, not blame.

• Many pregnancies are not planned, and many women drink before they know they are pregnant.
• Alcohol affects each pregnancy differently. Drinking does not always lead to FASD, and the amount and timing matter.
• Being open about alcohol in pregnancy is one of the most helpful things you can do for your child. It helps professionals understand their needs and get the right support.

If you are worried about your child, talk to your GP or health visitor. If you are pregnant now, it is never too late to stop drinking, and your midwife can help.

National FASD (nationalfasd.org.uk) offers non-judgemental support. If guilt is affecting your mood, please talk to your GP.`,
    src: 'UK Chief Medical Officers\' Low Risk Drinking Guidelines (2016) and National FASD', page: 'parents' },

  { id: 'explain-child', q: 'How do I explain FASD to my child?', aud: ['parent'],
    tags: ['explain to my child', 'explain fasd to', 'tell my child', 'telling my child', 'talk to my child', 'talk to my son', 'talk to my daughter', 'tell him', 'tell her', 'does my child need to know', 'for children'],
    answer: `**Explaining FASD to your child**

There is no single right time. Many families find it helps to talk about it early, in simple words, and to come back to it as the child grows.

• **Keep it simple and positive.** For example: "Before you were born, alcohol made it harder for some parts of your brain to grow in the usual way. That is why some things are harder for you. It isn't your fault."
• **Talk about strengths,** not only difficulties.
• **Use their questions as a guide.** Answer what they ask, and keep the door open.
• **Plan what to say about the birth family** in a way that is honest and kind.

Our For Children page is written for children to read with a trusted adult. National FASD has easy-read guides such as "My Brain, Me and FASD", and FASD.me is a site made for young people.`,
    unc: PRACTICAL, src: 'FASD Compass For Children page and National FASD resources', page: 'for-children' },

  { id: 'carer-wellbeing', q: 'I am exhausted. Where can I get support as a parent or carer?', aud: ['parent'],
    tags: ['exhausted', 'exhaustion', 'burnt out', 'burned out', 'burnout', 'tired all the time', 'overwhelmed', 'stressed', 'struggling to cope', 'breaking point', 'support as a carer', 'carer support', 'support for carers', 'support for me', 'support for parents', 'support group', 'respite', 'short breaks', 'isolated', 'alone'],
    answer: `**Support for you**

Caring for a child with complex needs can be exhausting, and it is not a sign that you are doing anything wrong. You need support too.

• **Talk to people who understand.** National FASD (nationalfasd.org.uk) offers support and can tell you about local groups.
• **Ask for a parent carer needs assessment** from your council. It looks at your wellbeing and can lead to support such as short breaks.
• **Talk to your GP** about how you are feeling, especially if you are low, anxious or not sleeping.
• **Share the load.** Ask school and other professionals to help with plans, and ask family or friends for specific help.
• **Pick one or two small changes** at a time. You don't have to do everything at once.

If you ever feel you can't keep yourself or your child safe, call 999, or call Samaritans free on 116 123, any time.`,
    src: 'FASD Compass While You Wait guide and National FASD', page: 'while-you-wait' },

  // ── PREGNANCY ───────────────────────────────────────────────────────
  { id: 'prevention', q: 'Is any amount of alcohol safe in pregnancy?', aud: ['parent', 'teacher', 'clinician'],
    tags: ['prevent', 'prevention', 'safe amount', 'safe to drink', 'safe level', 'no safe', 'drink in pregnancy', 'drinking in pregnancy', 'alcohol in pregnancy', 'while pregnant', 'glass of wine', 'trimester', 'pregnant', 'how much alcohol', 'amount of alcohol', 'how much drinking'],
    answer: `**Alcohol in pregnancy**

The UK Chief Medical Officers advise: "If you are pregnant or think you could become pregnant, the safest approach is not to drink alcohol at all, to keep risks to your baby to a minimum."

There is no known safe amount, safe type or safe time to drink alcohol in pregnancy.

If you drank before you knew you were pregnant:
• stop drinking now
• in most cases, the risk to the baby from small amounts is likely to be low
• talk to your GP or midwife if you are worried

**For clinicians:** SIGN 156 recommends asking all pregnant women about alcohol using a validated tool such as T-ACE, TWEAK or AUDIT-C, and offering brief interventions where needed.`,
    src: 'UK Chief Medical Officers\' Low Risk Drinking Guidelines (2016) and SIGN 156 (2019)', page: 'parents' },

  // ── THIS SITE ───────────────────────────────────────────────────────
  { id: 'questionnaire-use', q: 'How do I use the concerns guide?', aud: ['parent', 'teacher'],
    tags: ['concerns guide', 'how do i use the questionnaire', 'use the questionnaire', 'questionnaire', 'screening tool', 'checklist', 'quiz'],
    answer: `**Using the FASD Compass concerns guide**

The concerns guide is a checklist to help you think about different areas of development and write down what you see.

• It takes about 10 minutes. You can skip any question.
• You can add short examples for each area.
• At the end you get a summary to take to your GP, health visitor or school. You can print it or save it as a PDF.
• It does not ask for your child's name, and your answers stay on your device.

It cannot confirm or rule out FASD, and it does not give a score. Only a full assessment can diagnose FASD.`,
    src: 'FASD Compass concerns guide', page: 'screening-tool' },
];

// Example questions shown as buttons for each audience. Each one must match its own answer.
const SUGGESTIONS = {
  parent: ['Why does my child forget instructions?', 'How can I help with meltdowns?', 'What support can I request from school?', 'How is FASD diagnosed?', 'Can FASD occur without facial features?', 'What should I discuss with my GP?'],
  teacher: ['What classroom adjustments help pupils with FASD?', 'How can I support a pupil who forgets instructions?', 'What should I do if I am concerned about a pupil?', 'How does school support work in Wales, Scotland or Northern Ireland?', 'How can I help with transitions?', 'Why might a child say things that are not true or take things?'],
  clinician: ['What are the diagnostic criteria for FASD?', 'What are the sentinel facial features?', 'What should the differential diagnosis include?', 'How is prenatal alcohol exposure confirmed?', 'Which SNOMED CT codes should I use for FASD?', 'What does "at risk" for FASD mean?']
};

root.FASD_KB = KB;
root.FASD_SUGGESTIONS = SUGGESTIONS;
if (typeof module !== 'undefined' && module.exports) module.exports = { KB, SUGGESTIONS };
})(typeof self !== 'undefined' ? self : globalThis);

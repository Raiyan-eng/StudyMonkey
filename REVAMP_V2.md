# StudyMonkey Game-Style Revamp

## Goal

Turn StudyMonkey into an interactive IGCSE learning world where students learn by exploring, manipulating models, answering questions, and earning visible progress.

## Experience pillars

1. **Visual first** — every difficult idea gets an infographic, animation, interactive diagram, or 3D model.
2. **Learn by doing** — students drag, rotate, label, sort, calculate, predict, and test instead of only reading.
3. **Game progression** — units become missions with XP, streaks, mastery levels, achievements, and subject maps.
4. **AI coaching** — the tutor knows the selected subject and unit, adapts explanations, and suggests the next activity.
5. **Calm excitement** — vibrant black-and-blue visuals without distracting students from the lesson.

## Core interface

- **Mission dashboard:** daily goal, current mission, XP, streak, weak topics, and resume button.
- **Subject worlds:** each subject has a visual map containing every syllabus unit.
- **Lesson scene:** short explanation, animated infographic, interactive activity, recap, and checkpoint.
- **Tutor dock:** text and audio questions without leaving the activity.
- **Mastery screen:** skill tree showing not started, learning, secure, and exam-ready topics.

## Interactive ideas by subject

- **Biology:** rotating cell, enzyme collision simulator, inheritance crosses, food-web builder.
- **Chemistry:** atom builder, bonding visualizer, reaction particle animation, titration simulation.
- **Physics:** force-vector playground, circuit builder, ray diagrams, wave controls.
- **Mathematics:** animated graphs, geometry construction, transformations, equation balance game.
- **Additional Maths:** function machine, differentiation slope visualizer, vector explorer.
- **Computer Science:** binary machine, logic-gate circuits, algorithm race, memory visualizer.
- **Accounting:** double-entry drag-and-drop, ledger balancing, statement builder.
- **Economics:** supply-and-demand simulator, policy choices, market consequence timelines.
- **Business Studies:** decision scenarios, stakeholder maps, break-even simulator.
- **English:** annotation layers, evidence matching, structure maps, timed writing coach.

## Technology direction

- Keep the current browser app and Firebase accounts.
- Use **Three.js** for interactive 3D learning scenes.
- Use lightweight SVG and CSS animation for diagrams and infographics.
- Use Higgsfield for selected cinematic assets or short visual explainers after connection.
- Load 3D scenes only when opened so slower devices remain usable.
- Respect reduced-motion settings and provide a 2D fallback for every essential lesson.

## Build order

1. Redesign navigation and mission dashboard.
2. Build reusable infographic and activity components.
3. Create one polished Biology mission as the quality standard.
4. Add XP, mastery, streaks, and achievements.
5. Connect the real AI tutor and audio controls.
6. Expand the reusable system across all subjects.
7. Test mobile performance, accessibility, and learning clarity.

## First vertical slice

Start with Biology: Cells. The mission should include a cinematic opening, rotatable cell, clickable organelles, label challenge, three-question checkpoint, AI tutor prompts, XP reward, and a mastery update. Once this feels excellent, reuse the same structure for other units.


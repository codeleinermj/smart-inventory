# Skill Registry — sistema_de_gestion

**Generated**: 2026-04-07
**Project**: sistema_de_gestion (Smart Inventory)
**Scope**: user-level (no project-level skills present)

## User Skills (global at `~/.claude/skills/`)

| Skill | Purpose | Triggers |
|-------|---------|----------|
| branch-pr | PR creation workflow (Agent Teams Lite, issue-first) | PR creation, opening a PR, preparing changes for review |
| issue-creation | GitHub issue workflow (issue-first enforcement) | Creating issues, reporting bugs, requesting features |
| judgment-day | Parallel adversarial blind review protocol | Deep code review needed, second opinion, adversarial validation |
| skill-creator | Create new Agent Skills | New skill creation, documenting AI patterns |
| go-testing | Go testing patterns incl. Bubbletea TUI | Writing Go tests (NOT applicable — stack is Node + Python) |

## Project Conventions

No `CLAUDE.md`, `AGENTS.md`, `agents.md`, `.cursorrules`, `GEMINI.md`, or `copilot-instructions.md` found at project root.

**User-level CLAUDE.md** at `~/.claude/CLAUDE.md` applies globally: Agent Teams Lite orchestrator protocol + engram persistent memory protocol.

## Compact Rules (auto-inject into sub-agents)

### engram-memory (ALWAYS ACTIVE)
- Save decisions, bugs, conventions proactively via `mem_save`
- Use `topic_key` for evolving topics (upsert)
- Format: **What**, **Why**, **Where**, **Learned**
- Call `mem_session_summary` before closing any session

### Agent Teams Lite Orchestration
- Orchestrator is a COORDINATOR, not an executor
- Delegate exploration/multi-file reads/writes with analysis to sub-agents
- Inline: single-file reads, atomic edits, git state commands

## Applicable to Stack (Node + Python)

None of the user skills target Node.js or Python specifically. Consider adding:
- `node-testing` (vitest patterns, mock strategies)
- `python-fastapi` (FastAPI patterns, Pydantic)
- `ml-prophet` (time-series forecasting patterns)

Until those exist, fall back on general SDD phases + engram memory for capturing stack-specific patterns discovered during implementation.

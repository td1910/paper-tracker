---
name: design-first-workflow
description: Enforces a design-first development cycle. Use this for every new feature, architectural change, or significant modification. It mandates that a design document be created, reviewed, and approved by the user before any implementation begins.
---

# Design First Workflow

## Overview
This skill ensures all code changes are grounded in a reviewed and approved design. It prevents "cowboy coding" by requiring a documentation-first approach for every non-trivial task.

## The Mandatory Workflow

For every new feature or change request:

### 1. Document the Design
Before writing any implementation code, you MUST create a design document in the `docs/` directory. Use the template provided in `references/design-doc-template.md`.

- **Location**: `docs/<feature-name>-design.md`
- **Content**: Architecture, UI/UX changes, Database modifications, and potential risks.

### 2. Present and Discuss
Share the link to the design doc with the user and provide a concise summary.
Ask the user:
- "Does this architectural approach align with your vision?"
- "Do you have any questions about the proposed implementation?"
- "Is there anything you would like to change before I start coding?"

### 3. Review and Iterate
Answer any questions the user has. If the user requests changes, update the design doc and repeat the presentation.

### 4. Obtain Final Approval
Explicitly ask for approval to proceed. **DO NOT** use any implementation tools (`replace`, `write_file`, `run_shell_command` for code) until the user gives a clear "Go" or "Approved".

## Resources
- **references/design-doc-template.md**: The mandatory template for all design documents.

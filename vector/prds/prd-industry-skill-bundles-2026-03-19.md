# PRD: Industry Skill Bundles

**Author:** Zero Vector
**Date:** 2026-03-19
**Status:** Draft
**Version:** 1.0

---

## Problem

Investiture's target audience is broader than solo indie developers. Consulting firms need client-facing artifact chains. Enterprises in regulated industries need compliance and traceability before a single line of code is written. Healthcare organizations need HIPAA constraints pre-loaded into their doctrine. Fintech teams need SOC2 and PCI references wired into their quality gates. Agencies managing multiple client projects need repeatable scaffolds with industry-appropriate defaults. Today, every one of these adopters faces the same blank-slate onboarding: a generic VECTOR.md template, no industry context, and no pre-populated compliance or risk frameworks. They must manually research and encode their industry's constraints, regulatory requirements, and risk categories into doctrine files -- exactly the kind of implicit knowledge work that VECTOR.md's problem statement says "never gets documented."

The Getting Started Path PRD (prd-getting-started-path-2026-03-19) defines `invest-start` as the guided onboarding experience, and it already references skill bundles (solo, consulting, enterprise, team, open-source) as sequenced skill paths. But those bundles are currently just skill sequences hardcoded inside the `invest-start` skill. They carry no industry-specific doctrine, no pre-filled templates, no compliance seeds. An enterprise healthcare team that selects the "enterprise" bundle gets the same blank VECTOR.md as a solo game developer. The bundle concept needs its own system -- structured, extensible, and separable from the onboarding skill that consumes it.

If we do nothing, Investiture remains a tool that only feels native to small, unregulated software teams. Enterprises and regulated industries will either pass on adoption or spend their first several sessions manually encoding constraints that could have shipped with the tool. This directly undermines Design Principle 3 ("capture over ceremony -- the methodology should cost less time than the knowledge it produces") -- if setting up industry context takes longer than the first week of knowledge capture, the methodology has failed before it started.

This problem rests on an unvalidated assumption: that pre-populated industry doctrine meaningfully accelerates adoption for regulated and enterprise teams. No user research has been conducted with these audiences (all persona, JTBD, interview, and assumption research artifacts remain at "Not started" per VECTOR.md's Knowledge Map). Recommend validating through structured interviews with 3-5 practitioners in healthcare, fintech, and government technology before full investment in industry-specific content.

## Audience

Formal persona research has not been completed. The audience descriptions below are derived from VECTOR.md's Target Audience section and expanded to reflect the breadth of adopters this feature serves. This lack of validated personas is a risk -- industry-specific assumptions may not match real practitioner needs.

| Persona | Relevant Job | Current Pain |
|---------|-------------|-------------|
| Enterprise engineering lead (regulated industry) | Stand up a doctrine-first development practice that satisfies compliance requirements from day one | Must manually research and encode regulatory constraints (HIPAA, SOC2, PCI-DSS, FedRAMP) into VECTOR.md and quality gates. This takes days, requires domain expertise, and produces inconsistent results across teams. |
| Healthcare software team | Build patient-facing or clinical software with HIPAA constraints wired into every architectural and design decision | Generic methodology tools ignore healthcare entirely. Team must bolt on compliance after the fact rather than building with constraints pre-loaded. Audit preparation is painful because constraints were not documented at the doctrine level. |
| Fintech development team | Ship financial software with SOC2, PCI-DSS, and financial regulation references embedded in quality gates and risk frameworks | Compliance requirements are known but live in separate documents disconnected from the development methodology. Investiture could unify them -- but only if the starting templates reflect fintech reality. |
| Government technology contractor | Deliver software under government procurement and security standards (FedRAMP, FISMA, Section 508) | Government work has extensive documentation requirements. A doctrine-first approach is natural for govtech -- but the empty templates require the contractor to build the compliance bridge themselves. |
| Agency managing multiple client projects | Spin up client projects quickly with industry-appropriate doctrine, risk categories, and quality gates already in place | Each new client engagement starts from scratch. An agency serving healthcare clients and fintech clients needs different starting points for each. Currently, the agency must maintain their own template library outside of Investiture. |
| Consulting firm | Deliver structured methodology artifacts to clients in specific industries with credible, industry-aware defaults | Client-facing artifacts (PRDs, proposals, architecture docs) that reference industry-standard compliance frameworks signal competence. Generic templates signal "we will figure it out as we go." |
| Solo developer or small team (non-regulated) | Get started with Investiture using a bundle that matches their workflow without industry overhead | Not every user needs compliance frameworks. The bundle system must serve unregulated adopters with lean bundles that do not impose unnecessary ceremony. |

## Proposed Solution

A structured bundle system that packages Investiture skills, doctrine templates, and compliance seeds into curated, industry-specific starting points. Each bundle is a data artifact -- not code, not hardcoded skill logic -- that defines three things: which skills to run and in what order, which doctrine template variants to use (VECTOR.md, ARCHITECTURE.md, CLAUDE.md with industry constraints pre-filled), and which `/vector/` directory seeds to pre-populate (compliance frameworks, risk categories, assumption seeds, quality gate additions).

When a user selects a bundle -- either through `invest-start`'s `--bundle` flag or directly -- the bundle system resolves the manifest, applies the doctrine templates, seeds the `/vector/` directory with relevant frameworks, and hands the skill sequence to the onboarding experience. The user gets a project that feels like it was set up by someone who understands their industry: a healthcare project's VECTOR.md already lists HIPAA as a constraint, its quality gates already include PHI handling verification, and its `/vector/research/assumptions/` directory already contains seeds like "all patient data must be encrypted at rest and in transit" marked as regulatory requirements rather than hypotheses.

Bundles are structured data (JSON or YAML manifest files) so they can be read, extended, versioned, and contributed by the community. The system is deliberately separate from `invest-start`: the onboarding skill consumes bundles, but bundles exist independently and can be used by other skills or tooling. This separation respects Design Principle 1 ("skills are self-contained") -- the bundle system is a data layer, not a skill dependency.

## Scope

### In Scope

- **Bundle manifest format** -- a documented JSON or YAML schema that defines the structure of a bundle: metadata (name, description, version, maintainer, industry tags), skill sequence (ordered list of skill names with per-skill configuration hints), doctrine templates (paths to VECTOR.md, ARCHITECTURE.md, CLAUDE.md variants), and `/vector/` seeds (files to pre-populate in the project's `/vector/` directory)
- **Predefined bundles for v1** -- nine bundles shipped with Investiture, each as a manifest file in a `/bundles/` directory:
  - **`solo-dev`** -- Solo developer or indie builder. Lean doctrine, no compliance overhead. Skills: init, doctrine, architecture, capture, prd.
  - **`consulting`** -- Consulting firm or freelancer. Client-facing artifact chain. Skills: init, proposal, scope, contract, status, handoff.
  - **`enterprise`** -- Enterprise team (non-regulated). Governance-first with traceability. Skills: init, doctrine, compliance, risk, trace, architecture, audit.
  - **`team`** -- Small team or startup. Collaboration loop. Skills: init, doctrine, crew, prd, capture, retro.
  - **`open-source`** -- Open source maintainer. Existing codebase path. Skills: backfill, doctrine, changelog, architecture, capture.
  - **`healthcare`** -- Healthcare and health-tech. HIPAA constraints, PHI handling, audit trail requirements. Skills: init, doctrine, compliance, risk, trace, architecture, audit, capture.
  - **`fintech`** -- Financial technology. SOC2, PCI-DSS, financial regulation references. Skills: init, doctrine, compliance, risk, trace, architecture, audit, capture.
  - **`govtech`** -- Government technology. FedRAMP, FISMA, Section 508 accessibility, procurement documentation standards. Skills: init, doctrine, compliance, risk, trace, architecture, audit, capture.
  - **`agency`** -- Digital agency managing multiple client projects. Fast project spinup with client-appropriate defaults. Skills: init, doctrine, proposal, scope, contract, prd, status, handoff.
- **Industry doctrine templates** -- variant VECTOR.md, ARCHITECTURE.md, and CLAUDE.md files for each industry bundle:
  - Healthcare VECTOR.md: Constraints section pre-filled with HIPAA Privacy Rule, Security Rule, Breach Notification Rule references; quality gates include PHI data handling verification, audit logging requirements, minimum necessary standard compliance checks
  - Fintech VECTOR.md: Constraints section pre-filled with SOC2 Trust Service Criteria, PCI-DSS requirements, financial data retention policies; quality gates include encryption verification, access control documentation, transaction audit trail requirements
  - Govtech VECTOR.md: Constraints section pre-filled with FedRAMP controls, FISMA categories, Section 508 accessibility requirements; quality gates include Authority to Operate checkpoints, security control documentation, accessibility testing gates
  - Enterprise VECTOR.md: Constraints section pre-filled with common enterprise governance requirements (change management, access control, data classification); quality gates include architectural review checkpoints, security review gates
  - ARCHITECTURE.md variants with industry-specific "What Not to Do" sections (e.g., healthcare: "Do not store PHI in client-side state"; fintech: "Do not log full card numbers or account numbers")
  - CLAUDE.md variants with industry-specific "Key Context" sections (e.g., govtech: "All deployments require ATO approval before production release")
- **`/vector/` directory seeds** -- pre-populated files for industry bundles:
  - Compliance framework stubs in `/vector/research/` with regulatory requirement checklists relevant to each industry
  - Risk category seeds in `/vector/research/assumptions/` with industry-standard risk categories (e.g., healthcare: data breach risk, patient safety risk, regulatory penalty risk; fintech: fraud risk, regulatory fine risk, data loss risk)
  - Assumption seeds -- known regulatory truths marked as "regulatory requirement" rather than "hypothesis" (e.g., "HIPAA requires encryption of PHI at rest" is not an assumption to validate -- it is a constraint to encode)
- **Bundle resolution logic** -- the mechanism by which a bundle manifest is read, validated, and applied to a project. This includes: reading the manifest, copying doctrine templates into the project root, seeding `/vector/` subdirectories, and returning the skill sequence to the consuming skill (e.g., `invest-start`)
- **Bundle listing and inspection** -- a way to list available bundles and inspect a bundle's contents before applying it, so the user knows what they are getting
- **Bundle composability** -- bundles can declare a base bundle and extend it. For example, `healthcare` extends `enterprise` (inheriting the governance skill sequence) and adds HIPAA-specific doctrine and seeds. This prevents duplication across bundles that share a common foundation
- **Documentation of the bundle manifest schema** -- a schema file in `/vector/schemas/` that defines the bundle format, enabling validation and community contribution

### Out of Scope

- **Custom bundle creation by users** -- v1 ships predefined bundles only. Users cannot yet create their own bundles through an Investiture skill. v2 consideration: an `invest-bundle` skill that scaffolds a new bundle manifest from user input.
- **Bundle registry or marketplace** -- v1 bundles ship with the Investiture repository. There is no remote registry, no `install` command for community bundles, no version resolution for external bundles. v2 consideration: a registry concept where community-contributed bundles can be discovered and installed.
- **Automated compliance verification** -- bundles pre-fill compliance references and quality gates, but they do not verify that the project actually meets those requirements. Investiture is not a compliance tool (VECTOR.md: "Not a linter or code quality tool. It audits against YOUR declared doctrine, not preset rules."). Compliance verification is the responsibility of dedicated compliance tooling.
- **Legal or regulatory advice** -- doctrine templates reference regulatory frameworks but do not constitute legal guidance. The templates are starting points, not substitutes for compliance counsel.
- **Bundle migration** -- if a user starts with `solo-dev` and later needs `healthcare`, there is no automated migration path in v1. They would need to manually apply the healthcare doctrine template and seeds. v2 consideration.
- **Per-skill configuration within bundles** -- v1 bundles define which skills to run and in what order, but do not pass configuration arguments to individual skills. Each skill runs with its own defaults. v2 consideration: bundle manifests that include per-skill argument overrides.
- **Telemetry or bundle usage tracking** -- consistent with VECTOR.md's open question about measuring adoption, no instrumentation is included.
- **Non-English regulatory frameworks** -- v1 doctrine templates reference US and international English-language regulatory frameworks only. Localization of compliance references is a v2 consideration.

### Dependencies

- **`invest-start` (Getting Started Path)** -- the primary consumer of bundles. The Getting Started Path PRD (prd-getting-started-path-2026-03-19) already defines a `--bundle` flag and references five bundles by name. This PRD expands those five to nine, adds doctrine templates and `/vector/` seeds, and externalizes the bundle data from the skill. The `invest-start` skill must be updated to read bundle manifests rather than hardcoding sequences. Owned by: Zero Vector. Status: PRD drafted, not yet implemented.
- **`invest-init`** -- the skill that creates the initial project scaffold including VECTOR.md, CLAUDE.md, and ARCHITECTURE.md. The bundle system needs `invest-init` to accept template variants rather than always using the default templates. Owned by: Zero Vector. Status: skill shipped, modification required.
- **`invest-doctrine`** -- reads and audits doctrine files. Must recognize industry-specific sections added by bundle templates (e.g., a "Regulatory Constraints" section in VECTOR.md) without flagging them as non-standard. Owned by: Zero Vector. Status: skill shipped, review required for compatibility.
- **All 27 skills referenced across all 9 bundles must exist and be functional.** The bundles reference: `invest-init`, `invest-backfill`, `invest-doctrine`, `invest-architecture`, `invest-capture`, `invest-prd`, `invest-proposal`, `invest-scope`, `invest-contract`, `invest-status`, `invest-handoff`, `invest-compliance`, `invest-risk`, `invest-trace`, `invest-crew`, `invest-retro`, `invest-changelog`, `invest-audit`. All are currently shipped (VECTOR.md Assumption 2: validated, 25 skills shipped and functional).
- **Bundle manifest schema** -- must be defined before bundles can be authored or validated. No external dependency; this is authored as part of this feature. Will live in `/vector/schemas/`.

## Success Criteria

| Criterion | Metric | Target | How to Measure |
|-----------|--------|--------|---------------|
| Bundle system is consumable by `invest-start` | Integration completeness | `invest-start --bundle [name]` resolves and applies all 9 predefined bundles without error | Manual testing: run `invest-start` with each bundle name on a clean project directory and verify doctrine files, `/vector/` seeds, and skill sequence are correct |
| Industry doctrine templates contain accurate regulatory references | Regulatory accuracy | Healthcare, fintech, and govtech templates reviewed by at least one domain practitioner each | Structured review: share templates with practitioners and collect feedback on accuracy, completeness, and appropriateness of pre-filled constraints |
| Bundles reduce time to first doctrine-aligned session for regulated industries | Setup time compared to manual configuration | At least 50% reduction in time from project start to first `invest-capture` for a healthcare or fintech project compared to starting from blank templates | Timed comparison: 3 users set up a healthcare project with the bundle vs. 3 users set up manually from blank templates. Measure time to completed doctrine files + first capture. |
| Bundle composability works | Extension resolution | `healthcare` bundle correctly inherits `enterprise` base and adds HIPAA-specific content without duplication | Automated validation: apply `healthcare` bundle and verify it contains all `enterprise` skills plus healthcare-specific additions, and that doctrine templates merge correctly |
| Doctrine templates pass `invest-doctrine` audit | Audit compliance | All 9 bundle doctrine template sets pass `invest-doctrine` without errors or warnings about missing required sections | Run `invest-doctrine` against each template set in a test project |
| Bundle manifest schema is documented and validatable | Schema completeness | Schema file in `/vector/schemas/` validates all 9 predefined bundle manifests | JSON Schema validation: all 9 manifests pass schema validation with no errors |
| Non-regulated bundles remain lean | Ceremony overhead | `solo-dev` and `open-source` bundles produce no compliance-related files or quality gates | Manual inspection: apply `solo-dev` bundle and verify `/vector/` contains no compliance stubs, risk category seeds, or regulatory assumption files |

Metrics are not yet instrumentable. All success criteria are qualitative, measured through manual testing and practitioner review. If `invest-metrics` is run in the future, bundle selection frequency and time-to-first-capture per bundle should be added to the metrics framework.

## Open Questions

1. **JSON or YAML for bundle manifests?** -- YAML is more human-readable and allows comments (useful for documenting why a skill is in the sequence). JSON is more universally parseable and consistent with existing `/vector/schemas/` which use JSON. The schema files in `/vector/schemas/` currently use `zv-*.json` naming. Blocks: manifest format specification and schema definition. Ask: Zero Vector maintainers, considering that community contributors will need to author and edit these files.

2. **How deep should doctrine templates go?** -- A healthcare VECTOR.md could list every HIPAA provision or just the top-level rules (Privacy, Security, Breach Notification). Too shallow and the template does not save meaningful time. Too deep and it becomes a compliance document rather than a starting point, violating the constraint that Investiture is "not a replacement for thinking." Blocks: template authoring for all industry bundles. Ask: healthcare, fintech, and govtech practitioners -- what level of specificity is useful as a starting point without being prescriptive?

3. **Should bundles ship inside the Investiture repository or as a separate package?** -- Shipping inside the repo keeps everything together and simplifies installation. Shipping separately allows bundle updates independent of skill releases and keeps the core repository lean. This also affects the v2 registry concept -- if bundles are separate from day one, the path to a community registry is shorter. Blocks: repository structure and installation approach. Ask: Zero Vector maintainers, considering the npm packaging strategy (prd-npm-packaging-2026-03-19).

4. **How should doctrine template merging work when a bundle extends a base?** -- If `healthcare` extends `enterprise`, and both define a VECTOR.md Constraints section, should the healthcare constraints replace the enterprise constraints, append to them, or merge at the bullet-point level? This is a design decision with significant implications for template authoring and bundle composability. Blocks: composability implementation. Ask: Zero Vector maintainers, test with at least two extension scenarios (healthcare extends enterprise, agency extends consulting).

5. **Who validates industry-specific content?** -- Investiture is an open source project maintained by Zero Vector. The bundle templates will contain regulatory references for healthcare, fintech, and government technology. These references need domain review to be credible. If they ship with errors, they undermine trust. Blocks: v1 launch of healthcare, fintech, and govtech bundles. Ask: Zero Vector network -- identify at least one domain reviewer per regulated industry bundle before shipping those bundles.

6. **Should the bundle system be a skill or a library?** -- The bundle system is consumed by `invest-start` and potentially by other skills in the future. Making it a skill (`invest-bundle`) gives it a user-facing command but may not be the right interface for what is fundamentally infrastructure. Making it a library (a set of manifest files + a resolution convention that skills read) keeps it as data, consistent with the constraint that skills are markdown files with no shared state except `/vector/` and doctrine files. Blocks: implementation architecture. Ask: Zero Vector maintainers, informed by Design Principle 1 (skills are self-contained) and the constraint that there are no npm dependencies in skills.

## Assumptions & Risks

### Validated Assumptions

- The Claude Code skill format is sufficient to deliver a bundle resolution system -- 25 skills already ship, read structured data from the filesystem, and produce templated output (VECTOR.md Assumption 2, status: validated).
- The `/vector/` directory structure is consistent enough across skills to serve as the seed target -- all existing skills read from and write to documented `/vector/` paths per ARCHITECTURE.md's project structure.
- Skill bundles as a concept are viable -- the Getting Started Path PRD already defines five bundles with skill sequences, and the approach was accepted in that PRD's scope. This PRD extends the concept, it does not introduce it.

### Unvalidated Assumptions

- **Pre-populated industry doctrine meaningfully accelerates adoption for regulated teams** -- no user research has been conducted with enterprise, healthcare, fintech, or govtech adopters. The entire value proposition of industry bundles rests on this assumption. Risk if wrong: significant authoring effort for templates that do not save users meaningful time. Recommend: structured interviews with 3-5 practitioners in regulated industries before investing in deep template content. Start with healthcare and fintech as the highest-signal verticals.

- **Regulatory references in doctrine templates will be accurate enough to be useful without being so detailed they become a liability** -- the templates must hit a narrow band: specific enough to save setup time, general enough to avoid being mistaken for compliance advice. Risk if wrong: templates either too shallow (users do not save time) or too deep (users treat them as compliance guidance and miss requirements). Recommend: review cycle with domain practitioners before shipping regulated bundles.

- **Nine bundles is the right number for v1** -- this is a guess. It is possible that five is enough (solo-dev, consulting, enterprise, team, open-source -- the original set from the Getting Started Path PRD) and the four industry bundles (healthcare, fintech, govtech, agency) should wait for validated demand. Risk if wrong: maintenance burden for bundles with zero adoption. Recommend: ship the five workflow bundles first, add industry bundles when at least one adopter per industry has expressed interest.

- **Bundle composability (extension/inheritance) is needed in v1** -- composability adds implementation complexity but reduces template duplication. If only 2-3 bundles share a base, the duplication cost may be lower than the composability cost. Risk if wrong: over-engineering. Recommend: author healthcare and enterprise bundles independently first, measure actual duplication, then decide if composability is worth implementing.

- **Community contribution to bundles will happen if the format is open and documented** -- the v2 registry concept assumes a community will author and share bundles. Open source projects often see fewer contributions than expected. Risk if wrong: the registry concept is built but unused. Recommend: do not build registry infrastructure until at least 3 community-contributed bundles have been submitted as PRs to the main repository.

### Key Risks

- **Stale regulatory references** -- regulations change. HIPAA has been relatively stable, but PCI-DSS releases new versions, FedRAMP evolves, and new regulations emerge. Bundle templates that reference specific versions or provisions will become outdated. Likelihood: H. Impact: M. Mitigation: date-stamp all regulatory references in templates, include a "last reviewed" field in the bundle manifest, and document in the template itself that regulatory references are starting points that must be verified against current requirements.

- **Credibility risk from inaccurate industry content** -- if a healthcare bundle ships with an incorrect HIPAA reference, it signals that Investiture does not understand the domain. This is worse than shipping no healthcare bundle at all. Likelihood: M. Impact: H. Mitigation: do not ship regulated-industry bundles without domain practitioner review. Gate healthcare, fintech, and govtech bundles behind review sign-off. Ship the five workflow bundles (solo-dev, consulting, enterprise, team, open-source) first -- they carry no regulatory content and no credibility risk.

- **Maintenance burden scales with bundle count** -- each bundle is a combination of manifest, doctrine templates, and `/vector/` seeds. Nine bundles with three doctrine files each plus seed files could mean 40+ files to maintain. Likelihood: H. Impact: M. Mitigation: composability (so shared content is authored once), clear ownership per bundle, and inclusion in the Ship Criteria checklist so bundles are reviewed when skills change.

- **Template rigidity discourages customization** -- if users treat bundle templates as "the right answer" rather than starting points, they may not customize doctrine to their actual project. This would undermine VECTOR.md's core principle that "Investiture audits against what YOU declared, not what some framework thinks is best practice" (Design Principle 2: "Doctrine over convention"). Likelihood: M. Impact: M. Mitigation: every template includes explicit comments marking sections as "customize this" and explaining that the pre-filled content is a starting point. The `invest-doctrine` skill should prompt users to review and own their doctrine rather than accepting defaults uncritically.

- **Scope overlap with invest-start** -- the Getting Started Path PRD already defines bundles inline. This PRD externalizes and expands them. If the two PRDs are not coordinated during implementation, they will produce conflicting bundle definitions. Likelihood: M. Impact: H. Mitigation: implement the bundle system first, then update `invest-start` to consume it. The Getting Started Path PRD's In Scope section should be revised to reference this bundle system rather than defining bundles inline.

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-19 | Zero Vector | Initial draft |

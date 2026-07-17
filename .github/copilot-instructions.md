# Copilot review instructions

- Prioritize correctness, security, accessibility, deterministic behavior, and useful tests.
- Flag exposed secrets, unsafe browser behavior, unnecessary permissions, and supply-chain risks.
- Check that interactive 3D behavior has an accessible DOM alternative and reduced-motion handling.
- Check that unit and browser tests assert meaningful user behavior rather than implementation details.
- Expect the repository-defined validation command and CI to pass.
- Do not request deployment, hosting, cloud infrastructure, or unrelated scope expansion.

# Angular 4 to 18 Upgrade Roadmap

This document outlines the strategic plan to upgrade the existing Angular 4.3.6 application to the latest stable Angular version (18+).

## Phase 1: Preparation & Assessment
- **Dependency Audit**: Review `package.json` for breaking changes in libraries such as `rxjs`.
- **TypeScript**: Align TypeScript version to the requirements of subsequent Angular versions.
- **Node Environment**: Standardize local development on a supported Node LTS version.

## Phase 2: The Incremental Upgrade Path
We will leverage the [Angular Update Guide](https://update.angular.io/) for each major step.
- **Goal**: Maintain functional parity at every step (4 -> 5 -> 6 ... -> 18).
- **Process**: Upgrade -> Fix Build -> Run Tests -> Verify Features (Seed Loading/Tracking) -> Commit -> Repeat.

### Key Version Milestones
1.  **v4 -> v6**: Major refactoring of RxJS (v5 -> v6) and transition to `HttpClient`.
2.  **v6 -> v8**: Moving away from deprecated modules and updating build pipeline.
3.  **v8 -> v13**: Ivy compiler adoption and modernizing DI patterns.
4.  **v13 -> v18**: Adopting modern Angular features (Standalone Components, Signals, etc.).

## Phase 3: Modernizing Logic and Codebase
- **Services**: Refactor from legacy `Http` to `HttpClient` and implement `providedIn: 'root'`.
- **Global Integration**: Replace hardcoded `jQuery` in `index.html` with Angular-native implementations.
- **Cleanup**: Remove legacy polyfills and update build configurations.

## Phase 4: Build, CI/CD, and Deployment
- **Build System**: Migrate `angular-cli.json` to the modern `angular.json` workspace format.
- **Dev Workflow**: Standardize development on `npm start` and `npm run build`.
- **CI/CD**: Update GitHub Actions to utilize current Node versions and build outputs.

## Technical Risks
- **RxJS Migration**: Significant changes in `Observable` operators.
- **Third-party Compatibility**: Potential need to replace or re-implement outdated packages.

---

### How to Proceed
To begin the execution, **toggle to Act Mode**. We will then start with Phase 1 by analyzing dependencies and preparing the local environment for the initial version jump.

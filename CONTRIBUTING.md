# Contributing

## How do I help?

Best ways to contribute:
1. Build a website with it
2. Writing a component library based on it
3. Writing a blog post about using it
4. Create a Component Part for it
5. Write middleware to integrate it with other frameworks or build systems

If you do any of these, please reach out and we can possibly list it in the
Examples page, along with other "sightings" of Modulo "in the wild"!

If you are curious about working on the Modulo source code itself, read on.

## Dev Environment

- Run local dev env:
    - npm run start
- Run unit tests locally in the browser:
    - <http://localhost:3334/demos/tests/?mod-cmd=test>
- In the terminal (uses puppeteer):
    - `npm run test`

## Formatting

Contributing code to the core of Modulo follows stricter than typical JS coding
standards:

- 80 char line limit (no exceptions!)
- 4 char space indentation

## Guidelines

- Do not write any clever, cool, smart, or fun code. Only boring code allowed.
- Modulo may be short & sweet, but that doesn't mean "code golf" style
  minification. Instead, keep it simple, clear, and self-documenting.
- Avoid continuing long statements onto new lines. Instead, create
  descriptively named temporary variables.
- For complicated operations, use JS constructs such as `for..of` loops to keep
  the code's logical flow clear and imperative, instead of chaining methods
  such as `.forEach` or `.map`
- Most operations should be synchronous, so they can finish before reflow (e.g.
  do not add unnecessary layers of callback indirection)

- Note: During the *alpha* phase, this will not be rigidly followed, until full
  linting rules are written, which will then be required for code to be
  accepted


## Statuses

- prealpha - unreleased, keep an eye on it!
- alpha - use it if you don't mind large bugs or incomplete docs if you stray
  too far beyond the examples
- beta - use it if you don't mind small bugs
- 1.x release - use it, ready for all general use, some small bugs may crop up,
  and some extra features may be added
- mature - use it, featureset is stable and will have no changes (including
  additions)


## Versioning roadmap

- Prealpha
- Alpha: 0.0.x
    - Alpha versions will be released quickly as patches on 0.0 release
    - The documented Component definition API will stay mostly the same
    - Extension APIs (e.g. custom Component Parts, Reconcilers, etc) may change
      in backward incompatible ways in these releases, without deprecation
      notices
- Beta: 0.x.y
    - Beta will be `0.*` releases
    - Beta versions will be released according to a typical minor/patch
      versioning system, as described below
        - Minor releases: Documentation or feature changes
        - Patch releases: No documentation changes (beyond bug fixes)
    - Any backward incompatible changes to any documented API will follow a
      deprecation notice system
- Released: x.y.z
    - At 1.0 release, Modulo will be generally feature complete and stable.
    - Modulo's goal is to provide a stable framework to target, similar to LTS
      releases with Linux distributions
        - This is why although tooling around it might continue to be
          developed, there are no immediate plans beyond a 1.0 release
    - In general, Modulo will follow [Semantic Versioning](https://semver.org/):
        - Major releases: Backwards incompatibility introduced
        - Minor releases: Documentation or feature changes (but no backward
          incompatible changes)
        - Patch releases: No documentation changes (beyond bug fixes)


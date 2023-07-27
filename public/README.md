# Public

This directory's content will be placed as-is into the final builds of this project.

Conventions:

- `assets-natural` should be any assets that are _naturally managed_ by project owners - no processing or automation is performed on these files
- `relocated-cc` is git ignored but will exist during development and in production builds as a cache of _relocated files_ using the rules defined in `src/lib/universal/remark-transform-img-preview-src.ts`
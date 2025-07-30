/**
 * Reads the `BASE_PATH` environment variable, which is injected during the
 * build on GitHub Actions.  When deploying to GitHub Pages, this variable
 * contains the repository name so that asset and link prefixes resolve
 * correctly at runtime.  In local development it will be undefined, so an
 * empty string is returned instead.
 */
const prefix: string = process.env.BASE_PATH || '';

export { prefix };
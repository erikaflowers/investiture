/**
 * Eleventy Configuration
 *
 * Builds static HTML from Nunjucks templates.
 * Run from project root: npx eleventy
 */

module.exports = function(eleventyConfig) {
  // Pass through static assets from views/vanilla to output root
  eleventyConfig.addPassthroughCopy({ "views/vanilla/app.js": "app.js" });
  eleventyConfig.addPassthroughCopy({ "views/vanilla/docs.js": "docs.js" });
  eleventyConfig.addPassthroughCopy({ "views/vanilla/nav.js": "nav.js" });
  eleventyConfig.addPassthroughCopy({ "views/vanilla/styles.css": "styles.css" });
  eleventyConfig.addPassthroughCopy({ "views/vanilla/favicon.svg": "favicon.svg" });

  // Pass through design system tokens
  eleventyConfig.addPassthroughCopy("design-system");

  // Pass through CLAUDE.md for docs page
  eleventyConfig.addPassthroughCopy("CLAUDE.md");

  // Watch for SCSS changes (triggers rebuild)
  eleventyConfig.addWatchTarget("views/vanilla/*.scss");
  eleventyConfig.addWatchTarget("views/vanilla/*.css");

  // Set Nunjucks options
  eleventyConfig.setNunjucksEnvironmentOptions({
    throwOnUndefined: false,
    autoescape: false
  });

  return {
    // Template formats to process
    templateFormats: ["njk", "md"],

    // Use Nunjucks for HTML files
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",

    // Directory configuration
    dir: {
      input: "views/vanilla",
      includes: "_includes",
      data: "_data",
      output: "docs"
    },

    // Path prefix - use ELEVENTY_ENV=production for GitHub Pages
    pathPrefix: process.env.ELEVENTY_ENV === 'production' ? "/investiture/" : "/"
  };
};

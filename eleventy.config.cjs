/**
 * Eleventy Configuration
 *
 * Builds static HTML from Nunjucks templates.
 * Run from project root: npm run dev
 */

module.exports = function(eleventyConfig) {
  // Pass through static assets
  eleventyConfig.addPassthroughCopy("app.js");
  eleventyConfig.addPassthroughCopy("docs.js");
  eleventyConfig.addPassthroughCopy("nav.js");
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("favicon.svg");

  // Watch for CSS changes
  eleventyConfig.addWatchTarget("*.css");
  eleventyConfig.addWatchTarget("*.scss");

  // Ignore the React demo folder (built separately)
  eleventyConfig.ignores.add("demo/**");

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

    // Directory configuration - flat structure
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "docs"
    },

    // Path prefix for GitHub Pages
    pathPrefix: process.env.ELEVENTY_ENV === 'production' ? "/investiture/" : "/"
  };
};

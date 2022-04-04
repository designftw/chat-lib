module.exports = {
  source: {
    include: ["src"],
  },
  opts: {
    // include files recursively
    recurse: true,
    // put json output in the docs folder
    destination: "docs",
    // use the readme as the home page for jsdoc
    readme: "README.md",
    // use clean-jsdoc theme for a better user experience
    template: "node_modules/clean-jsdoc-theme",
    // show what jsdoc is doing
    verbose: true,
  },
  plugins: [
    // fix for https://github.com/jsdoc/jsdoc/issues/1132
    // jsdoc doesn't parse export default statements correctly
    // for classes that extend other classes
    "./node_modules/@ckeditor/jsdoc-plugins/lib/export-fixer/export-fixer.js",
  ],
};

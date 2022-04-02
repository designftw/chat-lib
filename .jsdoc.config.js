module.exports = {
  source: {
    // include all js files in the src directory
    include: ["src"],
  },
  opts: {
    // include files recursively
    recurse: true,
    // put json output in the docs folder
    destination: "docs",
    // use the readme as the home page for jsdoc
    readme: "README.md",
  },
  plugins: [
    // fix for https://github.com/jsdoc/jsdoc/issues/1132
    // jsdoc doesn't parse export default statements correctly
    // for classes that extend other classes
    "./node_modules/@ckeditor/jsdoc-plugins/lib/export-fixer/export-fixer.js",
  ],
};

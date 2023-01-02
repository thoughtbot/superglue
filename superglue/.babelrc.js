module.exports = {
  plugins: [
    ["transform-react-remove-prop-types", {removeImport: true}]
  ],
  presets: [
    [
      "@babel/preset-env",
      {
        useBuiltIns: "entry",
        corejs: "2",
        loose: true,
      }
    ],
    [
      "@babel/preset-react"
    ],
  ],
};

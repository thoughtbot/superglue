module.exports = {
  plugins: [],
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        corejs: '2',
        loose: true,
      },
    ],
    ['@babel/preset-react'],
    ['@babel/preset-typescript'],
  ],
}

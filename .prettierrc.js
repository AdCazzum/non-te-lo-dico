module.exports = {
  arrowParens: "avoid",
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  quoteProps: "as-needed",
  trailingComma: "all",
  bracketSpacing: true,
  endOfLine: "auto",
  importOrder: ["^react$", "^next/(.*)$", "<THIRD_PARTY_MODULES>", "^@/(.*)$", "^~~/(.*)$", "^[./]"],
  importOrderSortSpecifiers: true,
  plugins: [],
  overrides: [
    {
      files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
      options: {
        plugins: [require.resolve("@trivago/prettier-plugin-sort-imports")],
      },
    },
  ],
};

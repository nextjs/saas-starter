import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const config = [
  // Ignore build outputs and system files
  {
    ignores: [
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",
      "node_modules/**",
      "*.log",
      ".env*",
      ".DS_Store",
    ],
  },

  // Extend Next.js recommended configs
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Custom rules for type-safe environment variables
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.name='process'][property.name='env']",
          message:
            "Use env imports from './env/server' or './env/client' instead of process.env for type safety and validation.",
        },
      ],
    },
  },

  // Allow process.env in designated configuration files
  {
    files: ["env/**/*.ts", "next.config.*", "drizzle.config.*"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
];

export default config;

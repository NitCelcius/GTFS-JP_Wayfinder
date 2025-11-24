/**
 * ESLint rule to prevent direct access to process.env and window.__ENV__
 *
 * This rule enforces that environment variables are only accessed through
 * the centralized useEnv hook or getEnvValue utility function.
 *
 * This ensures:
 * 1. Type safety - all env vars are validated
 * 2. Consistency - single source of truth for env var handling
 * 3. Maintainability - easier to audit and update env var usage
 */

const noDirectEnvAccessRule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prevent direct access to process.env and window.__ENV__ outside of useEnv hook and envUtils",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      noProcessEnv:
        "Direct access to process.env is not allowed. Use useEnv hook or getEnvValue function instead.",
      noWindowEnv:
        "Direct access to window.__ENV__ is not allowed. Use useEnv hook or getEnvValue function instead.",
      noProcessEnvProperty:
        "Direct access to process.env.{{ property }} is not allowed. Use useEnv hook or getEnvValue function instead.",
    },
  },

  create(context) {
    const filename = context.getFilename();

    // Allow direct env access in useEnv.ts and envUtils.ts
    if (filename.includes("useEnv.ts") || filename.includes("envUtils.ts")) {
      return {};
    }

    return {
      /**
       * Detect: process.env
       */
      MemberExpression(node) {
        // Check for process.env
        if (
          node.object.type === "Identifier" &&
          node.object.name === "process" &&
          node.property.type === "Identifier" &&
          node.property.name === "env"
        ) {
          context.report({
            node,
            messageId: "noProcessEnv",
          });
        }

        // Check for window.__ENV__
        if (
          node.object.type === "Identifier" &&
          node.object.name === "window" &&
          node.property.type === "Identifier" &&
          node.property.name === "__ENV__"
        ) {
          context.report({
            node,
            messageId: "noWindowEnv",
          });
        }

        // Check for process.env.SOME_VAR
        if (
          node.object.type === "MemberExpression" &&
          node.object.object.type === "Identifier" &&
          node.object.object.name === "process" &&
          node.object.property.type === "Identifier" &&
          node.object.property.name === "env"
        ) {
          context.report({
            node,
            messageId: "noProcessEnvProperty",
            data: {
              property: node.property.name || "unknown",
            },
          });
        }

        // Check for window.__ENV__.SOME_VAR
        if (
          node.object.type === "MemberExpression" &&
          node.object.object.type === "Identifier" &&
          node.object.object.name === "window" &&
          node.object.property.type === "Identifier" &&
          node.object.property.name === "__ENV__"
        ) {
          context.report({
            node,
            messageId: "noWindowEnv",
          });
        }
      },
    };
  },
};

export default noDirectEnvAccessRule;

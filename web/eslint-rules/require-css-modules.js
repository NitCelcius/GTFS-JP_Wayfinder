// Custom ESLint rule to enforce using CSS Modules in the web/ directory.
// Allows only explicitly whitelisted global CSS files (e.g. globals.css).
// Any import ending with .css must end with .module.css unless allowed.

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow importing plain .css files; require *.module.css except for allowed global styles",
    },
    schema: [
      {
        type: "object",
        properties: {
          allow: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      useModule:
        'CSS file "{{importPath}}" must be a CSS Module (rename to *.module.css) or be explicitly allowed.',
    },
  },
  create(context) {
    const options = context.options?.[0] || {};
    const allowList = new Set(
      options.allow || ["globals.css", "./globals.css"]
    );

    return {
      ImportDeclaration(node) {
        const source = node.source && node.source.value;
        if (typeof source !== "string") return;

        if (source.endsWith(".css") && !source.endsWith(".module.css")) {
          const fileName = source.split("/").pop();
          // Allow if the full path OR just the filename is in allow list
          if (!allowList.has(source) && !allowList.has(fileName)) {
            context.report({
              node,
              messageId: "useModule",
              data: { importPath: source },
            });
          }
        }
      },
    };
  },
};

export default rule;

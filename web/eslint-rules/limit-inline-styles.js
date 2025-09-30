// ESLint rule: limit-inline-styles
// Enforces:
// 1. className string literals may contain only up to a configurable number of utility tokens (default 4)
//    before requiring extraction into a CSS Module.
// 2. Disallows raw hex color literals (#fff, #ffffff, #1a2b3c) inside JSX attributes or string literals
//    unless the file is in an allow list (globals.css) OR the string is inside a *.module.css file (handled by stylelint ideally, but here we guard JSX).
// 3. Allows explicitly whitelisted className patterns (e.g. single-size icon sizing like w-6 h-6) via allowPatterns option.

const HEX_REGEX = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/;

function isJsxAttributeWithName(node, name) {
  return node.type === "JSXAttribute" && node.name && node.name.name === name;
}

function extractClassNameLiteral(node) {
  if (!node || !node.value) return null;
  if (node.value.type === "Literal" && typeof node.value.value === "string") {
    return node.value.value;
  }
  // JSXExpressionContainer with template literal or string literal
  if (node.value.type === "JSXExpressionContainer") {
    const expr = node.value.expression;
    if (expr.type === "Literal" && typeof expr.value === "string")
      return expr.value;
    if (expr.type === "TemplateLiteral" && expr.quasis.length === 1) {
      return expr.quasis[0].value.cooked || null;
    }
  }
  return null;
}

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Limit inline utility className length and forbid raw hex colors in JSX to encourage CSS Modules & tokens",
    },
    schema: [
      {
        type: "object",
        properties: {
          maxUtilityClasses: { type: "number" },
          allowPatterns: { type: "array", items: { type: "string" } },
          allowHexInFiles: { type: "array", items: { type: "string" } },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      tooManyUtilities:
        "className has {{count}} utility tokens (limit: {{limit}}). Extract to a CSS Module.",
      rawHexColor:
        "Raw hex color '{{color}}' detected. Use a design token (CSS variable) instead.",
    },
  },
  create(context) {
    const options = context.options?.[0] || {};
    const maxUtilityClasses = options.maxUtilityClasses ?? 4;
    const allowPatterns = (options.allowPatterns || []).map(
      (p) => new RegExp(p)
    );
    const allowHexInFiles = new Set(options.allowHexInFiles || []);

    const filename = context.getFilename();
    const isAllowedHexFile = Array.from(allowHexInFiles).some((allowed) =>
      filename.endsWith(allowed)
    );

    function isAllowedByPattern(token) {
      return allowPatterns.some((re) => re.test(token));
    }

    return {
      JSXAttribute(node) {
        // 1. Enforce className size limit
        if (isJsxAttributeWithName(node, "className")) {
          const value = extractClassNameLiteral(node);
          if (value) {
            const tokens = value
              .split(/\s+/)
              .map((t) => t.trim())
              .filter(Boolean);
            // Skip if all tokens are allowed by pattern
            const filtered = tokens.filter((t) => !isAllowedByPattern(t));
            if (filtered.length > maxUtilityClasses) {
              context.report({
                node,
                messageId: "tooManyUtilities",
                data: { count: filtered.length, limit: maxUtilityClasses },
              });
            }
          }
        }
        // 2. Raw hex detection inside other string-valued attributes (style not included since style object is discouraged anyway)
        if (!isAllowedHexFile) {
          const raw = extractClassNameLiteral(node); // reuse for attributes that are simple strings
          if (raw && HEX_REGEX.test(raw)) {
            const match = raw.match(HEX_REGEX);
            if (match) {
              context.report({
                node,
                messageId: "rawHexColor",
                data: { color: match[0] },
              });
            }
          }
        }
      },
      Literal(node) {
        if (isAllowedHexFile) return;
        if (typeof node.value === "string" && HEX_REGEX.test(node.value)) {
          const match = node.value.match(HEX_REGEX);
          if (match) {
            context.report({
              node,
              messageId: "rawHexColor",
              data: { color: match[0] },
            });
          }
        }
      },
    };
  },
};

export default rule;

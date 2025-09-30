// ESLint rule: unused-css-module-classes
// Responsibilities:
// 1. For every imported *.module.css default import (e.g. import styles from './X.module.css'),
//    parse the CSS file for class selectors and record them as defined.
// 2. Track usages: styles.foo / styles["foo"] / styles?.foo.
// 3. Report:
//    a) Undefined class references (if styles.bar not defined).
//    b) Unused defined classes (defined but never referenced in this file) unless ignored.
// Limitations:
// - Per-file perspective: if a CSS Module is imported in multiple TSX files, each file will see
//   classes not used in that file as "unused" (could produce false positives). To mitigate, we
//   only report unused when the module export variable is referenced at least once (ensuring the
//   import is actively used here) AND the number of unused classes is <= a threshold OR an option
//   'alwaysReportUnused' is enabled. Default behavior: report regardless but allow ignoring via patterns.
// - Parsing: simple regex for class selectors: .className { OR .className, .-prefixed; ignores @keyframes, :root, :global.
import fs from "fs";
import path from "path";

const CLASS_REGEX = /\.([a-zA-Z0-9_-]+)\s*[{,]/g; // naive but effective for typical CSS Modules

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Detect unused or undefined CSS Module class names (basic single-file analysis)",
    },
    schema: [
      {
        type: "object",
        properties: {
          ignore: { type: "array", items: { type: "string" } },
          ignoreUnusedPatterns: { type: "array", items: { type: "string" } },
          reportUnused: { type: "boolean" },
          alwaysReportUnused: { type: "boolean" },
          maxSilentUnused: { type: "number" },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      undefinedClass: 'CSS Module class "{{name}}" is not defined in {{file}}.',
      unusedClass:
        'CSS Module class "{{name}}" is defined in {{file}} but never used in this file.',
    },
  },
  create(context) {
    const options = context.options?.[0] || {};
    const ignore = new Set(options.ignore || []); // exact class names
    const unusedPatterns = (options.ignoreUnusedPatterns || []).map(
      (p) => new RegExp(p)
    );
    const reportUnused = options.reportUnused !== false; // default true
    const alwaysReportUnused = options.alwaysReportUnused || false;
    const maxSilentUnused = options.maxSilentUnused ?? Infinity;

    // Store per import: { filePath, defined:Set, used:Set, variableName }
    const imports = new Map(); // variableName -> data

    function shouldIgnoreUnused(className) {
      if (ignore.has(className)) return true;
      return unusedPatterns.some((re) => re.test(className));
    }

    function recordCssModuleImport(node) {
      if (!node.source || typeof node.source.value !== "string") return;
      const importPath = node.source.value;
      if (!importPath.endsWith(".module.css")) return;

      // Only handle default import for now (import styles from './foo.module.css')
      const defaultSpecifier = node.specifiers.find(
        (s) => s.type === "ImportDefaultSpecifier"
      );
      if (!defaultSpecifier) return;

      const varName = defaultSpecifier.local.name;
      // Resolve file path relative to current file
      const basedir = path.dirname(context.getFilename());
      let resolved;
      try {
        resolved = importPath.startsWith(".")
          ? path.resolve(basedir, importPath)
          : null; // ignore node_modules / non-relative
      } catch {
        return;
      }
      if (!resolved) return;
      if (!fs.existsSync(resolved)) return;

      let content = "";
      try {
        content = fs.readFileSync(resolved, "utf8");
      } catch {
        return;
      }
      const defined = new Set();
      let match;
      while ((match = CLASS_REGEX.exec(content)) !== null) {
        const name = match[1];
        if (name && !name.startsWith("global")) {
          defined.add(name);
        }
      }
      imports.set(varName, {
        filePath: resolved,
        defined,
        used: new Set(),
        node,
      });
    }

    function markUsage(member) {
      if (member.object.type !== "Identifier") return;
      const varName = member.object.name;
      const imp = imports.get(varName);
      if (!imp) return;
      if (
        member.property &&
        !member.computed &&
        member.property.type === "Identifier"
      ) {
        imp.used.add(member.property.name);
      }
    }

    function markComputedUsage(node) {
      // styles["class-name"] or styles['className']
      if (node.object.type !== "Identifier") return;
      if (!node.computed) return;
      const varName = node.object.name;
      const imp = imports.get(varName);
      if (!imp) return;
      const prop = node.property;
      if (prop.type === "Literal" && typeof prop.value === "string") {
        imp.used.add(prop.value);
      }
      // Could cover TemplateLiteral simple case
      if (
        prop.type === "TemplateLiteral" &&
        prop.quasis.length === 1 &&
        prop.expressions.length === 0
      ) {
        imp.used.add(prop.quasis[0].value.cooked || "");
      }
    }

    return {
      ImportDeclaration: recordCssModuleImport,
      MemberExpression(node) {
        // styles.foo OR styles["foo"]
        if (node.computed) {
          markComputedUsage(node);
        } else {
          markUsage(node);
        }
      },
      OptionalMemberExpression(node) {
        // styles?.foo
        if (node.computed) {
          markComputedUsage(node);
        } else {
          markUsage(node);
        }
      },
      "Program:exit"() {
        for (const [, data] of imports.entries()) {
          const { defined, used, filePath, node } = data;

          // Report undefined references
          for (const u of used) {
            if (!defined.has(u)) {
              context.report({
                node,
                messageId: "undefinedClass",
                data: { name: u, file: path.basename(filePath) },
              });
            }
          }

          if (!reportUnused) continue;
          // Only report unused if at least one class was used (to reduce multi-import false positives)
          const anyUsed = used.size > 0;
          const unused = [];
          for (const d of defined) {
            if (!used.has(d) && !shouldIgnoreUnused(d)) {
              unused.push(d);
            }
          }
          if (unused.length === 0) continue;
          if (!anyUsed && !alwaysReportUnused) continue;
          if (unused.length > maxSilentUnused && !alwaysReportUnused) continue;

          for (const cls of unused) {
            context.report({
              node,
              messageId: "unusedClass",
              data: { name: cls, file: path.basename(filePath) },
            });
          }
        }
      },
    };
  },
};

export default rule;

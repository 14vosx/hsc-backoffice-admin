import * as fs from 'node:fs';
import * as path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

function getAllTsFiles(dirPath: string): string[] {
  let files: string[] = [];
  if (!fs.existsSync(dirPath)) {
    return files;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllTsFiles(fullPath));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.ts') || entry.name.endsWith('.html') || entry.name.endsWith('.scss'))
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

describe('Architecture Boundaries — Lego Angular', () => {
  const appRoot = path.resolve(__dirname, '..');

  it('application TypeScript files should not contain explicit any types', () => {
    const typeScriptFiles = getAllTsFiles(appRoot).filter((file) => file.endsWith('.ts'));

    for (const file of typeScriptFiles) {
      const sourceFile = ts.createSourceFile(
        file,
        fs.readFileSync(file, 'utf-8'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );
      const anyTypeLocations: string[] = [];

      const visit = (node: ts.Node): void => {
        if (node.kind === ts.SyntaxKind.AnyKeyword) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
          anyTypeLocations.push(`${file}:${line + 1}:${character + 1}`);
        }

        ts.forEachChild(node, visit);
      };

      visit(sourceFile);

      expect(
        anyTypeLocations,
        `Explicit any type found at: ${anyTypeLocations.join(', ')}`,
      ).toEqual([]);
    }
  });

  it('application files should not contain unsafe type suppressions', () => {
    const applicationFiles = getAllTsFiles(appRoot);
    const typeScriptFiles = applicationFiles.filter((file) => file.endsWith('.ts'));
    const templateFiles = applicationFiles.filter((file) => file.endsWith('.html'));
    const unsafeSuppressions: string[] = [];

    for (const file of typeScriptFiles) {
      const sourceText = fs.readFileSync(file, 'utf-8');
      const sourceFile = ts.createSourceFile(
        file,
        sourceText,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );

      const report = (position: number, suppression: string): void => {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(position);
        unsafeSuppressions.push(`${file}:${line + 1}:${character + 1} (${suppression})`);
      };

      const isUnknownAssertion = (node: ts.Node): boolean =>
        (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) &&
        node.type.kind === ts.SyntaxKind.UnknownKeyword;

      const visit = (node: ts.Node): void => {
        if (
          (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) &&
          isUnknownAssertion(node.expression)
        ) {
          report(node.getStart(sourceFile), 'double assertion through unknown');
        }

        ts.forEachChild(node, visit);
      };

      visit(sourceFile);

      for (const match of sourceText.matchAll(/@ts-(?:ignore|expect-error)\b/g)) {
        if (match.index !== undefined) {
          report(match.index, match[0]);
        }
      }
    }

    for (const file of templateFiles) {
      const sourceText = fs.readFileSync(file, 'utf-8');

      for (const match of sourceText.matchAll(/\$any\s*\(/g)) {
        if (match.index !== undefined) {
          const beforeMatch = sourceText.slice(0, match.index);
          const line = beforeMatch.split(/\r?\n/).length;
          const lineStart = Math.max(beforeMatch.lastIndexOf('\n'), beforeMatch.lastIndexOf('\r'));
          const character = match.index - lineStart;
          unsafeSuppressions.push(`${file}:${line}:${character} (Angular $any escape)`);
        }
      }
    }

    expect(
      unsafeSuppressions,
      `Unsafe type suppressions found: ${unsafeSuppressions.join(', ')}`,
    ).toEqual([]);
  });

  it('no component selector should be duplicated across the application', () => {
    const allTsFiles = getAllTsFiles(appRoot).filter((f) => f.endsWith('.ts') && !f.endsWith('.spec.ts'));
    const selectorMap = new Map<string, string[]>();

    for (const file of allTsFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const match = /selector:\s*['"]([^'"]+)['"]/.exec(content);
      if (match) {
        const selector = match[1];
        const existing = selectorMap.get(selector) || [];
        existing.push(file);
        selectorMap.set(selector, existing);
      }
    }

    for (const [selector, files] of selectorMap.entries()) {
      expect(
        files.length,
        `Selector "${selector}" is defined in multiple files: ${files.join(', ')}`,
      ).toBe(1);
    }
  });

  it('shared layer should not import features', () => {
    const sharedFiles = getAllTsFiles(path.join(appRoot, 'shared')).filter((f) => f.endsWith('.ts'));

    for (const file of sharedFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const hasFeatureImport = /from\s+['"].*\/features\//.test(content);
      expect(hasFeatureImport, `File ${file} should not import features`).toBe(false);
    }
  });

  it('core layer should not import features', () => {
    const coreFiles = getAllTsFiles(path.join(appRoot, 'core')).filter((f) => f.endsWith('.ts'));

    for (const file of coreFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const hasFeatureImport = /from\s+['"].*\/features\//.test(content);
      expect(hasFeatureImport, `File ${file} should not import features`).toBe(false);
    }
  });

  it('domain modules should not import Angular', () => {
    const domainFiles = getAllTsFiles(appRoot).filter(
      (f) => f.includes(`${path.sep}domain${path.sep}`) && f.endsWith('.ts') && !f.endsWith('.spec.ts'),
    );

    for (const file of domainFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const hasAngularImport = /from\s+['"]@angular\//.test(content);
      expect(hasAngularImport, `Domain file ${file} should not import @angular/*`).toBe(false);
    }
  });

  it('domain modules should not reference DOM globals', () => {
    const domainFiles = getAllTsFiles(appRoot).filter(
      (f) => f.includes(`${path.sep}domain${path.sep}`) && f.endsWith('.ts') && !f.endsWith('.spec.ts'),
    );

    for (const file of domainFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const hasDomUsage = /\b(window|document|localStorage|sessionStorage)\b/.test(content);
      expect(hasDomUsage, `Domain file ${file} should not reference DOM globals`).toBe(false);
    }
  });

  it('shared/components should not import DTOs', () => {
    const sharedComponentFiles = getAllTsFiles(path.join(appRoot, 'shared', 'components')).filter((f) => f.endsWith('.ts'));

    for (const file of sharedComponentFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const hasDtoImport = /from\s+['"].*(?:\/dto\/|\.dto['"])/.test(content);
      expect(hasDtoImport, `Shared component file ${file} should not import DTOs`).toBe(false);
    }
  });

  it('shared/components should not import HttpClient', () => {
    const sharedComponentFiles = getAllTsFiles(path.join(appRoot, 'shared', 'components')).filter((f) => f.endsWith('.ts'));

    for (const file of sharedComponentFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const hasHttpClientImport = /import[\s\S]*?HttpClient[\s\S]*?from\s+['"]@angular\/common\/http['"]/.test(content);
      expect(hasHttpClientImport, `Shared component file ${file} should not import HttpClient`).toBe(false);
    }
  });

  it('shared/components should not import Angular Material', () => {
    const sharedComponentFiles = getAllTsFiles(path.join(appRoot, 'shared', 'components')).filter((f) => f.endsWith('.ts'));

    for (const file of sharedComponentFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const hasMaterialImport = /from\s+['"]@angular\/material(?:\/|['"])/.test(content);
      expect(hasMaterialImport, `Shared component file ${file} should not import Angular Material`).toBe(false);
    }
  });

  it('shared/components should not import shared/ui', () => {
    const sharedComponentFiles = getAllTsFiles(path.join(appRoot, 'shared', 'components')).filter((f) => f.endsWith('.ts'));

    for (const file of sharedComponentFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const hasSharedUiImport = /from\s+['"].*\/shared\/ui/.test(content);
      expect(hasSharedUiImport, `Shared component file ${file} should not import shared/ui`).toBe(false);
    }
  });

  it('layout directory should exist', () => {
    expect(fs.existsSync(path.join(appRoot, 'layout')), 'src/app/layout must exist').toBe(true);
  });

  it('core/layout directory should not exist', () => {
    expect(fs.existsSync(path.join(appRoot, 'core', 'layout')), 'src/app/core/layout must not exist').toBe(false);
  });

  it('layout should not import features', () => {
    const layoutFiles = getAllTsFiles(path.join(appRoot, 'layout')).filter((f) => f.endsWith('.ts'));

    for (const file of layoutFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const hasFeatureImport = /from\s+['"].*\/features\//.test(content);
      expect(hasFeatureImport, `Layout file ${file} should not import features`).toBe(false);
    }
  });

  it('layout should not import DTOs', () => {
    const layoutFiles = getAllTsFiles(path.join(appRoot, 'layout')).filter((f) => f.endsWith('.ts'));

    for (const file of layoutFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const hasDtoImport = /from\s+['"].*(?:\/dto\/|\.dto['"])/.test(content);
      expect(hasDtoImport, `Layout file ${file} should not import DTOs`).toBe(false);
    }
  });

  it('layout should not import Angular Material', () => {
    const layoutFiles = getAllTsFiles(path.join(appRoot, 'layout')).filter((f) => f.endsWith('.ts'));

    for (const file of layoutFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const hasMaterialImport = /from\s+['"]@angular\/material(?:\/|['"])/.test(content);
      expect(hasMaterialImport, `Layout file ${file} should not import Angular Material`).toBe(false);
    }
  });

  it('layout should only import Angular CDK from @angular/cdk/a11y', () => {
    const layoutFiles = getAllTsFiles(path.join(appRoot, 'layout')).filter((f) => f.endsWith('.ts'));

    for (const file of layoutFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const cdkImports = [...content.matchAll(/from\s+['"](@angular\/cdk(?:\/[^'"]*)?)['"]/g)];

      for (const cdkImport of cdkImports) {
        expect(cdkImport[1], `Layout file ${file} uses a disallowed Angular CDK entrypoint`).toBe('@angular/cdk/a11y');
      }
    }
  });

  it('shared/state should not import Angular Material', () => {
    const sharedStateFiles = getAllTsFiles(path.join(appRoot, 'shared', 'state')).filter((f) => f.endsWith('.ts'));

    for (const file of sharedStateFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const hasMaterialImport = /from\s+['"]@angular\/material(?:\/|['"])/.test(content);
      expect(hasMaterialImport, `Shared state file ${file} should not import Angular Material`).toBe(false);
    }
  });

  const c21FeatureRoots = ['auth', 'dashboard', 'news', 'users', 'seasons'].map((feature) =>
    path.join(appRoot, 'features', feature),
  );

  it('C2.1 features should not import Angular Material', () => {
    for (const featureRoot of c21FeatureRoots) {
      const files = getAllTsFiles(featureRoot).filter((file) => file.endsWith('.ts'));
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        expect(
          /from\s+['"]@angular\/material(?:\/|['"])/.test(content),
          `Feature file ${file} should not import Angular Material`,
        ).toBe(false);
      }
    }
  });

  it('C2.1 features should not import shared/ui', () => {
    for (const featureRoot of c21FeatureRoots) {
      const files = getAllTsFiles(featureRoot).filter((file) => file.endsWith('.ts'));
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        expect(
          /from\s+['"].*\/shared\/ui\//.test(content),
          `Feature file ${file} should not import shared/ui`,
        ).toBe(false);
      }
    }
  });

  it('C2.1 features should not contain Angular Material templates', () => {
    const materialTemplatePattern = /<mat-|\bmat-(?:button|flat-button|stroked-button|raised-button|icon-button)\b/;

    for (const featureRoot of c21FeatureRoots) {
      const files = getAllTsFiles(featureRoot).filter(
        (file) => file.endsWith('.html') || file.endsWith('.ts'),
      );
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        expect(
          materialTemplatePattern.test(content),
          `Feature template ${file} should not use Angular Material elements or directives`,
        ).toBe(false);
      }
    }
  });

  it('C2.1 feature styles should not use Material system tokens', () => {
    for (const featureRoot of c21FeatureRoots) {
      const files = getAllTsFiles(featureRoot).filter((file) => file.endsWith('.scss'));
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        expect(
          content.includes('--mat-sys-'),
          `Feature stylesheet ${file} should not use --mat-sys-* tokens`,
        ).toBe(false);
      }
    }
  });

  it('Seasons presentation should not contain wire-format snake_case fields', () => {
    const presentationRoots = ['components', 'pages'].map((directory) =>
      path.join(appRoot, 'features', 'seasons', directory),
    );
    const wireFieldPattern = /\b(?:cover_image_url|start_at|end_at|created_at|updated_at)\b/;

    for (const presentationRoot of presentationRoots) {
      for (const file of getAllTsFiles(presentationRoot).filter((candidate) => !candidate.endsWith('.spec.ts'))) {
        const content = fs.readFileSync(file, 'utf-8');
        expect(
          wireFieldPattern.test(content),
          `Seasons presentation file ${file} should use domain camelCase fields`,
        ).toBe(false);
      }
    }
  });

  it('Seasons state should not import form or edit models', () => {
    const stateFiles = getAllTsFiles(path.join(appRoot, 'features', 'seasons', 'state')).filter(
      (file) => file.endsWith('.ts'),
    );

    for (const file of stateFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(
        /from\s+['"].*(?:season-edit|seasons-form|form\.mapper)/.test(content),
        `Seasons state file ${file} should only consume domain commands`,
      ).toBe(false);
    }
  });

  it('Seasons presentation should not import wire contracts or DTO models', () => {
    const presentationFiles = ['components', 'pages'].flatMap((directory) =>
      getAllTsFiles(path.join(appRoot, 'features', 'seasons', directory)).filter(
        (file) => file.endsWith('.ts') && !file.endsWith('.spec.ts'),
      ),
    );

    for (const file of presentationFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(
        /from\s+['"].*\/data-access\/.*(?:\.contract|\.models|\/dto\/)/.test(content),
        `Seasons presentation file ${file} should not import wire contracts or DTOs`,
      ).toBe(false);
    }
  });

  it('News presentation should not contain wire-format snake_case fields', () => {
    const presentationRoots = ['components', 'pages'].map((directory) =>
      path.join(appRoot, 'features', 'news', directory),
    );
    const wireFieldPattern = /\b(?:image_url|published_at|created_at|updated_at)\b/;

    for (const presentationRoot of presentationRoots) {
      for (const file of getAllTsFiles(presentationRoot)) {
        const content = fs.readFileSync(file, 'utf-8');
        expect(
          wireFieldPattern.test(content),
          `News presentation file ${file} should use domain camelCase fields`,
        ).toBe(false);
      }
    }
  });

  it('News state should not import form or edit models', () => {
    const stateFiles = getAllTsFiles(path.join(appRoot, 'features', 'news', 'state')).filter(
      (file) => file.endsWith('.ts'),
    );

    for (const file of stateFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(
        /from\s+['"].*(?:news-edit|news-form|form\.mapper)/.test(content),
        `News state file ${file} should only consume domain commands`,
      ).toBe(false);
    }
  });

  it('News presentation should not import wire contracts or DTO models', () => {
    const presentationFiles = ['components', 'pages'].flatMap((directory) =>
      getAllTsFiles(path.join(appRoot, 'features', 'news', directory)).filter(
        (file) => file.endsWith('.ts') && !file.endsWith('.spec.ts'),
      ),
    );

    for (const file of presentationFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      expect(
        /from\s+['"].*\/data-access\/.*(?:\.contract|\.models|\/dto\/)/.test(content),
        `News presentation file ${file} should not import wire contracts or DTOs`,
      ).toBe(false);
    }
  });
});

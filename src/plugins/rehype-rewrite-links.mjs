/**
 * Rehype plugin to rewrite .md links for website
 *
 * This plugin transforms markdown links to absolute paths:
 *   player/specs/ja/index.md: [DisplayObject](./display-object.md)
 *     -> [DisplayObject](/ja/reference/player/display-object/)
 *
 *   framework/specs/ja/view.md: [Routing](./routing.md)
 *     -> [Routing](/ja/reference/framework/routing/)
 *
 * The original .md links are preserved in the source files
 * for compatibility with GitHub, IDEs, and other markdown viewers.
 */

import { visit } from 'unist-util-visit';
import path from 'path';

export function rehypeRewriteLinks() {
  return (tree, file) => {
    // Get the file path to determine context
    const filePath = file.history?.[0] || file.path || '';

    // Determine the base URL based on file location
    let basePath = '';
    let lang;

    // Extract language and context from file path
    // e.g., /path/to/player/specs/ja/display-object.md
    // e.g., /path/to/framework/specs/en/view.md
    const playerMatch = filePath.match(/player\/specs\/(ja|en|cn)\//);
    const frameworkMatch = filePath.match(/framework\/specs\/(ja|en|cn)\//);

    if (playerMatch) {
      lang = playerMatch[1];
      basePath = `/${lang}/reference/player`;
    } else if (frameworkMatch) {
      lang = frameworkMatch[1];
      basePath = `/${lang}/reference/framework`;
    }

    // If we couldn't determine the context, skip transformation
    if (!basePath) {
      return;
    }

    // Get the current file's directory relative to specs folder
    // e.g., for filters/index.md, currentDir would be 'filters'
    const fileDir = path.dirname(filePath);
    const specsDirMatch = fileDir.match(/specs\/(ja|en|cn)(\/.*)?$/);
    const currentSubDir = specsDirMatch?.[2] || '';

    visit(tree, 'element', (node) => {
      // Only process anchor tags
      if (node.tagName !== 'a') return;

      const href = node.properties?.href;
      if (!href || typeof href !== 'string') return;

      // Skip external links, anchors, and already absolute paths
      if (href.startsWith('http://') ||
          href.startsWith('https://') ||
          href.startsWith('#') ||
          href.startsWith('mailto:') ||
          href.startsWith('/')) {
        return;
      }

      // ONLY process links that contain .md extension
      // This prevents transforming non-markdown links
      if (!href.includes('.md')) {
        return;
      }

      // Process relative .md links
      let newHref = href;

      // Handle cross-package links (e.g., from framework to player)
      // ../../player/specs/ja/index.md -> /ja/reference/player/
      // ../../player/specs/ja/movie-clip.md -> /ja/reference/player/movie-clip/
      const crossPackageMatch = newHref.match(/\.\.\/\.\.\/player\/specs\/(ja|en|cn)\/(.+)$/);
      if (crossPackageMatch) {
        const targetLang = crossPackageMatch[1];
        let targetFile = crossPackageMatch[2].replace(/\.md$/, '');
        if (targetFile === 'index') {
          newHref = `/${targetLang}/reference/player/`;
        } else {
          newHref = `/${targetLang}/reference/player/${targetFile}/`;
        }
        node.properties.href = newHref;
        return;
      }

      // Handle cross-package links (from player to framework)
      const crossPackageMatch2 = newHref.match(/\.\.\/\.\.\/framework\/specs\/(ja|en|cn)\/(.+)$/);
      if (crossPackageMatch2) {
        const targetLang = crossPackageMatch2[1];
        let targetFile = crossPackageMatch2[2].replace(/\.md$/, '');
        if (targetFile === 'index') {
          newHref = `/${targetLang}/reference/framework/`;
        } else {
          newHref = `/${targetLang}/reference/framework/${targetFile}/`;
        }
        node.properties.href = newHref;
        return;
      }

      // Remove .md extension
      if (newHref.endsWith('.md')) {
        newHref = newHref.slice(0, -3);
      } else if (newHref.includes('.md#')) {
        newHref = newHref.replace('.md#', '#');
      }

      // Handle index files
      if (newHref.endsWith('/index')) {
        newHref = newHref.slice(0, -6) + '/';
      } else if (newHref === 'index') {
        newHref = basePath + '/';
      }

      // Convert relative path to absolute path
      if (newHref.startsWith('./')) {
        // Same directory: ./display-object -> /ja/reference/player/display-object/
        const relativePath = newHref.slice(2);
        if (relativePath === '') {
          // ./index.md case -> current directory
          newHref = basePath + (currentSubDir ? currentSubDir + '/' : '/');
        } else if (currentSubDir) {
          newHref = `${basePath}${currentSubDir}/${relativePath}`;
        } else {
          newHref = `${basePath}/${relativePath}`;
        }
      } else if (newHref.startsWith('../')) {
        // Parent directory: ../events -> needs path resolution
        const parts = newHref.split('/');
        let upCount = 0;
        while (parts[0] === '..') {
          upCount++;
          parts.shift();
        }
        const targetPath = parts.join('/');

        // Calculate the base based on how many directories up we need to go
        const currentDirParts = currentSubDir.split('/').filter(Boolean);
        const remainingParts = currentDirParts.slice(0, -upCount);

        if (remainingParts.length > 0) {
          newHref = `${basePath}/${remainingParts.join('/')}/${targetPath}`;
        } else {
          newHref = `${basePath}/${targetPath}`;
        }
      } else if (!newHref.startsWith('/')) {
        // Just a filename: display-object -> /ja/reference/player/display-object/
        if (currentSubDir) {
          newHref = `${basePath}${currentSubDir}/${newHref}`;
        } else {
          newHref = `${basePath}/${newHref}`;
        }
      }

      // Ensure trailing slash for directories (not anchors)
      if (!newHref.includes('#') && !newHref.endsWith('/')) {
        newHref += '/';
      }

      // Clean up double slashes (but preserve leading slash)
      newHref = newHref.replace(/([^:])\/+/g, '$1/');

      node.properties.href = newHref;
    });
  };
}

export default rehypeRewriteLinks;

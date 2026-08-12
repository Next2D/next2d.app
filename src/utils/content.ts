/**
 * Markdown本文からmeta description用のテキストを抽出するユーティリティ。
 * frontmatterのdescriptionがあればそれを優先し、なければ本文の最初の段落を使用する。
 */

const MAX_DESCRIPTION_LENGTH = 155;

/**
 * Markdownの装飾記法をプレーンテキストに変換
 */
const stripMarkdown = (text: string): string => {
  return text
    // インラインコード
    .replace(/`([^`]+)`/g, '$1')
    // 画像
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    // リンク（テキスト部分のみ残す）
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // 強調
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // HTMLタグ
    .replace(/<[^>]+>/g, '')
    .trim();
};

/**
 * Markdown本文から最初の段落（見出し・コードブロック・リストを除く）を抽出
 */
const extractFirstParagraph = (body: string): string => {
  let inCodeBlock = false;

  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim();

    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock || !line) {
      continue;
    }

    // 見出し・リスト・引用・テーブル・区切り線はスキップ
    if (/^(#|[-*+]\s|>|\||\d+\.\s|---)/.test(line)) {
      continue;
    }

    const text = stripMarkdown(line);
    if (text) {
      return text;
    }
  }

  return '';
};

/**
 * コンテンツエントリーからmeta descriptionを生成する。
 * 優先順: frontmatterのdescription → 本文の最初の段落 → フォールバック
 */
export const getEntryDescription = (
  entry: { data?: { description?: string }, body?: string },
  fallback: string
): string => {
  const description = entry.data?.description || extractFirstParagraph(entry.body || '') || fallback;

  if (description.length <= MAX_DESCRIPTION_LENGTH) {
    return description;
  }

  return `${description.slice(0, MAX_DESCRIPTION_LENGTH - 1)}…`;
};

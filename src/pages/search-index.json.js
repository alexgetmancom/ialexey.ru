import fs from 'node:fs';
import path from 'node:path';

const dataDir = process.env.DATA_DIR || '/home/deploy/ialexey-feed/data';
const prodFeedJsonPath = path.join(dataDir, 'feed.json');
const localFeedJsonPath = path.resolve('src/data/feed.json');
const habrFallbackPath = path.resolve('src/data/habr.json');
const habrRssUrl = 'https://habr.com/ru/rss/users/ialexeyru/publications/articles/?fl=ru';

function compactText(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateText(value, limit) {
  const text = compactText(value);
  if (text.length <= limit) return text;
  return `${text.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
}

function getFirstSentence(text) {
  const value = String(text || '').trim();
  if (!value) return '';
  const newlineIdx = value.indexOf('\n');
  const match = value.match(/^.*?[.!?](?:\s|\n|$)/s);
  if (match) {
    if (newlineIdx !== -1 && newlineIdx < match[0].length) {
      return value.slice(0, newlineIdx).trim();
    }
    return match[0].trim();
  }
  if (newlineIdx !== -1) {
    return value.slice(0, newlineIdx).trim();
  }
  return value;
}

function getSmartBadge(text) {
  const t = String(text || '').toLowerCase();
  if (t.includes('слив') || t.includes('утек') || t.includes('секрет') || t.includes('leak') || t.includes('эксклюзив')) {
    return 'Сливы';
  }
  if (t.includes('gpt') || t.includes('gemini') || t.includes('claude') || t.includes('anthropic') || t.includes('openai') || t.includes('google') || t.includes('llama') || t.includes('codex')) {
    return 'ИИ-Модели';
  }
  if (t.includes('нейросеть') || t.includes('midjourney') || t.includes('sora') || t.includes('генераци') || t.includes('искусствен') || t.includes('ии-') || t.includes('ai ')) {
    return 'Нейросети';
  }
  return 'Новости';
}

function loadFeedItems() {
  let parsedData = null;
  for (const filePath of [prodFeedJsonPath, localFeedJsonPath]) {
    if (!parsedData && fs.existsSync(filePath)) {
      try {
        parsedData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } catch (e) {
        console.error(`Error reading ${filePath}:`, e);
      }
    }
  }

  if (Array.isArray(parsedData)) return parsedData;
  if (parsedData?.items && Array.isArray(parsedData.items)) return parsedData.items;
  return [];
}

function loadHabrFallback() {
  try {
    return JSON.parse(fs.readFileSync(habrFallbackPath, 'utf-8'));
  } catch (e) {
    console.error('Error reading habr fallback:', e);
    return [];
  }
}

async function fetchHabrArticles() {
  try {
    const res = await fetch(habrRssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) return loadHabrFallback();

    const xml = await res.text();
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const articles = [];
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || itemXml.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = itemXml.match(/<guid[^>]*>([\s\S]*?)<\/guid>/) || itemXml.match(/<link>([\s\S]*?)<\/link>/);
      const dateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || itemXml.match(/<description>([\s\S]*?)<\/description>/);
      if (!titleMatch || !linkMatch) continue;

      const categories = [];
      const catRegex = /<category>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/category>/g;
      let catMatch;
      while ((catMatch = catRegex.exec(itemXml)) !== null) {
        categories.push(compactText(catMatch[1]));
      }

      articles.push({
        title: compactText(titleMatch[1]).replace(/^\[Перевод\]\s*/i, ''),
        url: compactText(linkMatch[1]).split('?')[0],
        date: dateMatch ? new Date(compactText(dateMatch[1])).toISOString() : new Date().toISOString(),
        desc: compactText(descMatch ? descMatch[1] : ''),
        categories: categories.slice(0, 2)
      });
    }

    return articles.length > 0 ? articles : loadHabrFallback();
  } catch {
    return loadHabrFallback();
  }
}

function telegramToSearchItem(item) {
  const messageId = item.message_id || String(item.id || '').split(':').pop();
  const text = compactText(item.text || item.html || '');
  const title = compactText(item.title || getFirstSentence(item.text || text)) || `Новость Telegram ${messageId}`;
  return {
    id: `telegram:${messageId}`,
    type: 'telegram',
    title: truncateText(title, 120),
    excerpt: truncateText(text.replace(title, ''), 180) || truncateText(text, 180),
    url: `/posts/${messageId}/`,
    date: item.date,
    source: 'Telegram',
    category: getSmartBadge(item.text || text),
    image: item.image ? `/${item.image}` : null
  };
}

function habrToSearchItem(item, index) {
  const title = compactText(item.title).replace(/^\[Перевод\]\s*/i, '');
  const desc = compactText(item.desc || item.text || '');
  return {
    id: `habr:${index}`,
    type: 'article',
    title: truncateText(title, 120),
    excerpt: truncateText(desc, 180),
    url: item.url,
    date: item.date,
    source: 'Habr',
    category: item.categories?.[0] || getSmartBadge(`${title} ${desc}`),
    image: item.image || null
  };
}

export async function GET() {
  const telegramItems = loadFeedItems()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(telegramToSearchItem);
  const habrItems = (await fetchHabrArticles())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(habrToSearchItem);

  return new Response(JSON.stringify({
    generatedAt: new Date().toISOString(),
    items: [...telegramItems, ...habrItems]
  }, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300'
    }
  });
}

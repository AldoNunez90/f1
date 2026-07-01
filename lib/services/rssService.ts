import { XMLParser } from 'fast-xml-parser';

export interface NewsItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
}

const LAT_MOTORSPORT_RSS_URL = 'https://lat.motorsport.com/rss/f1/news/';

export function parseLatMotorsportRss(xmlText: string): NewsItem[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    textNodeName: '#text',
    parseAttributeValue: false,
    trimValues: true,
    stopNodes: ['description', 'content:encoded'],
    maxNestedTags: 1000,
  });

  const json = parser.parse(xmlText);
  const items = json?.rss?.channel?.item ?? json?.feed?.entry ?? [];

  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item: any) => ({
      title: item.title?.['#text'] ?? item.title ?? 'Sin título',
      link: item.link?.['#text'] ?? item.link ?? '',
      description: item.description?.['#text'] ?? item.description,
      pubDate: item.pubDate?.['#text'] ?? item.pubDate,
    }))
    .filter((item: NewsItem) => Boolean(item.link));
}

export async function fetchLatMotorsportRssItems(limit = 3): Promise<NewsItem[]> {
  const response = await fetch(LAT_MOTORSPORT_RSS_URL, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Error fetching RSS feed: ${response.status} ${response.statusText}`);
  }

  const xmlText = await response.text();
  return parseLatMotorsportRss(xmlText).slice(0, limit);
}

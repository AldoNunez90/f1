import { XMLParser } from 'fast-xml-parser';

export interface NewsItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  img?: string;
  source?: string;
}

type RssFeedConfig = {
  id: string;
  label: string;
  url: string;
};

const RSS_FEED_CONFIGS: RssFeedConfig[] = [
  {
    id: 'motorsport-lat',
    label: 'Motorsport LAT',
    url: 'https://lat.motorsport.com/rss/f1/news/',
  },
  {
    id: 'marca',
    label: 'Marca',
    url: 'https://objetos.estaticos-marca.com/rss/motor/formula1.xml',
  },
  {
    id: 'car-and-driver',
    label: 'Car and Driver',
    url: 'https://www.caranddriver.com/es/rss/all.xml',
  },
  {
    id: 'f1-technical',
    label: 'F1 Technical',
    url: 'https://www.f1technical.net/rss/news.xml',
  },
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: false,
  trimValues: true,
  stopNodes: ['description', 'content:encoded'],
  maxNestedTags: 1000,
});

function toText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (!value || typeof value !== 'object') {
    return '';
  }

  const candidate = value as { '#text'?: string; '@_url'?: string; '@_href'?: string; url?: string; href?: string };

  if (typeof candidate['#text'] === 'string') {
    return candidate['#text'];
  }

  if (typeof candidate['@_url'] === 'string') {
    return candidate['@_url'];
  }

  if (typeof candidate['@_href'] === 'string') {
    return candidate['@_href'];
  }

  if (typeof candidate.url === 'string') {
    return candidate.url;
  }

  if (typeof candidate.href === 'string') {
    return candidate.href;
  }

  return '';
}

function stripHtml(text?: string): string {
  return text?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';
}

function normalizeRssDate(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.replace(/\s+\+\d{4}$/, '').trim();
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function extractImageFromItem(item: Record<string, unknown>): string | undefined {
  const candidateSources = [
    item['media:content'],
    item['media:thumbnail'],
    item['media:group'],
    item.enclosure,
    item.image,
    item.thumbnail,
    item['content:encoded'],
  ];

  for (const candidate of candidateSources) {
    if (!candidate) {
      continue;
    }

    if (typeof candidate === 'object' && !Array.isArray(candidate)) {
      const nested = candidate as Record<string, unknown>;

      const directUrl =
        toText(nested['@_url']) ||
        toText(nested['@_href']) ||
        toText(nested.url) ||
        toText(nested.href);

      if (directUrl) {
        return directUrl;
      }

      const nestedGroup = nested['media:thumbnail'] ?? nested['media:content'];
      const groupUrl = nestedGroup ? toText(nestedGroup) : '';
      if (groupUrl) {
        return groupUrl;
      }
    }

    const directText = toText(candidate);
    if (directText) {
      return directText;
    }
  }

  return undefined;
}

function parseGenericRss(xmlText: string, sourceName: string): NewsItem[] {
  const json = parser.parse(xmlText);
  const items = json?.rss?.channel?.item ?? json?.feed?.entry ?? [];

  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item: Record<string, unknown>) => {
      const title = stripHtml(toText(item.title)) || 'Sin título';
      const link = toText(item.link) || toText(item.guid) || '';
      const description = stripHtml(toText(item.description));
      const pubDate = normalizeRssDate(toText(item.pubDate) || toText(item.published) || toText(item.updated));
      const img = extractImageFromItem(item);

      return {
        title,
        link,
        description: description || undefined,
        pubDate,
        img,
        source: sourceName,
      };
    })
    .filter((item: NewsItem) =>{
      if(!item.link) return false;
      
      if(sourceName === 'Car and Driver' && !item.link.includes('formula-1')){
        return false;
      };
      return true;
    } )
  }
  
  function sortNewsItems(items: NewsItem[]): NewsItem[] {
    const deduped = new Map<string, NewsItem>();
    
  for (const item of [...items].sort((a, b) => {
    const dateA = Date.parse(a.pubDate ?? '');
    const dateB = Date.parse(b.pubDate ?? '');

    if (Number.isNaN(dateA) && Number.isNaN(dateB)) {
      return 0;
    }

    if (Number.isNaN(dateA)) {
      return 1;
    }

    if (Number.isNaN(dateB)) {
      return -1;
    }

    return dateB - dateA;
  })) {
    if (!item.link || deduped.has(item.link)) {
      continue;
    }

    deduped.set(item.link, item);
  }

  return Array.from(deduped.values());
}

export async function fetchLatestNewsItems(limit = 20): Promise<NewsItem[]> {
  const settled = await Promise.allSettled(
    RSS_FEED_CONFIGS.map(async (feed) => {
      const response = await fetch(feed.url, {
        next: { revalidate: 300 },
        headers: {
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
          'User-Agent': 'Mozilla/5.0 (compatible; F1Hub/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching ${feed.label}: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('xml') && !contentType.includes('rss') && !contentType.includes('text/plain')) {
        throw new Error(`Unexpected content type for ${feed.label}: ${contentType || 'unknown'}`);
      }

      const xmlText = await response.text();
      return parseGenericRss(xmlText, feed.label);
    })
  );

  const items = settled.flatMap((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }

    return [];
  });

  return sortNewsItems(items).slice(0, limit);
}

export async function fetchLatMotorsportRssItems(limit = 3): Promise<NewsItem[]> {
  return fetchLatestNewsItems(limit);
}

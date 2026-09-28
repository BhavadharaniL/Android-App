const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const BaseProvider = require('./BaseProvider');

class NewsProvider extends BaseProvider {
  constructor() {
    super('Live Technology News', 'OFFICIAL_API');
    this.apiKey = process.env.NEWS_API_KEY;
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      processEntities: false
    });
    this.categories = [
      'AI',
      'Cloud Computing',
      'Cybersecurity',
      'Software Engineering',
      'Data Science',
      'Internships',
      'Jobs',
      'Technology',
      'Startups'
    ];
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  async fetch(options = {}) {
    const { category = 'Technology' } = options;
    const articles = [];

    // 1. Try NewsAPI if key is available
    if (this.isConfigured()) {
      try {
        const queryMap = {
          'AI': 'artificial intelligence OR LLM OR machine learning',
          'Cloud Computing': 'AWS OR azure OR "google cloud" OR cloud computing',
          'Cybersecurity': 'cybersecurity OR infosec OR malware OR "data breach"',
          'Software Engineering': 'software engineering OR programming OR developer',
          'Data Science': 'data science OR analytics OR python',
          'Internships': 'tech internship OR graduate jobs',
          'Jobs': 'tech hiring OR software developer jobs',
          'Startups': 'tech startup OR venture funding',
          'Technology': 'technology news OR open source'
        };

        const q = queryMap[category] || 'technology';
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=publishedAt&pageSize=15&language=en&apiKey=${this.apiKey}`;
        
        const response = await axios.get(url, { timeout: 8000 });
        if (response.data && response.data.articles) {
          for (const item of response.data.articles) {
            if (item.title && item.url && item.title !== '[Removed]') {
              articles.push({
                title: item.title,
                description: item.description || '',
                content: item.content || item.description || '',
                imageUrl: item.urlToImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60',
                sourceName: item.source?.name || 'Tech News',
                url: item.url,
                category: category,
                publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
                retrievedAt: new Date(),
                isLive: true
              });
            }
          }
        }
      } catch (err) {
        console.warn(`[NewsProvider] NewsAPI request failed (${err.message}). Using live RSS fallback...`);
      }
    }

    // 2. If NewsAPI is empty or unconfigured, fetch live tech RSS feeds (e.g. Hacker News RSS, Dev.to, TechCrunch)
    if (articles.length === 0) {
      try {
        const rssUrls = [
          { url: 'https://hnrss.org/frontpage', source: 'Hacker News' },
          { url: 'https://dev.to/feed', source: 'Dev.to Community' }
        ];

        for (const feed of rssUrls) {
          try {
            const resp = await axios.get(feed.url, { timeout: 7000 });
            if (resp.data && typeof resp.data === 'string') {
              const parsed = this.xmlParser.parse(resp.data);
              const items = parsed.rss?.channel?.item || [];
              const list = Array.isArray(items) ? items.slice(0, 8) : [items];
              for (const it of list) {
                if (it.title && it.link) {
                  articles.push({
                    title: it.title,
                    description: (it.description || '').replace(/<[^>]*>?/gm, '').slice(0, 300),
                    content: (it.description || '').replace(/<[^>]*>?/gm, ''),
                    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60',
                    sourceName: feed.source,
                    url: it.link,
                    category: category,
                    publishedAt: it.pubDate ? new Date(it.pubDate) : new Date(),
                    retrievedAt: new Date(),
                    isLive: true
                  });
                }
              }
            }
          } catch (feedErr) {
            console.warn(`[NewsProvider] Live RSS feed ${feed.source} fetch error: ${feedErr.message}`);
          }
        }
      } catch (rssErr) {
        console.error(`[NewsProvider] All live news channels failed: ${rssErr.message}`);
      }
    }

    return articles;
  }
}

module.exports = NewsProvider;

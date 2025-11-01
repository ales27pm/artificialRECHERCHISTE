import { searchService } from "../api/search-service";

export async function testSearchFixes() {
  console.log("🧪 Testing search service fixes...");

  const testQueries = ["business intelligence", "web scraping", "research tools", "Grok"];

  for (const query of testQueries) {
    console.log(`\n🔍 Testing query: "${query}"`);

    try {
      const results = await searchService.search({
        query,
        filters: { contentType: "all", depth: "deep", language: "en", sources: [], domains: [], excludeDomains: [] },
        maxResults: 5,
      });

      console.log(`✅ Query "${query}" succeeded: ${results.length} results`);

      if (results.length > 0) {
        console.log(`📋 First result: ${results[0].title}`);
      }
    } catch (error) {
      console.error(`❌ Query "${query}" failed:`, error.message);
    }
  }

  // Test API status
  const apiStatus = searchService.getApiStatus();
  console.log("\n📊 API Status:", {
    workingApis: apiStatus.summary.workingApis,
    failedApis: apiStatus.summary.failedApis,
  });

  console.log("🧪 Search service test completed");
}

import { searchService } from "../api/search-service";

/**
 * Simple test function to validate search functionality
 * This can be called from the app to test search without AI
 */
export async function testSearch() {
  try {
    console.log("🔍 Testing search functionality...");

    // Check API status first
    const apiStatus = searchService.getApiStatus();
    console.log("🤖 API Status:", apiStatus);

    const testQueries = ["data mining", "business intelligence", "web scraping", "research tools"];

    for (const query of testQueries) {
      console.log(`Testing query: "${query}"`);

      const results = await searchService.search({
        query,
        maxResults: 3,
      });

      console.log(`✅ Query "${query}" returned ${results.length} results`);

      // Validate result structure
      if (Array.isArray(results) && results.length > 0) {
        const firstResult = results[0];
        const requiredFields = ["id", "title", "url", "snippet", "source"];

        const missingFields = requiredFields.filter((field) => !firstResult[field]);
        if (missingFields.length === 0) {
          console.log(`✅ Result structure is valid for "${query}"`);
        } else {
          console.error(`❌ Missing fields in result for "${query}":`, missingFields);
        }
      } else {
        console.error(`❌ Invalid results for "${query}":`, results);
      }
    }

    console.log("🎉 Search test completed");
    return true;
  } catch (error) {
    console.error("❌ Search test failed:", error);
    return false;
  }
}

/**
 * Quick validation function for search results
 */
export function validateSearchResults(results: any[]): boolean {
  if (!Array.isArray(results)) {
    console.error("Results is not an array:", typeof results);
    return false;
  }

  if (results.length === 0) {
    console.warn("No results found");
    return true; // Empty results are valid
  }

  const requiredFields = ["id", "title", "url", "snippet", "source", "timestamp"];

  for (let i = 0; i < Math.min(results.length, 3); i++) {
    const result = results[i];
    const missingFields = requiredFields.filter((field) => !result[field]);

    if (missingFields.length > 0) {
      console.error(`Result ${i} missing fields:`, missingFields, result);
      return false;
    }
  }

  console.log(`✅ All ${results.length} results have valid structure`);
  return true;
}

/**
 * Utility functions for API communication
 */

// Base URL for the API - can be configured based on environment
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api";

/**
 * Fetch data from the API with proper error handling
 * @param endpoint - API endpoint to fetch from (without leading slash)
 * @param options - Additional fetch options
 * @returns Promise with the parsed JSON response
 */
export async function fetchFromApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/${endpoint}`;

  console.log(`Fetching from API: ${url}`);

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    // Get error details from response if available
    let errorMessage: string;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || `API error: ${response.status}`;
    } catch (e) {
      errorMessage = `API error: ${response.status}`;
    }

    // Create error object with status code for better error handling
    const error = new Error(errorMessage) as Error & { statusCode?: number };
    error.statusCode = response.status;
    throw error;
  }

  return response.json();
}

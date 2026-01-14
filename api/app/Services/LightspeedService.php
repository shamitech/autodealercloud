<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LightspeedService
{
    private string $apiKey;
    private string $apiSecret;
    private string $accountId;
    private string $baseUrl = 'https://api.lightspeedapp.com/API/V3';

    /**
     * Initialize Lightspeed service with credentials
     */
    public function __construct(string $apiKey, string $apiSecret, string $accountId)
    {
        $this->apiKey = $apiKey;
        $this->apiSecret = $apiSecret;
        $this->accountId = $accountId;
    }

    /**
     * Make authenticated request to Lightspeed API
     */
    private function request(string $method, string $endpoint, array $data = [])
    {
        try {
            $url = "{$this->baseUrl}/{$this->accountId}/{$endpoint}.json";

            $response = Http::withBasicAuth($this->apiKey, $this->apiSecret)
                ->timeout(30)
                ->retry(2, 100)
                ->$method($url, $data);

            if ($response->failed()) {
                Log::error('Lightspeed API Error', [
                    'endpoint' => $endpoint,
                    'status' => $response->status(),
                    'response' => $response->json(),
                ]);
                return null;
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error('Lightspeed Service Error', [
                'endpoint' => $endpoint,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Get all items (products) from Lightspeed
     */
    public function getItems(int $limit = 100, int $offset = 0): ?array
    {
        return $this->request('get', 'Item', [
            'limit' => $limit,
            'offset' => $offset,
        ]);
    }

    /**
     * Get a specific item by ID
     */
    public function getItem(string $itemId): ?array
    {
        return $this->request('get', "Item/{$itemId}");
    }

    /**
     * Get item pricing
     */
    public function getItemPricing(string $itemId): ?array
    {
        return $this->request('get', "Item/{$itemId}/Pricing");
    }

    /**
     * Get item quantities (inventory)
     */
    public function getItemQuantities(string $itemId): ?array
    {
        return $this->request('get', "Item/{$itemId}/Quantities");
    }

    /**
     * Get all categories
     */
    public function getCategories(int $limit = 100, int $offset = 0): ?array
    {
        return $this->request('get', 'Category', [
            'limit' => $limit,
            'offset' => $offset,
        ]);
    }

    /**
     * Get all manufacturers
     */
    public function getManufacturers(int $limit = 100, int $offset = 0): ?array
    {
        return $this->request('get', 'Manufacturer', [
            'limit' => $limit,
            'offset' => $offset,
        ]);
    }

    /**
     * Test API connection
     */
    public function testConnection(): bool
    {
        $response = $this->request('get', 'Item', ['limit' => 1]);
        return $response !== null;
    }

    /**
     * Get paginated items with cursor support
     */
    public function getItemsWithCursor(string $cursor = null): ?array
    {
        $params = [];
        if ($cursor) {
            $params['cursor'] = $cursor;
        }

        return $this->request('get', 'Item', $params);
    }
}

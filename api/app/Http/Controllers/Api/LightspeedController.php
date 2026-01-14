<?php

namespace App\Http\Controllers\Api;

use App\Models\Product;
use App\Models\User;
use App\Services\LightspeedService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class LightspeedController extends Controller
{
    /**
     * Connect Lightspeed account
     */
    public function connect(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'api_key' => 'required|string',
            'api_secret' => 'required|string',
            'account_id' => 'required|string',
        ]);

        // Test connection
        $service = new LightspeedService(
            $validated['api_key'],
            $validated['api_secret'],
            $validated['account_id']
        );

        if (!$service->testConnection()) {
            return response()->json([
                'error' => 'Failed to connect to Lightspeed API. Check your credentials.',
            ], 400);
        }

        // Save credentials
        $user->update([
            'lightspeed_api_key' => $validated['api_key'],
            'lightspeed_api_secret' => $validated['api_secret'],
            'lightspeed_account_id' => $validated['account_id'],
            'lightspeed_connected_at' => now(),
        ]);

        return response()->json([
            'message' => 'Lightspeed account connected successfully',
            'user' => $user,
        ]);
    }

    /**
     * Check Lightspeed connection status
     */
    public function status(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'connected' => !is_null($user->lightspeed_connected_at),
            'connected_at' => $user->lightspeed_connected_at,
            'account_id' => $user->lightspeed_account_id ? substr($user->lightspeed_account_id, 0, 10) . '...' : null,
        ]);
    }

    /**
     * Sync products from Lightspeed
     */
    public function syncProducts(Request $request)
    {
        $user = $request->user();
        $tenant = $request->attributes->get('tenant');

        if (!$user->lightspeed_api_key) {
            return response()->json([
                'error' => 'Lightspeed not connected. Please connect your account first.',
            ], 400);
        }

        $service = new LightspeedService(
            $user->lightspeed_api_key,
            $user->lightspeed_api_secret,
            $user->lightspeed_account_id
        );

        $synced = 0;
        $offset = 0;
        $limit = 100;

        try {
            while (true) {
                $response = $service->getItems($limit, $offset);

                if (!$response || empty($response['Item'])) {
                    break;
                }

                foreach ($response['Item'] as $item) {
                    $price = $item['Price'][0]['amount'] ?? 0;
                    $cost = $item['Cost'][0]['amount'] ?? 0;

                    Product::updateOrCreate(
                        [
                            'tenant_id' => $tenant->id,
                            'lightspeed_id' => $item['itemID'],
                        ],
                        [
                            'name' => $item['description'] ?? 'Unknown',
                            'sku' => $item['itemNumber'] ?? null,
                            'description' => $item['longDescription'] ?? null,
                            'category' => $item['categoryID'] ?? null,
                            'manufacturer' => $item['manufacturerID'] ?? null,
                            'price' => $price,
                            'cost' => $cost,
                            'quantity' => $item['Quantities'][0]['quantity'] ?? 0,
                            'lightspeed_data' => $item,
                            'last_synced_at' => now(),
                        ]
                    );

                    $synced++;
                }

                // Check if there are more items
                if (count($response['Item']) < $limit) {
                    break;
                }

                $offset += $limit;
            }

            return response()->json([
                'message' => "Synced $synced products successfully",
                'synced_count' => $synced,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to sync products: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all synced products for current tenant
     */
    public function products(Request $request)
    {
        $tenant = $request->attributes->get('tenant');

        $products = Product::where('tenant_id', $tenant->id)
            ->orderBy('name')
            ->paginate(20);

        return response()->json([
            'data' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'total_pages' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    /**
     * Get a specific product
     */
    public function show(Request $request, Product $product)
    {
        $tenant = $request->attributes->get('tenant');

        if ($product->tenant_id !== $tenant->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'data' => $product,
        ]);
    }

    /**
     * Disconnect Lightspeed
     */
    public function disconnect(Request $request)
    {
        $user = $request->user();

        $user->update([
            'lightspeed_api_key' => null,
            'lightspeed_api_secret' => null,
            'lightspeed_account_id' => null,
            'lightspeed_connected_at' => null,
        ]);

        return response()->json([
            'message' => 'Lightspeed disconnected',
        ]);
    }
}

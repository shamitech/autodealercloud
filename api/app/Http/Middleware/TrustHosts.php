<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustHosts as Middleware;

class TrustHosts extends Middleware
{
    /**
     * Get the host patterns that should be trusted.
     *
     * @return array<int, string|null>
     */
    public function hosts()
    {
        return [
            'api.autodealercloud.com',
            'dashboard.autodealercloud.com',
            'dealer1.autodealercloud.com',
            'dealer2.autodealercloud.com',
            'dealer3.autodealercloud.com',
            'localhost:8000',
            'localhost:8001',
        ];
    }
}

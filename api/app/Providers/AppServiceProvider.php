<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Mail\SendgridTransport;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // Register SendGrid mailer
        \Illuminate\Support\Facades\Mail::extend('sendgrid', function ($app) {
            $transport = new SendgridTransport(env('SENDGRID_API_KEY'));
            
            return new class($transport) {
                private $transport;
                
                public function __construct($transport)
                {
                    $this->transport = $transport;
                }
                
                public function send($message)
                {
                    return $this->transport->send($message);
                }
            };
        });
    }
}

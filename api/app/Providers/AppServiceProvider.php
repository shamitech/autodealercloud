<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Mail;

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
        // Register SendGrid mailer using factory
        Mail::extend('sendgrid', function () {
            return new \Symfony\Component\Mailer\Mailer(
                new \Symfony\Component\Mailer\Transport\SendgridTransport(
                    new \Symfony\Component\HttpClient\HttpClient(),
                    env('SENDGRID_API_KEY')
                )
            );
        });
    }
}

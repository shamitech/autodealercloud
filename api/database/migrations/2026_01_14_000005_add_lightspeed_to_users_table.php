<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Lightspeed credentials
            $table->string('lightspeed_api_key')->nullable()->after('bio');
            $table->string('lightspeed_api_secret')->nullable()->after('lightspeed_api_key');
            $table->string('lightspeed_account_id')->nullable()->after('lightspeed_api_secret');
            $table->timestamp('lightspeed_connected_at')->nullable()->after('lightspeed_account_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'lightspeed_api_key',
                'lightspeed_api_secret',
                'lightspeed_account_id',
                'lightspeed_connected_at',
            ]);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // For PostgreSQL, we need to drop and recreate the column
        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE users DROP CONSTRAINT users_role_check");
            DB::statement("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(255)");
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('superadmin', 'admin', 'editor', 'viewer', 'member'))");
        }
        
        // For other databases, drop and recreate
        if (DB::connection()->getDriverName() !== 'pgsql') {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('role');
            });
            
            Schema::table('users', function (Blueprint $table) {
                $table->enum('role', ['superadmin', 'admin', 'editor', 'viewer', 'member'])->default('member')->after('email');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            // PostgreSQL doesn't support removing enum values easily
            // This is a limitation - just document it
        }
    }
};

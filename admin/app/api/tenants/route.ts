import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const TENANTS_FILE = join(process.cwd(), 'lib', 'tenants.json');

function readTenants() {
  try {
    const data = readFileSync(TENANTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeTenants(tenants: any[]) {
  writeFileSync(TENANTS_FILE, JSON.stringify(tenants, null, 2));
}

export async function GET() {
  try {
    const tenants = readTenants();
    return NextResponse.json(tenants, { status: 200 });
  } catch (error) {
    console.error('Error reading tenants:', error);
    return NextResponse.json(
      { error: 'Failed to read tenants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      businessName,
      tradeType,
      primaryContactName,
      primaryContactEmail,
      primaryContactPhone,
      businessSlug,
      cmsRootPassword,
      serviceType,
    } = body;

    // Validate required fields
    if (
      !businessName ||
      !tradeType ||
      !primaryContactName ||
      !primaryContactEmail ||
      !primaryContactPhone ||
      !businessSlug ||
      !cmsRootPassword ||
      !serviceType
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const tenants = readTenants();

    // Check if slug already exists
    if (tenants.some((t: any) => t.businessSlug === businessSlug)) {
      return NextResponse.json(
        { error: 'Business slug already exists' },
        { status: 400 }
      );
    }

    // Create new tenant
    const newTenant = {
      id: Date.now().toString(),
      businessName,
      tradeType,
      primaryContactName,
      primaryContactEmail,
      primaryContactPhone,
      businessSlug,
      cmsRootPassword,
      serviceType,
      createdAt: new Date().toISOString(),
    };

    tenants.push(newTenant);
    writeTenants(tenants);

    return NextResponse.json(newTenant, { status: 201 });
  } catch (error) {
    console.error('Error creating tenant:', error);
    return NextResponse.json(
      { error: 'Failed to create tenant' },
      { status: 500 }
    );
  }
}

import axios, { AxiosInstance } from 'axios';

export interface LightspeedVehicle {
  ID: string;
  Year: number;
  Make: string;
  Model: string;
  Trim: string;
  VIN: string;
  Price: number;
  Mileage: number;
  ExteriorColor: string;
  InteriorColor: string;
  ImageURLs: string[];
  IsAvailable: boolean;
}

export interface DMSCredentials {
  api_key: string;
  api_secret: string;
}

export class LightspeedService {
  private client: AxiosInstance;
  private credentials: DMSCredentials;

  constructor(credentials: DMSCredentials) {
    this.credentials = credentials;
    this.client = axios.create({
      baseURL: 'https://api.lightspeedpro.com/v1',
      auth: {
        username: credentials.api_key,
        password: credentials.api_secret,
      },
    });
  }

  async getVehicles(): Promise<LightspeedVehicle[]> {
    try {
      const response = await this.client.get('/inventory');
      return response.data.vehicles || [];
    } catch (error) {
      console.error('Failed to fetch vehicles from Lightspeed:', error);
      throw new Error('Failed to fetch vehicle inventory from Lightspeed');
    }
  }

  async getVehicleById(vehicleId: string): Promise<LightspeedVehicle | null> {
    try {
      const response = await this.client.get(`/inventory/${vehicleId}`);
      return response.data || null;
    } catch (error) {
      console.error(`Failed to fetch vehicle ${vehicleId}:`, error);
      return null;
    }
  }

  async syncVehicles(tenantId: string, storeSchema: string): Promise<number> {
    try {
      const vehicles = await this.getVehicles();
      // This would sync vehicles to tenant's database
      // Implementation depends on actual Lightspeed API response format
      console.log(`Syncing ${vehicles.length} vehicles for tenant ${tenantId}`);
      return vehicles.length;
    } catch (error) {
      console.error('Failed to sync vehicles:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/inventory?limit=1');
      return true;
    } catch (error) {
      console.error('Lightspeed connection test failed:', error);
      return false;
    }
  }
}

export default LightspeedService;

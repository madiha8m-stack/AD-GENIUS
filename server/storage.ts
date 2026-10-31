import { db } from "./db";
import { campaigns, type Campaign, type InsertCampaign } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  saveCampaign(campaign: InsertCampaign): Promise<Campaign>;
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  deleteCampaign(id: string): Promise<void>;
}

export class DbStorage implements IStorage {
  async saveCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [saved] = await db.insert(campaigns).values(campaign).returning();
    return saved;
  }

  async getCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async deleteCampaign(id: string): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }
}

export const storage = new DbStorage();

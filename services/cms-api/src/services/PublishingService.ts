import axios from 'axios';

export interface PublishSnapshot {
  pageId: string;
  tenantId: string;
  title: string;
  slug: string;
  description: string;
  content: any;
  publishedAt: Date;
  expiresAt?: Date;
}

const PUBLISHER_API_URL = process.env.PUBLISHER_API_URL || 'http://publisher-api:3012';

export async function publishPageToPublisher(
  pageId: string,
  tenantId: string,
  pageData: any
): Promise<void> {
  try {
    // Create snapshot of page content for publisher database
    const snapshot: PublishSnapshot = {
      pageId,
      tenantId,
      title: pageData.title,
      slug: pageData.slug,
      description: pageData.description,
      content: pageData.content,
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    };

    // POST to publisher API to store snapshot
    await axios.post(`${PUBLISHER_API_URL}/internal/publish-page`, snapshot, {
      headers: {
        'X-Internal-Secret': process.env.INTERNAL_SECRET || 'internal-secret',
      },
    });

    console.log(`✓ Page ${pageId} published to publisher database`);
  } catch (error) {
    console.error(`Failed to publish page ${pageId}:`, error);
    throw new Error('Failed to publish page to publisher database');
  }
}

export async function unpublishPageFromPublisher(pageId: string): Promise<void> {
  try {
    await axios.delete(`${PUBLISHER_API_URL}/internal/publish-page/${pageId}`, {
      headers: {
        'X-Internal-Secret': process.env.INTERNAL_SECRET || 'internal-secret',
      },
    });

    console.log(`✓ Page ${pageId} removed from publisher database`);
  } catch (error) {
    console.error(`Failed to unpublish page ${pageId}:`, error);
    throw new Error('Failed to unpublish page');
  }
}

export default {
  publishPageToPublisher,
  unpublishPageFromPublisher,
};

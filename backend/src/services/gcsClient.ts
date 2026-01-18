import { Storage } from '@google-cloud/storage';

/**
 * GCS Client Factory
 * 
 * Supports multiple authentication methods:
 * 1. GOOGLE_APPLICATION_CREDENTIALS - path to JSON file (local dev)
 * 2. GCP_CREDENTIALS_JSON - base64 encoded JSON (Railway/cloud)
 * 3. GCP_PROJECT_ID + GCP_CLIENT_EMAIL + GCP_PRIVATE_KEY - individual vars
 */

let storage: Storage | null = null;
let bucketName: string | undefined = undefined;

export function getGCSClient(): { storage: Storage; bucketName: string } {
    if (storage && bucketName) {
        return { storage, bucketName };
    }

    bucketName = process.env.GCS_BUCKET_NAME;
    if (!bucketName) {
        throw new Error('GCS_BUCKET_NAME environment variable is required');
    }

    // Method 1: Base64 encoded JSON (for Railway/cloud deployment)
    if (process.env.GCP_CREDENTIALS_JSON) {
        console.log('[GCS] Using base64-encoded credentials');
        try {
            const credentialsJson = Buffer.from(
                process.env.GCP_CREDENTIALS_JSON,
                'base64'
            ).toString('utf-8');
            const credentials = JSON.parse(credentialsJson);

            storage = new Storage({
                projectId: credentials.project_id,
                credentials,
            });
            return { storage, bucketName };
        } catch (err) {
            console.error('[GCS] Failed to parse GCP_CREDENTIALS_JSON:', err);
            throw new Error('Invalid GCP_CREDENTIALS_JSON - must be base64-encoded JSON');
        }
    }

    // Method 2: Individual environment variables
    if (process.env.GCP_PROJECT_ID && process.env.GCP_CLIENT_EMAIL && process.env.GCP_PRIVATE_KEY) {
        console.log('[GCS] Using individual credential env vars');
        storage = new Storage({
            projectId: process.env.GCP_PROJECT_ID,
            credentials: {
                client_email: process.env.GCP_CLIENT_EMAIL,
                // Private key comes with escaped newlines, need to unescape
                private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
        });
        return { storage, bucketName };
    }

    // Method 3: Key file path (local development)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.log('[GCS] Using keyFilename from GOOGLE_APPLICATION_CREDENTIALS');
        storage = new Storage({
            keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        });
        return { storage, bucketName };
    }

    throw new Error(
        'GCS credentials not configured. Set one of: ' +
        'GCP_CREDENTIALS_JSON (base64), ' +
        'GCP_PROJECT_ID+GCP_CLIENT_EMAIL+GCP_PRIVATE_KEY, or ' +
        'GOOGLE_APPLICATION_CREDENTIALS (file path)'
    );
}

export function getGCSBucket() {
    const { storage, bucketName } = getGCSClient();
    return storage.bucket(bucketName);
}

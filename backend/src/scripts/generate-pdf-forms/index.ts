import * as path from 'path';
import * as fs from 'fs';
import { GenerationResult } from './types';

// Import all template generators
import { generateMutualNDA } from './templates/legal/mutual-nda';
import { generateIPAssignment } from './templates/legal/ip-assignment';
import { generateEmploymentContract } from './templates/employment/employment-contract';
import { generateContractorAgreement } from './templates/employment/contractor-agreement';
import { generatePersonalLoan } from './templates/finance/personal-loan';
import { generatePaymentPlan } from './templates/finance/payment-plan';
import { generateBusinessLicense } from './templates/government/business-license';
import { generateVendorRegistration } from './templates/government/vendor-registration';
import { generateMedicalConsent } from './templates/healthcare/medical-consent';
import { generatePatientRelease } from './templates/healthcare/patient-release';
import { generateSponsorshipUndertaking } from './templates/immigration/sponsorship-undertaking';
import { generateDocumentChecklist } from './templates/immigration/document-checklist';

interface DocumentDefinition {
  generator: (config: { outputPath: string }) => Promise<void>;
  category: string;
  filename: string;
}

const DOCUMENTS: DocumentDefinition[] = [
  // Legal (Priority for demo)
  { generator: generateMutualNDA, category: 'Legal', filename: 'Mutual-NDA.pdf' },
  { generator: generateIPAssignment, category: 'Legal', filename: 'IP-Assignment-Agreement.pdf' },
  // Employment
  { generator: generateEmploymentContract, category: 'Employment', filename: 'Employment-Contract.pdf' },
  { generator: generateContractorAgreement, category: 'Employment', filename: 'Independent-Contractor-Agreement.pdf' },
  // Finance
  { generator: generatePersonalLoan, category: 'Finance', filename: 'Personal-Loan-Agreement.pdf' },
  { generator: generatePaymentPlan, category: 'Finance', filename: 'Payment-Plan-Agreement.pdf' },
  // Government
  { generator: generateBusinessLicense, category: 'Government', filename: 'Business-License-Application.pdf' },
  { generator: generateVendorRegistration, category: 'Government', filename: 'Vendor-Registration-Form.pdf' },
  // Healthcare
  { generator: generateMedicalConsent, category: 'Healthcare', filename: 'Medical-Consent-Form.pdf' },
  { generator: generatePatientRelease, category: 'Healthcare', filename: 'Patient-Information-Release.pdf' },
  // Immigration
  { generator: generateSponsorshipUndertaking, category: 'Immigration', filename: 'Sponsorship-Undertaking.pdf' },
  { generator: generateDocumentChecklist, category: 'Immigration', filename: 'Supporting-Document-Checklist.pdf' },
];

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const categoryFilter = args.find(a => a.startsWith('--category='))?.split('=')[1];
  const dryRun = args.includes('--dry-run');

  // Get the base directory for output
  const baseDir = path.join(__dirname, '../../assets/forms');

  // Ensure all category directories exist
  const categories = ['Legal', 'Employment', 'Finance', 'Government', 'Healthcare', 'Immigration'];
  for (const cat of categories) {
    const catDir = path.join(baseDir, cat);
    if (!fs.existsSync(catDir)) {
      fs.mkdirSync(catDir, { recursive: true });
      console.log(`Created directory: ${catDir}`);
    }
  }

  const results: GenerationResult[] = [];
  const documentsToGenerate = categoryFilter
    ? DOCUMENTS.filter(d => d.category.toLowerCase() === categoryFilter.toLowerCase())
    : DOCUMENTS;

  console.log('');
  console.log('='.repeat(60));
  console.log('FormBridge PDF Generator');
  console.log('='.repeat(60));
  console.log(`Generating ${documentsToGenerate.length} PDF documents...`);
  console.log('');

  for (const doc of documentsToGenerate) {
    const outputPath = path.join(baseDir, doc.category, doc.filename);

    if (dryRun) {
      console.log(`[DRY RUN] Would generate: ${doc.category}/${doc.filename}`);
      continue;
    }

    try {
      process.stdout.write(`Generating: ${doc.category}/${doc.filename}... `);
      await doc.generator({ outputPath });

      // Verify file was created and get its size
      const stats = fs.statSync(outputPath);
      const sizeKB = Math.round(stats.size / 1024);

      results.push({
        document: doc.filename,
        category: doc.category,
        path: outputPath,
        success: true,
      });
      console.log(`OK (${sizeKB} KB)`);
    } catch (error) {
      results.push({
        document: doc.filename,
        category: doc.category,
        path: outputPath,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
      console.log(`FAILED`);
      console.error(`  Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Summary
  console.log('');
  console.log('='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Total: ${results.length} | Success: ${successful} | Failed: ${failed}`);

  if (successful > 0) {
    console.log('');
    console.log('Successfully generated:');
    results.filter(r => r.success).forEach(r => {
      console.log(`  [OK] ${r.category}/${r.document}`);
    });
  }

  if (failed > 0) {
    console.log('');
    console.log('Failed:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  [FAIL] ${r.category}/${r.document}: ${r.error}`);
    });
    process.exit(1);
  }

  console.log('');
  console.log(`Output directory: ${baseDir}`);
  console.log('');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

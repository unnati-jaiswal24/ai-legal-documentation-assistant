// Seeds one freelance agreement template: 3 sources, 7 clauses, 9 fields.
// NOTE: all legal text below is PLACEHOLDER and must be replaced with
// advocate-reviewed content before any real use.
//
// Run with:  npx prisma db seed
// Needs in package.json:  "type": "module"  and  "prisma": { "seed": "node prisma/seed.js" }
// Seed using the OWNER database URL (RLS does not affect the owner).

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  if ((await prisma.documentType.count()) > 0) {
    console.log("Seed data already present, skipping.");
    return;
  }

  // 1. document type
  const docType = await prisma.documentType.create({
    data: {
      name: "Freelance Service Agreement",
      description: "Agreement between a freelancer and a client for services",
    },
  });

  // 2. legal sources (embeddings are filled later by the AI service)
  const sourceDefs = [
    { actName: "Indian Contract Act, 1872", section: "Section 10" },
    { actName: "Copyright Act, 1957", section: "Section 17" },
    { actName: "Arbitration and Conciliation Act, 1996", section: "Section 7" },
  ];
  const sources = [];
  for (const s of sourceDefs) {
    sources.push(
      await prisma.legalSource.create({
        data: { ...s, excerpt: "[PLACEHOLDER - verified excerpt]", lastReviewed: new Date() },
      })
    );
  }
  const [contractAct, copyrightAct, arbitrationAct] = sources;

  // 3. clauses, in document order. {{field_key}} placeholders are filled at generation time.
  const clauseDefs = [
    {
      title: "Parties",
      legalText:
        'This Agreement is made on {{effective_date}} between {{freelancer_name}} ("Freelancer") and {{client_name}} ("Client").',
      plainText: "Says who is signing and when.",
      isOptional: false,
      sourceId: contractAct.id,
    },
    {
      title: "Scope of Work",
      legalText: "The Freelancer shall provide the following services: {{scope_description}}.",
      plainText: "Describes exactly what work will be done.",
      isOptional: false,
      sourceId: contractAct.id,
    },
    {
      title: "Payment",
      legalText: "The Client shall pay INR {{fee_amount}} within {{payment_days}} days of invoice.",
      plainText: "How much is paid and by when.",
      isOptional: false,
      sourceId: contractAct.id,
    },
    {
      title: "Intellectual Property",
      legalText: "All rights in the deliverables shall vest in the Client upon full payment.",
      plainText: "The client owns the work once fully paid.",
      isOptional: false,
      sourceId: copyrightAct.id,
    },
    {
      title: "Confidentiality",
      legalText: "Each party shall keep the other's confidential information secret.",
      plainText: "Neither side may share the other's private information.",
      isOptional: true, // skipped in code when include_nda = 'false'
      sourceId: contractAct.id,
    },
    {
      title: "Termination",
      legalText: "Either party may terminate with {{notice_days}} days' written notice.",
      plainText: "How either side can end the agreement.",
      isOptional: false,
      sourceId: contractAct.id,
    },
    {
      title: "Dispute Resolution",
      legalText: "Disputes shall be referred to arbitration seated at {{arbitration_city}}.",
      plainText: "Disagreements go to arbitration in the stated city.",
      isOptional: false,
      sourceId: arbitrationAct.id,
    },
  ];

  const clauses = [];
  for (const c of clauseDefs) clauses.push(await prisma.clause.create({ data: c }));

  // 4. template + template_clauses (position = order in document)
  const template = await prisma.template.create({
    data: {
      documentTypeId: docType.id,
      title: "Freelance Service Agreement",
      version: "1.0",
      stateApplicability: "Karnataka",
      isActive: true,
      clauses: {
        create: clauses.map((c, i) => ({ clauseId: c.id, position: i + 1 })),
      },
    },
  });

  // 5. template_fields (the questionnaire)
  const fields = [
    ["effective_date", "What date should the agreement start?", "date"],
    ["freelancer_name", "Freelancer's full legal name", "text"],
    ["client_name", "Client's full legal name", "text"],
    ["scope_description", "Describe the work to be delivered", "text"],
    ["fee_amount", "Total fee (INR)", "number"],
    ["payment_days", "Days allowed to pay after invoice", "number"],
    ["include_nda", "Do you want a confidentiality clause?", "boolean"],
    ["notice_days", "Notice period for termination (days)", "number"],
    ["arbitration_city", "City for arbitration", "text"],
  ];

  await prisma.templateField.createMany({
    data: fields.map(([fieldKey, labelPlain, dataType], i) => ({
      templateId: template.id,
      fieldKey,
      labelPlain,
      dataType,
      isRequired: true,
      displayOrder: i + 1,
    })),
  });

  // 6. expert
  await prisma.expert.create({
    data: {
      name: "Adv. Example Name",
      barCouncilId: "KAR/0000/2020",
      specialization: "Contract Law",
      isAvailable: true,
    },
  });

  console.log("Seeded: 1 document type, 3 sources, 7 clauses, 1 template, 9 fields, 1 expert.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
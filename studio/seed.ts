import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2025-02-01'})

const sampleDocuments = [
  {
    _type: 'announcement',
    title: 'Project Kaagapay Peer Support Network Now Live Across All Colleges',
    slug: {_type: 'slug', current: 'kaagapay-peer-support-network-live'},
    summary:
      'Confidential peer accompaniment and trauma-informed support are now accessible to all UP Mindanao students across CHSS, CSM, and SOM.',
    publishedAt: '2026-11-10T09:00:00.000Z',
    badge: 'Important',
    pinned: true,
    ctaLabel: 'File a Confidential Report',
    ctaUrl: '/report',
    body: [
      {
        _key: 'b1',
        _type: 'block',
        style: 'normal',
        children: [
          {
            _key: 's1',
            _type: 'span',
            marks: [],
            text: 'Project Kaagapay has officially expanded its certified student responder roster across the College of Humanities and Social Sciences (CHSS), College of Science and Mathematics (CSM), and School of Management (SOM).',
          },
        ],
      },
      {
        _key: 'b2',
        _type: 'block',
        style: 'h3',
        children: [
          {
            _key: 's2',
            _type: 'span',
            marks: [],
            text: 'What This Means for Students',
          },
        ],
      },
      {
        _key: 'b3',
        _type: 'block',
        style: 'normal',
        children: [
          {
            _key: 's3',
            _type: 'span',
            marks: [],
            text: 'Students seeking psychosocial first aid or accompaniment to the Office of Anti-Sexual Harassment (OASH) can request any available responder or choose a specific certified peer volunteer through our encrypted reporting portal.',
          },
        ],
      },
    ],
  },
  {
    _type: 'announcement',
    title: 'Updated OASH Crisis Hotline & After-Hours Accompaniment Protocol',
    slug: {_type: 'slug', current: 'updated-oash-crisis-hotline-protocol'},
    summary:
      'Review the updated 24/7 campus security dispatch and peer responder escalation procedures for urgent after-hours incidents.',
    publishedAt: '2026-11-08T14:30:00.000Z',
    badge: 'Urgent',
    pinned: false,
    ctaLabel: 'Track an Existing Case',
    ctaUrl: '/track',
    body: [
      {
        _key: 'b1',
        _type: 'block',
        style: 'normal',
        children: [
          {
            _key: 's1',
            _type: 'span',
            marks: [],
            text: 'For immediate physical safety emergencies on or near campus, always contact UP Mindanao Security at (082) 293-0000 first. Our on-duty Kaagapay responders coordinate directly with OASH coordinators to provide rapid accompaniment within 15 minutes of ticket acceptance.',
          },
        ],
      },
    ],
  },
  {
    _type: 'initiative',
    title: 'Safe Spaces & Bystander Intervention Campus Workshop Series',
    slug: {_type: 'slug', current: 'safe-spaces-bystander-intervention-workshop'},
    summary:
      'Interactive monthly training sessions equipping UP Mindanao student organizations with trauma-informed active listening and bystander intervention skills.',
    publishedAt: '2026-11-11T08:00:00.000Z',
    status: 'Upcoming',
    eventDate: '2026-11-28T09:00:00.000Z',
    endDate: '2026-11-28T16:00:00.000Z',
    location: 'CHSS Audio Visual Room (AVR), UP Mindanao',
    body: [
      {
        _key: 'b1',
        _type: 'block',
        style: 'normal',
        children: [
          {
            _key: 's1',
            _type: 'span',
            marks: [],
            text: 'Hosted in partnership with Gabriela Youth UP Mindanao and OASH, this full-day workshop covers the Anti-Sexual Harassment Code, consent culture, and practical strategies for intervening safely when witnessing harassment.',
          },
        ],
      },
      {
        _key: 'b2',
        _type: 'block',
        style: 'normal',
        children: [
          {
            _key: 's2',
            _type: 'span',
            marks: [],
            text: 'Open to all student council officers, organization leaders, and dorm residents. Certificates of participation are awarded upon completion.',
          },
        ],
      },
    ],
  },
  {
    _type: 'initiative',
    title: 'Purple Ribbon Solidarity Week & Campus Safety Audit',
    slug: {_type: 'slug', current: 'purple-ribbon-solidarity-week-audit'},
    summary:
      'A week-long campus awareness drive and collaborative student walk-through identifying lighting and safety improvements across Mintal campus pathways.',
    publishedAt: '2026-11-05T10:00:00.000Z',
    status: 'Ongoing',
    eventDate: '2026-11-12T08:00:00.000Z',
    endDate: '2026-11-19T17:00:00.000Z',
    location: 'UP Mindanao Atrium & Campus Grounds',
    body: [
      {
        _key: 'b1',
        _type: 'block',
        style: 'normal',
        children: [
          {
            _key: 's1',
            _type: 'span',
            marks: [],
            text: 'Join our volunteers at the Atrium booth to pick up solidarity ribbons, read survivor-centered advocacy zines, and contribute to our crowd-sourced campus lighting and pathway safety map.',
          },
        ],
      },
    ],
  },
  {
    _type: 'volunteerOpportunity',
    title: 'Cohort 2 Peer Responder & Psychosocial Accompaniment Volunteers',
    slug: {_type: 'slug', current: 'cohort-2-peer-responder-volunteers'},
    summary:
      'Become a certified Kaagapay peer responder trained in psychological first aid, confidential case intake, and survivor accompaniment.',
    publishedAt: '2026-11-09T09:00:00.000Z',
    status: 'Open',
    deadline: '2026-12-15',
    commitment: '4–6 hrs/week • Flexible on-call schedule + 2-day OASH certification',
    applyUrl: '/volunteer/apply',
    body: [
      {
        _key: 'b1',
        _type: 'block',
        style: 'normal',
        children: [
          {
            _key: 's1',
            _type: 'span',
            marks: [],
            text: 'Peer responders serve as the compassionate bridge between victim-survivors and institutional support offices. No prior clinical background is required—all accepted applicants complete a comprehensive 2-day Psychological First Aid and OASH Protocol training workshop.',
          },
        ],
      },
      {
        _key: 'b2',
        _type: 'block',
        style: 'h3',
        children: [
          {
            _key: 's2',
            _type: 'span',
            marks: [],
            text: 'Requirements',
          },
        ],
      },
      {
        _key: 'b3',
        _type: 'block',
        style: 'normal',
        children: [
          {
            _key: 's3',
            _type: 'span',
            marks: [],
            text: 'Bonafide UP Mindanao student in good standing, commitment to strict confidentiality, and alignment with trauma-informed, survivor-centered principles.',
          },
        ],
      },
    ],
  },
  {
    _type: 'volunteerOpportunity',
    title: 'Education, Zine Design & Digital Advocacy Committee',
    slug: {_type: 'slug', current: 'education-zine-design-digital-advocacy'},
    summary:
      'Help craft accessible infographics, Safe Spaces Act primers, and workshop toolkits for the UP Mindanao community.',
    publishedAt: '2026-11-04T12:00:00.000Z',
    status: 'Open',
    deadline: '2026-12-05',
    commitment: '3 hrs/week • Remote / Project-based creative & research tasks',
    applyUrl: '/volunteer/apply',
    body: [
      {
        _key: 'b1',
        _type: 'block',
        style: 'normal',
        children: [
          {
            _key: 's1',
            _type: 'span',
            marks: [],
            text: 'Ideal for students passionate about visual communication, copywriting, Bisaya/Tagalog/English translation, and gender sensitivity education. Work closely with our campaign leads to publish campus safety guides.',
          },
        ],
      },
    ],
  },
  {
    _type: 'resource',
    title: 'UP Anti-Sexual Harassment Code & Safe Spaces Act Student Primer',
    slug: {_type: 'slug', current: 'up-ash-code-safe-spaces-student-primer'},
    summary:
      'A step-by-step guide to formal and informal administrative remedies, survivor rights, and protective measures at UP Mindanao.',
    publishedAt: '2026-11-07T08:00:00.000Z',
    resourceType: 'Policy / Handbook',
    externalUrl: 'https://upmin.edu.ph/students/student-handbook/',
    body: [
      {
        _key: 'b1',
        _type: 'block',
        style: 'normal',
        children: [
          {
            _key: 's1',
            _type: 'span',
            marks: [],
            text: 'Under the UP Anti-Sexual Harassment Code and Republic Act No. 11313 (Safe Spaces Act), every student has the right to a learning environment free from gender-based sexual harassment—whether in-person, in dormitories, or online.',
          },
        ],
      },
      {
        _key: 'b2',
        _type: 'block',
        style: 'normal',
        children: [
          {
            _key: 's2',
            _type: 'span',
            marks: [],
            text: 'Survivors may opt for informal conflict resolution, protective academic/dormitory accommodations, or formal administrative investigation with full accompaniment from a certified Kaagapay volunteer.',
          },
        ],
      },
    ],
  },
  {
    _type: 'resource',
    title: 'Davao & UP Mindanao Emergency Hotlines & Psychosocial Directory',
    slug: {_type: 'slug', current: 'davao-upmin-emergency-hotlines-directory'},
    summary:
      'Verified contact numbers for UP Mindanao Security, OASH, Southern Philippines Medical Center (SPMC) WCPU, and local legal aid.',
    publishedAt: '2026-11-06T08:00:00.000Z',
    resourceType: 'Hotline / Directory',
    externalUrl: 'mailto:proj.kaagapay@gmail.com',
    body: [
      {
        _key: 'b1',
        _type: 'block',
        style: 'normal',
        children: [
          {
            _key: 's1',
            _type: 'span',
            marks: [],
            text: '• UP Mindanao Campus Security (24/7): (082) 293-0000\n• Project Kaagapay Direct Email: proj.kaagapay@gmail.com\n• UP Mindanao Office of Student Affairs (OSA) Counseling Desk\n• Davao City Central 911 Emergency Response: 911',
          },
        ],
      },
    ],
  },
]

async function runSeed() {
  console.log('Seeding Project Kaagapay Sanity dataset (production)...')
  for (const doc of sampleDocuments) {
    const existingId = await client.fetch<string | null>(
      `*[_type == $type && slug.current == $slug][0]._id`,
      {type: doc._type, slug: doc.slug.current},
    )
    if (existingId) {
      console.log(`Skipping existing ${doc._type}: ${doc.title} (${existingId})`)
      continue
    }
    const created = await client.create(doc)
    console.log(`Created ${doc._type}: ${doc.title} -> ${created._id}`)
  }
  console.log('Seeding complete!')
}

runSeed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})


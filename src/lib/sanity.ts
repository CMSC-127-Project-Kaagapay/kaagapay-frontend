import { createClient, type SanityClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const SANITY_PROJECT_ID =
  import.meta.env.VITE_SANITY_PROJECT_ID || "6une4fpk";
export const SANITY_DATASET =
  import.meta.env.VITE_SANITY_DATASET || "production";
export const SANITY_API_VERSION =
  import.meta.env.VITE_SANITY_API_VERSION || "2025-02-01";

export const isSanityConfigured = Boolean(SANITY_PROJECT_ID);

export const sanityClient: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId: SANITY_PROJECT_ID,
      dataset: SANITY_DATASET,
      apiVersion: SANITY_API_VERSION,
      useCdn: true,
    })
  : null;

const builder = sanityClient ? imageUrlBuilder(sanityClient) : null;

export function urlForImage(source: any): string | null {
  if (!builder || !source?.asset) return null;
  try {
    return builder.image(source).width(1200).auto("format").fit("max").url();
  } catch {
    return null;
  }
}

export type CmsContentType =
  | "announcement"
  | "initiative"
  | "volunteerOpportunity"
  | "resource";

export interface SanityImageField {
  asset?: {
    _ref?: string;
    _type?: string;
    url?: string;
  };
  alt?: string;
  hotspot?: unknown;
  crop?: unknown;
}

export interface BaseCmsDocument {
  _id: string;
  _type: CmsContentType;
  title: string;
  slug: string;
  summary: string;
  publishedAt: string;
  coverImage?: SanityImageField;
  body?: any[];
}

export interface AnnouncementDocument extends BaseCmsDocument {
  _type: "announcement";
  badge: "Info" | "Important" | "Urgent";
  pinned?: boolean;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface InitiativeDocument extends BaseCmsDocument {
  _type: "initiative";
  status: "Upcoming" | "Ongoing" | "Completed";
  eventDate?: string;
  endDate?: string;
  location?: string;
}

export interface VolunteerOpportunityDocument extends BaseCmsDocument {
  _type: "volunteerOpportunity";
  status: "Open" | "Closed";
  deadline?: string;
  commitment?: string;
  applyUrl?: string;
}

export interface ResourceDocument extends BaseCmsDocument {
  _type: "resource";
  resourceType:
    | "Guide"
    | "Policy / Handbook"
    | "Hotline / Directory"
    | "Downloadable PDF";
  fileUrl?: string;
  fileName?: string;
  externalUrl?: string;
}

export type CmsHubItem =
  | AnnouncementDocument
  | InitiativeDocument
  | VolunteerOpportunityDocument
  | ResourceDocument;

export const UPDATES_HUB_QUERY = `*[
  _type in ["announcement", "initiative", "volunteerOpportunity", "resource"]
  && defined(slug.current)
] | order(coalesce(pinned, false) desc, publishedAt desc) {
  _id,
  _type,
  title,
  "slug": slug.current,
  summary,
  publishedAt,
  coverImage {
    asset,
    alt,
    hotspot,
    crop
  },
  body[] {
    ...,
    _type == "image" => {
      ...,
      asset
    }
  },
  // Announcement fields
  badge,
  pinned,
  ctaLabel,
  ctaUrl,
  // Initiative fields
  status,
  eventDate,
  endDate,
  location,
  // Volunteer Opportunity fields
  deadline,
  commitment,
  applyUrl,
  // Resource fields
  resourceType,
  "fileUrl": fileAsset.asset->url,
  "fileName": fileAsset.asset->originalFilename,
  externalUrl
}`;

export const FALLBACK_CMS_ITEMS: CmsHubItem[] = [
  {
    _id: "fallback-announcement-1",
    _type: "announcement",
    title: "Project Kaagapay Peer Support Network Now Live Across All Colleges",
    slug: "kaagapay-peer-support-network-live",
    summary:
      "Confidential peer accompaniment and trauma-informed support are now accessible to all UP Mindanao students across CHSS, CSM, and SOM.",
    publishedAt: "2026-11-10T09:00:00.000Z",
    badge: "Important",
    pinned: true,
    ctaLabel: "File a Confidential Report",
    ctaUrl: "/report",
    body: [
      {
        _key: "fb-a1-1",
        _type: "block",
        style: "normal",
        children: [
          {
            _key: "fb-a1-s1",
            _type: "span",
            marks: [],
            text: "Project Kaagapay has officially expanded its certified student responder roster across the College of Humanities and Social Sciences (CHSS), College of Science and Mathematics (CSM), and School of Management (SOM).",
          },
        ],
      },
    ],
  },
  {
    _id: "fallback-initiative-1",
    _type: "initiative",
    title: "Safe Spaces & Bystander Intervention Campus Workshop Series",
    slug: "safe-spaces-bystander-intervention-workshop",
    summary:
      "Interactive monthly training sessions equipping UP Mindanao student organizations with trauma-informed active listening and bystander intervention skills.",
    publishedAt: "2026-11-11T08:00:00.000Z",
    status: "Upcoming",
    eventDate: "2026-11-28T09:00:00.000Z",
    endDate: "2026-11-28T16:00:00.000Z",
    location: "CHSS Audio Visual Room (AVR), UP Mindanao",
    body: [
      {
        _key: "fb-i1-1",
        _type: "block",
        style: "normal",
        children: [
          {
            _key: "fb-i1-s1",
            _type: "span",
            marks: [],
            text: "Hosted in partnership with Gabriela Youth UP Mindanao and OASH, this full-day workshop covers the Anti-Sexual Harassment Code, consent culture, and practical strategies for intervening safely when witnessing harassment.",
          },
        ],
      },
    ],
  },
  {
    _id: "fallback-volunteer-1",
    _type: "volunteerOpportunity",
    title: "Cohort 2 Peer Responder & Psychosocial Accompaniment Volunteers",
    slug: "cohort-2-peer-responder-volunteers",
    summary:
      "Become a certified Kaagapay peer responder trained in psychological first aid, confidential case intake, and survivor accompaniment.",
    publishedAt: "2026-11-09T09:00:00.000Z",
    status: "Open",
    deadline: "2026-12-15",
    commitment:
      "4–6 hrs/week • Flexible on-call schedule + 2-day OASH certification",
    applyUrl: "/volunteer/apply",
    body: [
      {
        _key: "fb-v1-1",
        _type: "block",
        style: "normal",
        children: [
          {
            _key: "fb-v1-s1",
            _type: "span",
            marks: [],
            text: "Peer responders serve as the compassionate bridge between victim-survivors and institutional support offices. All accepted applicants complete a comprehensive 2-day Psychological First Aid and OASH Protocol training workshop.",
          },
        ],
      },
    ],
  },
  {
    _id: "fallback-resource-1",
    _type: "resource",
    title: "UP Anti-Sexual Harassment Code & Safe Spaces Act Student Primer",
    slug: "up-ash-code-safe-spaces-student-primer",
    summary:
      "A step-by-step guide to formal and informal administrative remedies, survivor rights, and protective measures at UP Mindanao.",
    publishedAt: "2026-11-07T08:00:00.000Z",
    resourceType: "Policy / Handbook",
    externalUrl: "https://upmin.edu.ph/students/student-handbook/",
    body: [
      {
        _key: "fb-r1-1",
        _type: "block",
        style: "normal",
        children: [
          {
            _key: "fb-r1-s1",
            _type: "span",
            marks: [],
            text: "Under the UP Anti-Sexual Harassment Code and Republic Act No. 11313 (Safe Spaces Act), every student has the right to a learning environment free from gender-based sexual harassment.",
          },
        ],
      },
    ],
  },
];

export async function fetchUpdatesHubItems(): Promise<{
  items: CmsHubItem[];
  fromFallback: boolean;
}> {
  if (!sanityClient) {
    return { items: FALLBACK_CMS_ITEMS, fromFallback: true };
  }

  try {
    const data = await sanityClient.fetch<CmsHubItem[]>(UPDATES_HUB_QUERY);
    if (!Array.isArray(data) || data.length === 0) {
      return { items: FALLBACK_CMS_ITEMS, fromFallback: true };
    }
    return { items: data, fromFallback: false };
  } catch (error) {
    console.warn("Failed to fetch from Sanity Content Lake, using fallback preview items:", error);
    return { items: FALLBACK_CMS_ITEMS, fromFallback: true };
  }
}


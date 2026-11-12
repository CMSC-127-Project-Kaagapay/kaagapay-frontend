import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import {
  Megaphone,
  Calendar,
  MapPin,
  BookOpen,
  Users,
  Search,
  X,
  ArrowRight,
  ExternalLink,
  Download,
  Pin,
  Clock,
  Sparkles,
  Loader2,
  FileText,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  fetchUpdatesHubItems,
  urlForImage,
  type CmsContentType,
  type CmsHubItem,
} from "@/src/lib/sanity";

type FilterTab = "all" | CmsContentType;

const FILTER_TABS: {
  id: FilterTab;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "all", label: "All Updates", icon: Sparkles },
  { id: "announcement", label: "Announcements", icon: Megaphone },
  { id: "initiative", label: "Initiatives", icon: Calendar },
  {
    id: "volunteerOpportunity",
    label: "Volunteer Opportunities",
    icon: Users,
  },
  { id: "resource", label: "Resources", icon: BookOpen },
];

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-on-surface-variant text-base leading-relaxed mb-4 whitespace-pre-line">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="font-headline text-2xl font-extrabold text-on-surface mt-8 mb-3">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-headline text-xl font-bold text-secondary mt-6 mb-2">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-5 italic text-secondary my-6 py-1 bg-surface-container-low rounded-r-2xl pr-4">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-6 space-y-2 text-on-surface-variant mb-4">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-6 space-y-2 text-on-surface-variant mb-4">
        {children}
      </ol>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href || "#";
      const isExternal = href.startsWith("http");
      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-primary font-bold underline hover:opacity-80"
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      const imageUrl = urlForImage(value);
      if (!imageUrl) return null;
      return (
        <figure className="my-6 rounded-3xl overflow-hidden border border-outline-variant/20 bg-surface-container-low">
          <img
            src={imageUrl}
            alt={value?.alt || "Content illustration"}
            className="w-full max-h-96 object-cover"
          />
          {value?.caption && (
            <figcaption className="px-4 py-2 text-xs text-on-surface-variant font-medium text-center">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

function formatDate(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTypeLabel(type: CmsContentType) {
  switch (type) {
    case "announcement":
      return "Announcement";
    case "initiative":
      return "Initiative";
    case "volunteerOpportunity":
      return "Volunteer Opportunity";
    case "resource":
      return "Resource";
  }
}

function getTypeIcon(type: CmsContentType) {
  switch (type) {
    case "announcement":
      return Megaphone;
    case "initiative":
      return Calendar;
    case "volunteerOpportunity":
      return Users;
    case "resource":
      return BookOpen;
  }
}

function getBadgeStyle(item: CmsHubItem): { label: string; className: string } {
  switch (item._type) {
    case "announcement": {
      if (item.badge === "Urgent") {
        return {
          label: "Urgent",
          className: "bg-error/15 text-error border border-error/25",
        };
      }
      if (item.badge === "Important") {
        return {
          label: "Important",
          className: "bg-primary/15 text-primary border border-primary/20",
        };
      }
      return {
        label: "Info",
        className: "bg-secondary-container text-on-secondary-container",
      };
    }
    case "initiative": {
      if (item.status === "Ongoing") {
        return {
          label: "Ongoing",
          className: "bg-primary text-on-primary",
        };
      }
      if (item.status === "Completed") {
        return {
          label: "Completed",
          className: "bg-surface-container-highest text-on-surface-variant",
        };
      }
      return {
        label: "Upcoming",
        className: "bg-secondary-container text-on-secondary-container",
      };
    }
    case "volunteerOpportunity": {
      return item.status === "Open"
        ? {
            label: "Open for Applications",
            className: "bg-primary/15 text-primary border border-primary/25",
          }
        : {
            label: "Closed",
            className: "bg-surface-container-highest text-on-surface-variant",
          };
    }
    case "resource": {
      return {
        label: item.resourceType || "Guide",
        className: "bg-tertiary-fixed-dim/40 text-on-secondary-container",
      };
    }
  }
}

export default function Updates() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSlug = searchParams.get("item");
  const activeTabParam = (searchParams.get("tab") as FilterTab) || "all";

  const [items, setItems] = useState<CmsHubItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>(
    FILTER_TABS.some((t) => t.id === activeTabParam) ? activeTabParam : "all",
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadContent() {
      setLoading(true);
      const { items: fetchedItems } = await fetchUpdatesHubItems();
      if (isMounted) {
        setItems(fetchedItems);
        setLoading(false);
      }
    }
    loadContent();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedItem = useMemo(() => {
    if (!activeSlug) return null;
    return items.find((item) => item.slug === activeSlug) || null;
  }, [items, activeSlug]);

  useEffect(() => {
    if (!selectedItem) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDetailModal();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedItem]);

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    if (tab === "all") {
      next.delete("tab");
    } else {
      next.set("tab", tab);
    }
    setSearchParams(next, { replace: true });
  };

  const openDetailModal = (slug: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("item", slug);
    setSearchParams(next);
  };

  const closeDetailModal = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("item");
    setSearchParams(next);
  };

  const handleActionNavigation = (url: string) => {
    if (url.startsWith("http") || url.startsWith("mailto:") || url.startsWith("tel:")) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      closeDetailModal();
      navigate(url);
    }
  };

  const countsByType = useMemo(() => {
    const counts: Record<FilterTab, number> = {
      all: items.length,
      announcement: 0,
      initiative: 0,
      volunteerOpportunity: 0,
      resource: 0,
    };
    for (const item of items) {
      counts[item._type] = (counts[item._type] || 0) + 1;
    }
    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesTab = activeTab === "all" || item._type === activeTab;
      if (!matchesTab) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        (item._type === "initiative" &&
          item.location?.toLowerCase().includes(q)) ||
        (item._type === "volunteerOpportunity" &&
          item.commitment?.toLowerCase().includes(q)) ||
        (item._type === "resource" &&
          item.resourceType?.toLowerCase().includes(q))
      );
    });
  }, [items, activeTab, searchQuery]);

  const pinnedAnnouncements = useMemo(() => {
    if (activeTab !== "all" && activeTab !== "announcement") return [];
    if (searchQuery.trim()) return [];
    return filteredItems.filter(
      (item): item is Extract<CmsHubItem, { _type: "announcement" }> =>
        item._type === "announcement" && Boolean(item.pinned),
    );
  }, [filteredItems, activeTab, searchQuery]);

  const gridItems = useMemo(() => {
    const pinnedIds = new Set(pinnedAnnouncements.map((p) => p._id));
    return filteredItems.filter((item) => !pinnedIds.has(item._id));
  }, [filteredItems, pinnedAnnouncements]);

  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto space-y-12">
      {/* Editorial Hero Section */}
      <header className="relative overflow-hidden rounded-[3rem] aura-gradient text-on-primary p-10 md:p-16 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-widest">
            <Sparkles size={14} />
            Project Kaagapay Community Hub
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tight leading-[1.1]">
            Campus Updates, Initiatives & Resources.
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
            Stay connected with official OASH & Kaagapay announcements, advocacy
            workshops, volunteer responder cohorts, and survivor support guides.
          </p>
        </div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-16 w-72 h-72 bg-secondary/30 rounded-full blur-2xl pointer-events-none" />
      </header>

      {/* Filter Tabs + Search Controls */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-surface-container-lowest p-4 md:p-6 rounded-[2.5rem] editorial-shadow border border-outline-variant/15">
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "px-4 py-2.5 rounded-2xl text-xs md:text-sm font-extrabold font-headline transition-all flex items-center gap-2 cursor-pointer",
                  isSelected
                    ? "bg-primary text-on-primary shadow-md"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container",
                )}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[11px] font-black",
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-surface-container-high text-on-surface-variant",
                  )}
                >
                  {countsByType[tab.id]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-80">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-outline"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search updates, workshops, guides..."
            className="w-full bg-surface-container-low rounded-2xl pl-11 pr-10 py-3 text-sm font-semibold text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-surface-container text-on-surface-variant"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </section>

      {/* Loading State */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary" size={44} />
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Loading Community Updates...
          </p>
        </div>
      ) : (
        <>
          {/* Pinned Announcements Spotlight */}
          {pinnedAnnouncements.length > 0 && (
            <section className="space-y-4">
              {pinnedAnnouncements.map((pinned) => {
                const badge = getBadgeStyle(pinned);
                return (
                  <motion.div
                    key={pinned._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => openDetailModal(pinned.slug)}
                    className="group bg-surface-container-lowest rounded-[2.5rem] p-8 md:p-10 editorial-shadow border-2 border-primary/20 hover:border-primary transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
                  >
                    <div className="space-y-3 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-on-primary text-[11px] font-black uppercase tracking-widest">
                          <Pin size={12} />
                          Pinned Announcement
                        </span>
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest",
                            badge.className,
                          )}
                        >
                          {badge.label}
                        </span>
                        <span className="text-xs font-bold text-on-surface-variant">
                          {formatDate(pinned.publishedAt)}
                        </span>
                      </div>
                      <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface group-hover:text-primary transition-colors">
                        {pinned.title}
                      </h2>
                      <p className="text-on-surface-variant text-base leading-relaxed">
                        {pinned.summary}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-surface-container text-primary font-extrabold text-sm group-hover:bg-primary group-hover:text-on-primary transition-all">
                      Read Full Update
                      <ArrowRight size={18} />
                    </div>
                  </motion.div>
                );
              })}
            </section>
          )}

          {/* Main Card Grid */}
          {gridItems.length === 0 && pinnedAnnouncements.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-[2.5rem] p-16 text-center space-y-4 editorial-shadow border border-outline-variant/10">
              <FileText
                size={48}
                className="mx-auto text-on-surface-variant/40"
              />
              <h3 className="font-headline text-2xl font-bold text-on-surface">
                No matching updates found
              </h3>
              <p className="text-on-surface-variant text-sm max-w-md mx-auto">
                Try adjusting your search keywords or switching to a different
                category tab.
              </p>
            </div>
          ) : (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridItems.map((item) => {
                const TypeIcon = getTypeIcon(item._type);
                const badge = getBadgeStyle(item);
                const imageUrl = urlForImage(item.coverImage);

                return (
                  <motion.article
                    key={item._id}
                    whileHover={{ y: -6 }}
                    onClick={() => openDetailModal(item.slug)}
                    className="group bg-surface-container-lowest rounded-[2.5rem] overflow-hidden editorial-shadow border border-outline-variant/15 hover:border-primary/30 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {imageUrl && (
                        <div className="aspect-[16/9] w-full overflow-hidden bg-surface-container-low">
                          <img
                            src={imageUrl}
                            alt={item.coverImage?.alt || item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}

                      <div className="p-8 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-secondary">
                            <TypeIcon size={14} />
                            {getTypeLabel(item._type)}
                          </span>
                          <span
                            className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest",
                              badge.className,
                            )}
                          >
                            {badge.label}
                          </span>
                        </div>

                        <h3 className="font-headline text-2xl font-extrabold text-on-surface group-hover:text-primary transition-colors leading-snug">
                          {item.title}
                        </h3>

                        <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-3">
                          {item.summary}
                        </p>

                        {/* Type-Specific Metadata */}
                        {item._type === "initiative" &&
                          (item.eventDate || item.location) && (
                            <div className="pt-2 space-y-1.5 text-xs font-semibold text-on-surface-variant">
                              {item.eventDate && (
                                <div className="flex items-center gap-2">
                                  <Calendar
                                    size={14}
                                    className="text-primary shrink-0"
                                  />
                                  <span>
                                    {formatDate(item.eventDate)}
                                    {item.endDate
                                      ? ` – ${formatDate(item.endDate)}`
                                      : ""}
                                  </span>
                                </div>
                              )}
                              {item.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin
                                    size={14}
                                    className="text-primary shrink-0"
                                  />
                                  <span className="truncate">
                                    {item.location}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                        {item._type === "volunteerOpportunity" &&
                          (item.commitment || item.deadline) && (
                            <div className="pt-2 space-y-1.5 text-xs font-semibold text-on-surface-variant">
                              {item.commitment && (
                                <div className="flex items-center gap-2">
                                  <Clock
                                    size={14}
                                    className="text-primary shrink-0"
                                  />
                                  <span className="truncate">
                                    {item.commitment}
                                  </span>
                                </div>
                              )}
                              {item.deadline && (
                                <div className="flex items-center gap-2">
                                  <Calendar
                                    size={14}
                                    className="text-primary shrink-0"
                                  />
                                  <span>
                                    Apply by {formatDate(item.deadline)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="px-8 pb-8 pt-4 border-t border-outline-variant/10 flex items-center justify-between text-xs font-bold text-on-surface-variant">
                      <span>{formatDate(item.publishedAt)}</span>
                      <span className="inline-flex items-center gap-1.5 text-primary font-extrabold group-hover:translate-x-1 transition-transform">
                        View Details <ArrowRight size={14} />
                      </span>
                    </div>
                  </motion.article>
                );
              })}
            </section>
          )}
        </>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cms-detail-title"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDetailModal}
              className="absolute inset-0 bg-on-surface/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-surface-container-lowest rounded-[2.5rem] editorial-shadow border border-outline-variant/20"
            >
              {urlForImage(selectedItem.coverImage) && (
                <div className="aspect-[21/9] w-full overflow-hidden bg-surface-container-low relative">
                  <img
                    src={urlForImage(selectedItem.coverImage)!}
                    alt={selectedItem.coverImage?.alt || selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8 md:p-12 space-y-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-secondary">
                      {getTypeLabel(selectedItem._type)}
                    </span>
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest",
                        getBadgeStyle(selectedItem).className,
                      )}
                    >
                      {getBadgeStyle(selectedItem).label}
                    </span>
                    <span className="text-xs font-bold text-on-surface-variant">
                      Published {formatDate(selectedItem.publishedAt)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={closeDetailModal}
                    className="p-2.5 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors shrink-0"
                    title="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <h2
                    id="cms-detail-title"
                    className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface leading-tight"
                  >
                    {selectedItem.title}
                  </h2>
                  <p className="text-lg font-semibold text-on-surface-variant leading-relaxed">
                    {selectedItem.summary}
                  </p>
                </div>

                {/* Type-specific Metadata Banner */}
                {selectedItem._type === "initiative" &&
                  (selectedItem.eventDate || selectedItem.location) && (
                    <div className="bg-surface-container-low rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border border-outline-variant/15">
                      {selectedItem.eventDate && (
                        <div className="flex items-start gap-3">
                          <Calendar
                            size={20}
                            className="text-primary shrink-0 mt-0.5"
                          />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                              Schedule
                            </p>
                            <p className="text-sm font-bold text-on-surface">
                              {formatDate(selectedItem.eventDate)}
                              {selectedItem.endDate
                                ? ` – ${formatDate(selectedItem.endDate)}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedItem.location && (
                        <div className="flex items-start gap-3">
                          <MapPin
                            size={20}
                            className="text-primary shrink-0 mt-0.5"
                          />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                              Location / Venue
                            </p>
                            <p className="text-sm font-bold text-on-surface">
                              {selectedItem.location}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {selectedItem._type === "volunteerOpportunity" &&
                  (selectedItem.commitment || selectedItem.deadline) && (
                    <div className="bg-surface-container-low rounded-3xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 border border-outline-variant/15">
                      {selectedItem.commitment && (
                        <div className="flex items-start gap-3">
                          <Clock
                            size={20}
                            className="text-primary shrink-0 mt-0.5"
                          />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                              Role & Commitment
                            </p>
                            <p className="text-sm font-bold text-on-surface">
                              {selectedItem.commitment}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedItem.deadline && (
                        <div className="flex items-start gap-3">
                          <Calendar
                            size={20}
                            className="text-primary shrink-0 mt-0.5"
                          />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                              Application Deadline
                            </p>
                            <p className="text-sm font-bold text-on-surface">
                              {formatDate(selectedItem.deadline)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {/* Rich Text Body */}
                {selectedItem.body && selectedItem.body.length > 0 && (
                  <div className="pt-2 border-t border-outline-variant/15">
                    <PortableText
                      value={selectedItem.body}
                      components={portableTextComponents}
                    />
                  </div>
                )}

                {/* Type-Specific Call to Action Footer */}
                <div className="pt-6 border-t border-outline-variant/15 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={closeDetailModal}
                    className="px-6 py-3.5 rounded-2xl bg-surface-container text-on-surface-variant font-bold text-sm hover:bg-surface-container-high transition-colors"
                  >
                    Close
                  </button>

                  <div className="flex flex-wrap gap-3">
                    {selectedItem._type === "announcement" &&
                      selectedItem.ctaUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            handleActionNavigation(selectedItem.ctaUrl!)
                          }
                          className="px-8 py-3.5 rounded-2xl bg-primary text-on-primary font-extrabold text-sm hover:opacity-90 transition-all inline-flex items-center gap-2 shadow-lg"
                        >
                          {selectedItem.ctaLabel || "Learn More"}
                          <ArrowRight size={16} />
                        </button>
                      )}

                    {selectedItem._type === "volunteerOpportunity" &&
                      selectedItem.status === "Open" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleActionNavigation(
                              selectedItem.applyUrl || "/volunteer/apply",
                            )
                          }
                          className="px-8 py-3.5 rounded-2xl bg-primary text-on-primary font-extrabold text-sm hover:opacity-90 transition-all inline-flex items-center gap-2 shadow-lg"
                        >
                          Apply for This Role
                          <ArrowRight size={16} />
                        </button>
                      )}

                    {selectedItem._type === "resource" &&
                      selectedItem.fileUrl && (
                        <a
                          href={selectedItem.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-8 py-3.5 rounded-2xl bg-primary text-on-primary font-extrabold text-sm hover:opacity-90 transition-all inline-flex items-center gap-2 shadow-lg"
                        >
                          <Download size={16} />
                          {selectedItem.fileName
                            ? `Download ${selectedItem.fileName}`
                            : "Download Resource"}
                        </a>
                      )}

                    {selectedItem._type === "resource" &&
                      selectedItem.externalUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            handleActionNavigation(selectedItem.externalUrl!)
                          }
                          className="px-8 py-3.5 rounded-2xl bg-secondary text-on-primary font-extrabold text-sm hover:opacity-90 transition-all inline-flex items-center gap-2 shadow-lg"
                        >
                          Open Resource
                          <ExternalLink size={16} />
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


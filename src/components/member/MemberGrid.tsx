// src/components/member/MemberGrid.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import type { Member, MembersResponse } from "@/types";
import MemberCard from "./MemberCard";
import MemberDetailModal from "./MemberDetailModal";

interface Props {
  groups: { slug: string; name_ja: string; name_cn: string; color: string }[];
}

export default function MemberGrid({ groups }: Props) {
  const t = useTranslations("members");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchMembers = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (activeGroup !== "all") params.set("group", activeGroup);
      params.set("limit", "50");

      try {
        const res = await fetch(`/api/members?${params.toString()}`, {
          signal: controller.signal,
        });
        const json: MembersResponse = await res.json();
        setMembers(json.data);
        setLoading(false);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchMembers, 300);
    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [search, activeGroup]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-6 text-love">
        {t("title")}
      </h1>

      <div className="mb-6 flex justify-center">
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm rounded-full border-2 border-border-soft focus:border-love text-sm h-10"
        />
      </div>

      <div className="flex gap-2 justify-center mb-8 flex-wrap">
        <button
          onClick={() => setActiveGroup("all")}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeGroup === "all"
              ? "bg-love text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {t("allGroups")}
        </button>
        {groups.map((g) => (
          <button
            key={g.slug}
            onClick={() => setActiveGroup(g.slug)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeGroup === g.slug
                ? "text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
            style={
              activeGroup === g.slug ? { backgroundColor: g.color } : undefined
            }
          >
            {locale === "zh" ? g.name_cn : g.name_ja}
          </button>
        ))}
      </div>

      {!loading && members.length === 0 ? (
        <div className="text-center text-gray-400 py-12">{t("noResults")}</div>
      ) : (
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 transition-opacity duration-300 ${
            loading ? "opacity-50" : "opacity-100"
          }`}
        >
          {members.map((m, i) => (
            <div
              key={m.id}
              className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300"
              style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
            >
              <MemberCard
                member={m}
                onClick={(member) => {
                  setSelectedMember(member);
                  setModalOpen(true);
                }}
              />
            </div>
          ))}
        </div>
      )}

      <MemberDetailModal
        member={selectedMember}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}

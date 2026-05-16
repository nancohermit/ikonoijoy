// src/components/member/MemberGrid.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import type { Member, MembersResponse } from "@/types";
import MemberCard from "./MemberCard";
import MemberDetailModal from "./MemberDetailModal";

interface Props {
  groups: { slug: string; name_ja: string; color: string }[];
  locale: string;
}

export default function MemberGrid({ groups, locale }: Props) {
  const t = useTranslations("members");
  const [search, setSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState("all");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (activeGroup !== "all") params.set("group", activeGroup);
      params.set("limit", "50");

      const res = await fetch(`/api/members?${params.toString()}`);
      const json: MembersResponse = await res.json();
      setMembers(json.data);
      setLoading(false);
    };

    const debounce = setTimeout(fetchMembers, 300);
    return () => clearTimeout(debounce);
  }, [search, activeGroup]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-6 text-love">
        {t("title")}
      </h1>

      <div className="mb-6">
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm mx-auto rounded-full border-2 border-border-soft focus:border-love text-sm h-10"
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
            {g.name_ja}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading...</div>
      ) : members.length === 0 ? (
        <div className="text-center text-gray-400 py-12">{t("noResults")}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {members.map((m) => (
            <MemberCard
              key={m.id}
              member={m}
              onClick={(member) => {
                setSelectedMember(member);
                setModalOpen(true);
              }}
            />
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

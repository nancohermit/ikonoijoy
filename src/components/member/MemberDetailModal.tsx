// src/components/member/MemberDetailModal.tsx
"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Member } from "@/types";

interface Props {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MemberDetailModal({ member, open, onOpenChange }: Props) {
  const t = useTranslations("members");
  const locale = useLocale();

  if (!member) return null;

  const groupColorMap: Record<string, { from: string; to: string; text: string }> = {
    "#dc7280": { from: "#ffe0e5", to: "#dc7280", text: "#b06070" },
    "#8bcabe": { from: "#d5f0ed", to: "#8bcabe", text: "#509090" },
    "#fae06d": { from: "#fff6d5", to: "#fae06d", text: "#b09020" },
  };
  const colors = groupColorMap[member.group?.color ?? ""] || groupColorMap["#dc7280"];

  const infoItems: { label: string; value: string | null | undefined }[] = [
    { label: t("group"), value: member.group?.name_ja },
    { label: t("birthday"), value: member.birthday },
    { label: t("birthplace"), value: member.birthplace },
    { label: t("height"), value: member.height },
    { label: t("bloodType"), value: member.blood_type },
    { label: t("hobby"), value: locale === "zh" && member.hobby_cn ? member.hobby_cn : member.hobby_ja },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl border-border-soft overflow-hidden">
        <DialogHeader>
          <div
            className="-mx-4 -mt-4 pt-10 pb-8 text-center rounded-t-2xl"
            style={{
              background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
            }}
          >
            <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-3xl">
              {member.profile_image_url ? (
                <img
                  src={member.profile_image_url}
                  alt={member.name_ja}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                "♡"
              )}
            </div>
            <DialogTitle className="text-xl font-bold" style={{ color: colors.text }}>
              {member.name_ja}
            </DialogTitle>
            {member.name_cn && (
              <p className="text-xs mt-1 opacity-70" style={{ color: colors.text }}>
                {member.name_cn}
              </p>
            )}
          </div>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {infoItems.map(
            (item) =>
              item.value && (
                <div key={item.label}>
                  <p className="text-[10px] text-gray-400">{item.label}</p>
                  <p className="text-sm text-gray-700">{item.value}</p>
                </div>
              )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getGroupColor } from "@/lib/design/colors";
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

  const c = getGroupColor(member.group?.color ?? "");

  const infoItems: { label: string; value: string | null | undefined }[] = [
    { label: t("group"), value: locale === "zh" && member.group?.name_cn ? member.group.name_cn : member.group?.name_ja },
    { label: t("birthday"), value: member.birthday },
    { label: t("birthplace"), value: member.birthplace },
    { label: t("height"), value: member.height },
    { label: t("bloodType"), value: member.blood_type },
    { label: t("hobby"), value: locale === "zh" && member.hobby_cn ? member.hobby_cn : member.hobby_ja },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-sm rounded-2xl border-border-soft overflow-hidden bg-gradient-to-br ${c.gradientFrom} ${c.gradientTo}`}
      >
        <DialogHeader>
          <div className="-mx-4 -mt-4 pt-10 pb-6 text-center">
            <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-3xl">
              {member.profile_image_url ? (
                <Image
                  src={member.profile_image_url}
                  alt={member.name_ja}
                  width={80}
                  height={80}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                "♡"
              )}
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              {member.name_ja}
            </DialogTitle>
            {member.name_cn && (
              <p className="text-xs mt-1 text-white/70">
                {member.name_cn}
              </p>
            )}
          </div>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {infoItems.map(
            (item) =>
              item.value && (
                <div key={item.label}>
                  <p className="text-[10px] text-white/60">{item.label}</p>
                  <p className="text-sm text-white font-medium">{item.value}</p>
                </div>
              )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

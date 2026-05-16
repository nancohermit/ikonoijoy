// src/components/member/MemberCard.tsx
import type { Member } from "@/types";

interface Props {
  member: Member;
  onClick: (member: Member) => void;
}

export default function MemberCard({ member, onClick }: Props) {
  const groupColorMap: Record<string, string> = {
    "#dc7280": "bg-love-light",
    "#8bcabe": "bg-me-light",
    "#fae06d": "bg-joy-light",
  };
  const bgClass = groupColorMap[member.group?.color ?? ""] ?? "bg-love-light";

  return (
    <button
      onClick={() => onClick(member)}
      className="bg-white rounded-2xl p-4 text-center border border-border-soft hover:shadow-md hover:scale-[1.02] transition-all w-full"
      style={{ borderTop: `3px solid ${member.group?.color ?? "#dc7280"}` }}
    >
      <div
        className={`w-16 h-16 sm:w-20 sm:h-20 ${bgClass} rounded-full mx-auto mb-3 flex items-center justify-center text-2xl`}
      >
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
      <p className="text-sm font-bold text-gray-700">{member.name_ja}</p>
      {member.name_cn && (
        <p className="text-xs text-gray-400 mt-0.5">{member.name_cn}</p>
      )}
      {member.group && (
        <span
          className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] text-white"
          style={{ backgroundColor: member.group.color }}
        >
          {member.group.name_ja}
        </span>
      )}
    </button>
  );
}

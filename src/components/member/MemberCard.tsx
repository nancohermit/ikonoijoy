import Image from "next/image";
import { getGroupColor } from "@/lib/design/colors";
import type { Member } from "@/types";

interface Props {
  member: Member;
  onClick: (member: Member) => void;
}

export default function MemberCard({ member, onClick }: Props) {
  const c = getGroupColor(member.group?.color ?? "");

  return (
    <button
      onClick={() => onClick(member)}
      className="bg-white rounded-2xl p-4 text-center border border-border-soft hover:shadow-md hover:scale-[1.02] transition-all w-full"
      style={{ borderTopColor: c.cssVar }}
    >
      <div
        className={`w-16 h-16 sm:w-20 sm:h-20 ${c.bgLight} rounded-full mx-auto mb-3 flex items-center justify-center text-2xl border-t-[3px] border-t-transparent`}
      >
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
      <p className="text-sm font-bold text-gray-700">{member.name_ja}</p>
      {member.name_cn && (
        <p className="text-xs text-gray-400 mt-0.5">{member.name_cn}</p>
      )}
      {member.group && (
        <span
          className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] text-white ${c.bg}`}
        >
          {member.group.name_ja}
        </span>
      )}
    </button>
  );
}

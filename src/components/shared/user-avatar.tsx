import Image from "next/image";
import { initialsOf } from "@/lib/format";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name: string;
  photo?: string | null;
  /** Rendered size in pixels. */
  size?: number;
  className?: string;
};

/** A profile photo (served optimised from Cloudinary), or the person's initials. */
export function UserAvatar({ name, photo, size = 32, className }: UserAvatarProps) {
  return (
    <span
      className={cn(
        "bg-ink text-primary relative grid shrink-0 place-items-center overflow-hidden rounded-full font-medium select-none",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.38) }}
    >
      {photo ? (
        <Image src={photo} alt="" fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span aria-hidden>{initialsOf(name) || "?"}</span>
      )}
    </span>
  );
}

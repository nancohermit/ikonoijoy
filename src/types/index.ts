export interface Group {
  id: string;
  name_ja: string;
  name_cn: string;
  slug: string;
  color: string;
  logo_url: string | null;
  description_ja: string | null;
  description_cn: string | null;
  youtube_url: string | null;
  official_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface Member {
  id: string;
  group_id: string;
  name_ja: string;
  name_cn: string | null;
  name_en: string | null;
  birthday: string | null;
  birthplace: string | null;
  height: string | null;
  blood_type: string | null;
  hobby_ja: string | null;
  hobby_cn: string | null;
  profile_image_url: string | null;
  gallery_images: GalleryImage[];
  sort_order: number;
  created_at: string;
  group?: Group;
}

export interface GalleryImage {
  url: string;
  caption_ja: string;
  caption_cn: string;
}

export interface Video {
  id: string;
  group_id: string | null;
  title_ja: string;
  title_cn: string | null;
  thumbnail_url: string;
  youtube_url: string;
  sort_order: number;
  created_at: string;
  group?: Group;
}

export interface CarouselImage {
  id: string;
  group_id: string;
  image_url: string;
  link_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface MembersResponse {
  data: Member[];
  total: number;
  page: number;
}

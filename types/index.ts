export type UserRole = "client" | "admin";
export type UserStatus = "pending" | "approved" | "rejected" | "disabled";
export type FileType = "pdf" | "pptx" | "xlsx";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  videos?: Video[];
}

export interface Video {
  id: string;
  module_id: string;
  title: string;
  bunny_url: string;
  summary: string | null;
  exercices: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  resources?: Resource[];
  module?: Module;
}

export interface Resource {
  id: string;
  video_id: string;
  title: string;
  file_path: string;
  file_type: FileType;
  file_size: number | null;
  created_at: string;
}

export interface Progress {
  id: string;
  user_id: string;
  video_id: string;
  completed_at: string;
}

export interface ApprovalToken {
  id: string;
  user_id: string;
  token: string;
  action: "approve" | "reject";
  used: boolean;
  expires_at: string;
  created_at: string;
}

// src/types/surat.ts
export interface DataRow {
  id: string;
  label: string;
  value: string;
  isBold?: boolean;
}

export interface AttachmentItem {
  id: string;
  text: string;
  isChecked: boolean;
}

export interface UserProfile {
  id: string;
  profileName: string;
  fullName: string;
  details: DataRow[];
  attachments?: AttachmentItem[];
}

export interface JobTarget {
  position: string;
  company: string;
  requirements: string;
}

// BARU: Interface Signature
export interface SavedSignature {
  id: string;
  name: string;
  image: string; // Base64
}
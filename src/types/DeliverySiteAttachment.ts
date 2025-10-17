export interface DeliverySiteAttachment {
  attachmentId?: number;
  deliverySiteId?: number;
  fileContent?: Uint8Array;
  mimeType?: string;
  characterSet?: string;
  fileName?: string;
  fileSize?: number;
  notes?: string;
  creationDate?: Date;
  createdBy?: string;
  lastUpdateDate?: Date;
  lastUpdatedBy?: string;
}

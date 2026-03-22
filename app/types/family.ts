export type Generation = 1 | 2 | 3 | 4; // 4 = great-grandparents … 1 = you
export type Gender     = "male" | "female";

export interface Person {
  id:          string;
  firstName:   string;
  lastName:    string;
  alias?:      string;
  generation:  Generation;
  gender:      Gender;
  dateOfBirth: string;   // ISO "YYYY-MM-DD"
  isAlive:     boolean;
  parents:     string[]; // Array of parent IDs
  spouses:     string[]; // Array of spouse IDs
  imageUrl?:   string;   // Base64 encoded image
}

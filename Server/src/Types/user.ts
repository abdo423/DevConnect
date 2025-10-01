import { Types } from 'mongoose';

interface userError {
  status?: number;
  message?: string;
  errors?: any; // Consider typing this more specifically
}

interface PopulatedSender {
  _id: Types.ObjectId;
  username: string;
  avatar?: string;
}

// Export both as named exports
export { userError, PopulatedSender };

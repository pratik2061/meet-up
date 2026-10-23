export interface FriendUser {
  _id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  phoneNumber?: string;
  createdAt?: string;
}

export interface FriendItem {
  friendshipId: string;
  friend: FriendUser;
  friendsSince: string;
}

export interface FriendRequestItem {
  _id: string;
  requester: FriendUser;
  recipient: FriendUser;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequestsData {
  incoming: FriendRequestItem[];
  outgoing: FriendRequestItem[];
  incomingCount: number;
  outgoingCount: number;
}

export interface SearchFriendUser extends FriendUser {
  relationship: 'NONE' | 'FRIENDS' | 'PENDING_OUTGOING' | 'PENDING_INCOMING';
  friendshipId?: string;
}

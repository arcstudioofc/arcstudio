interface IPost {
  hash?: string;
  content: string;
  bannerUrl?: string | null;
  githubUrl?: string | null;
  edited?: {
    isEdited: boolean;
    editedAt?: Date;
  };
  createdAt?: Date;
}

type ILeanPost = {
  hash?: string;
  content: string;
  bannerUrl?: string | null;
  githubUrl?: string | null;
  edited: {
    isEdited: boolean;
    editedAt: Date;
  };
  createdAt?: Date;
};

type ILeanUser = {
  _id: string;
  name?: string | null;
  account?: {
    bannerUrl?: string | null;
    description?: string | null;
    isVerified?: boolean;
    followers: string[];
    following: string[];
  };
  image?: string | null;
  provider?: string | null;
  discordId?: string | null;
  isAdmin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  posts?: ILeanPost[];
};

type UpsertUserInput = {
  email: string;
  name?: string | null;
  account?: {
    bannerUrl?: string | null;
    description?: string | null;
    isVerified?: boolean;
    followers?: string[] | [];
    following?: string[] | [];
  };
  image?: string | null;
  provider?: string | null;
  discordId?: string | null;
  isAdmin?: boolean;
  providerAccountId?: string | null;
  posts?: Partial<ILeanPost>[];
  [key: string]: any;
};

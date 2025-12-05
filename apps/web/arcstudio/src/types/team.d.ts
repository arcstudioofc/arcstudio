type Role =
  | "CEO"
  | "CTO"
  | "Fullstack Developer"
  | "Backend Developer"
  | "Frontend Developer"
  | "Designer"
  | "Marketing"
  | "Intern";

interface TeamProps {
  image: string;
  banner: string;
  name: string;
  username: string;
  info: {
    role: Role[];
  };
  links?: {
    github?: string | null;
    portfolio?: string | null;
  };
}

interface TeamProfileProps {
  member: TeamProps;
}
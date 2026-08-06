export type TeamMember = {
  id: string;
  name: string;
  role: string;
  /** Drop a photo at this path under `public/` (e.g. `public/images/team/maya.png`). */
  image: string;
};

/** Edit names and roles here — photos live in `public/images/team/`. */
export const teamMembers: TeamMember[] = [
  {
    id: "tingting",
    name: "Tingting Bao",
    role: "Data Quality Expert",
    image: "/images/team/member-1.png",
  },
  {
    id: "maya",
    name: "Maya Itani",
    role: "Art Director",
    image: "/images/team/maya.png",
  },
  {
    id: "rozita",
    name: "Rozita Hashemipoor",
    role: "UI / UX Designer",
    image: "/images/team/rozita.png",
  },
  {
    id: "elena",
    name: "Elena Marino",
    role: "IT Project Manager",
    image: "/images/team/member-4.png",
  },
  {
    id: "mighty",
    name: "Mighty Shambel",
    role: "Full Stack Developer",
    image: "/images/team/member-5.png",
  },
];

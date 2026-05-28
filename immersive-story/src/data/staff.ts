// Auto-generated from the 2025-26 FC Barcelona management team listed on
// Wikipedia. Staff photos are CC-licensed thumbnails from Wikimedia Commons.

export type StaffMember = {
  name: string;
  title: string;
  role: string;
  bio: string;
  image: string;
  attribution: { artist: string; license: string; license_url: string; file: string };
};

const asset = (s: string) => import.meta.env.BASE_URL + s.replace(/^\//, '');

export const STAFF: StaffMember[] = [
  {
    name: 'Hansi Flick',
    title: 'Head coach',
    role: 'Manager',
    bio: 'Hans-Dieter "Hansi" Flick is a German professional football manager and former player who is the manager of La Liga club Barcelona. He is widely considered to be one of the best managers in the world.',
    image: asset('staff/hansi-flick.jpg'),
    attribution: {
      artist: 'Steffen Prößdorf',
      license: 'CC BY-SA 4.0',
      license_url: 'https://creativecommons.org/licenses/by-sa/4.0',
      file: 'File:2022_Hansi_Flick_(cropped).jpg',
    },
  },
  {
    name: 'Marcus Sorg',
    title: 'Assistant coach',
    role: 'Tactics + first team',
    bio: 'Marcus Sorg is a German football coach and former player who is currently the assistant coach of La Liga club Barcelona.',
    image: asset('staff/marcus-sorg.jpg'),
    attribution: {
      artist: 'Steffen Prößdorf',
      license: 'CC BY-SA 4.0',
      license_url: 'https://creativecommons.org/licenses/by-sa/4.0',
      file: 'File:2019-06-11_Fußball,_Männer,_Länderspiel,_Deutschland-Estland_StP_2105_LR10_by_Stepro.jpg',
    },
  },
  {
    name: 'Thiago Alcântara',
    title: 'Assistant coach',
    role: 'Midfield specialist',
    bio: 'Thiago Alcântara do Nascimento, known as Thiago Alcântara or mononymously as Thiago, is a former professional footballer who played as a midfielder. He is currently the assistant manager of La Liga club Barcelona. Born in Italy, he played for the Spain national team.',
    image: asset('staff/thiago-alc-ntara.jpg'),
    attribution: {
      artist: 'Rolandhino1',
      license: 'CC BY-SA 4.0',
      license_url: 'https://creativecommons.org/licenses/by-sa/4.0',
      file: 'File:UEFA_EURO_qualifiers_Sweden_vs_Spain_20191015_Thiago_Alcantara_13_(cropped).jpg',
    },
  },
];

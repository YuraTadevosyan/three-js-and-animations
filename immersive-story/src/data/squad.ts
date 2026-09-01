// The 2026-27 FC Barcelona first-team squad, as listed on the FC Barcelona
// Wikipedia article (squad table updated 19 August 2026) and cross-checked
// against the 2026-27 season article's transfer tables.
//
// Summer 2026 rebuilt the spine: Lewandowski left on a free after four
// seasons, Ferran Torres went to PSG, Araújo is on loan at Liverpool, and
// Rashford's loan expired. In came Rodri, Anthony Gordon, Karim Adeyemi,
// Dominik Livaković, Jesse Bisiwu and a permanent deal for João Cancelo,
// with Xavi Espart promoted out of Barça Atlètic. The number 9 is vacant.
//
// Player photos live in public/players/. New-signing shots are CC BY-SA 4.0
// thumbnails from Wikimedia Commons; the older ones predate that rule and
// carry the honest "copyright unclear" tag they were imported with — see the
// Outro credits. Two academy-fringe players have no free photo at all and
// carry image: '' so the card falls back to a typographic treatment.

export type Armband = 'captain' | 'vice-captain' | null;

export type Player = {
  number: number;
  name: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  role: string;
  nat: string;
  armband: Armband;
  bio: string;
  image: string;
  attribution: { artist: string; license: string; license_url: string; file: string };
};

// Helper so we never hand-prefix the GitHub Pages sub-path — Vite injects
// the base path into import.meta.env.BASE_URL at build time.
const asset = (s: string) => import.meta.env.BASE_URL + s.replace(/^\//, '');

// No free photo exists on Commons for this player yet; the card renders a
// stroked-initials treatment instead of a broken background-image.
const NO_PHOTO = { artist: '', license: '', license_url: '', file: '' };

export const SQUAD: Player[] = [
  {
    number: 1,
    name: 'Joan Garcia',
    position: 'GK',
    role: 'Goalkeeper',
    nat: 'ESP',
    armband: null,
    bio: 'Joan Garcia Pons is a Spanish goalkeeper for Barcelona and Spain. An Espanyol youth graduate, he crossed the city in June 2025 when Barça activated his release clause, walked straight into the starting line-up and won La Liga in his first season. He inherits the number one shirt for 2026-27.',
    image: asset('players/joan-garcia.jpg'),
    attribution: {
      artist: 'Source: Bing',
      license: 'Internet (copyright unclear)',
      license_url: 'https://www.football-espana.net/2025/08/16/barcelona-register-joan-garcia-la-liga',
      file: 'https://icdn.football-espana.net/wp-content/uploads/2025/06/Joan-Garcia-2031-min.jpeg',
    },
  },
  {
    number: 13,
    name: 'Wojciech Szczęsny',
    position: 'GK',
    role: 'Goalkeeper',
    nat: 'POL',
    armband: null,
    bio: 'Wojciech Tomasz Szczęsny is a Polish goalkeeper for Barcelona. He came out of retirement in October 2024 to cover an injury crisis and has stayed ever since, twice a league champion in Catalonia after two Premier League Golden Gloves and a Serie A career at Roma and Juventus.',
    image: asset('players/wojciech-szcz-sny.jpg'),
    attribution: {
      artist: 'Source: Bing',
      license: 'Internet (copyright unclear)',
      license_url: 'https://getfootballnewsspain.com/barcelona-fans-unveil-new-wojciech-szczesny-chant/',
      file: 'https://getfootballnewsspain.com/wp-content/uploads/2025/02/fc-barcelona-v-deportivo-alave…',
    },
  },
  {
    number: 25,
    name: 'Dominik Livaković',
    position: 'GK',
    role: 'Goalkeeper',
    nat: 'CRO',
    armband: null,
    bio: 'Dominik Livaković is a Croatian goalkeeper for Barcelona and Croatia, signed from Fenerbahçe in August 2026. A Dinamo Zagreb legend and back-to-back World Cup medallist — runner-up in 2018, third in 2022 — he arrives as the experienced third of a rebuilt goalkeeping trio.',
    image: asset('players/dominik-livakovic.jpg'),
    attribution: {
      artist: 'Bryan Berlin',
      license: 'CC BY-SA 4.0',
      license_url: 'https://creativecommons.org/licenses/by-sa/4.0',
      file: 'File:Dominik Livakovic Croatia v Portugal 2 July 2026-063.jpg',
    },
  },
  {
    number: 2,
    name: 'João Cancelo',
    position: 'DF',
    role: 'Defender',
    nat: 'POR',
    armband: null,
    bio: 'João Pedro Cavaco Cancelo is a Portuguese full-back for Barcelona and Portugal, comfortable on either flank. After a season on loan from Al Hilal he returned permanently on a free transfer in August 2026, bringing a Serie A title, a Premier League treble and 60-plus caps with him.',
    image: asset('players/jo-o-cancelo.jpg'),
    attribution: {
      artist: 'Source: web search (Bing)',
      license: 'Internet (copyright unclear)',
      license_url: 'https://laligadelostalentos.com/fc-barcelona-la-importancia-de-joao-cancelo/',
      file: 'https://laligadelostalentos.com/wp-content/uploads/2023/09/fbl-esp-liga-barcelona-felix-ca…',
    },
  },
  {
    number: 3,
    name: 'Alejandro Balde',
    position: 'DF',
    role: 'Defender',
    nat: 'ESP',
    armband: null,
    bio: 'Alejandro Balde Martínez is a Spanish left-back for Barcelona and Spain. He joined the academy at 14 from Espanyol and has owned the left flank since Jordi Alba left — the overlap that stretches defences for Yamal to cut inside.',
    image: asset('players/alejandro-balde.jpg'),
    attribution: {
      artist: 'Source: web search (Bing)',
      license: 'Internet (copyright unclear)',
      license_url: 'https://www.fcbarcelona.com/en/photos/3690597/alejandro-baldes-career-in-photos',
      file: 'https://www.fcbarcelona.com/photo-resources/2023/09/19/f774864a-a2fc-49b3-8053-29317deeb46…',
    },
  },
  {
    number: 5,
    name: 'Pau Cubarsí',
    position: 'DF',
    role: 'Defender',
    nat: 'ESP',
    armband: null,
    bio: 'Pau Cubarsí Paredes is a Spanish centre-back for Barcelona and Spain, considered one of the best young defenders in the world. He debuted days before his seventeenth birthday in January 2024 and has since won La Liga in 2025 and 2026. With Araújo at Liverpool, the back line is now his to lead.',
    image: asset('players/pau-cubars.jpg'),
    attribution: {
      artist: 'Source: web search (Bing)',
      license: 'Internet (copyright unclear)',
      license_url: 'https://getfootballnewsspain.com/injury-update-provided-on-barcelona-star-pau-cubarsi/',
      file: 'https://getfootballnewsspain.com/wp-content/uploads/2025/08/fc-barcelona-v-real-madrid-cf-…',
    },
  },
  {
    number: 12,
    name: 'Xavi Espart',
    position: 'DF',
    role: 'Defender',
    nat: 'ESP',
    armband: null,
    bio: 'Xavi Espart Font is a Spanish full-back who can also drop into defensive midfield. In La Masia since he was eight, he debuted in the Champions League at Newcastle in March 2026 and was promoted to the senior squad on 27 August 2026 with the number 12.',
    image: '',
    attribution: NO_PHOTO,
  },
  {
    number: 15,
    name: 'Andreas Christensen',
    position: 'DF',
    role: 'Defender',
    nat: 'DEN',
    armband: null,
    bio: 'Andreas Bødtker Christensen is a Danish centre-back for Barcelona and Denmark. He arrived from Chelsea in 2022 with an FA Cup, a Europa League and a Champions League already won, and now partners Cubarsí as the senior half of the pairing.',
    image: asset('players/andreas-christensen.jpg'),
    attribution: {
      artist: 'Source: web search (Bing)',
      license: 'Internet (copyright unclear)',
      license_url: 'https://monesport.cat/barca/jugadors/andreas-christensen-pista-futur-barca-377843/',
      file: 'https://monesport.cat/app/uploads/sites/12/2024/04/europapress_5886546_andreas_christensen…',
    },
  },
  {
    number: 18,
    name: 'Gerard Martín',
    position: 'DF',
    role: 'Defender',
    nat: 'ESP',
    armband: null,
    bio: 'Gerard Martín Langreo is a Spanish defender for Barcelona. Primarily a left-back, he is also capable of playing as a centre-back — the utility cover that let Flick rotate a thin back line through two title runs.',
    image: asset('players/gerard-mart-n.jpg'),
    attribution: {
      artist: 'Source: web search (Bing)',
      license: 'Internet (copyright unclear)',
      license_url: 'https://www.fcbarcelona.cat/ca/fotos/3596800/gerard-martin-nou-jugador-del-barca-atletic',
      file: 'https://www.fcbarcelona.com/fcbarcelona/photo/2023/07/19/bca59355-dd3b-422e-9f0b-dc2d3d05d…',
    },
  },
  {
    number: 23,
    name: 'Jules Koundé',
    position: 'DF',
    role: 'Defender',
    nat: 'FRA',
    armband: null,
    bio: 'Jules Olivier Koundé is a French defender for Barcelona and France. Primarily a right-back, he is also capable of playing as a centre-back — and he scored the goal that won the 2025 Copa del Rey final against Real Madrid.',
    image: asset('players/jules-kound.jpg'),
    attribution: {
      artist: 'Source: web search (Bing)',
      license: 'Internet (copyright unclear)',
      license_url: 'https://getfootballnewsspain.com/why-jules-kounde-dropped-to-the-bench-for-barcelona-vs-alaves/',
      file: 'https://getfootballnewsspain.com/wp-content/uploads/2024/08/fc-barcelona-v-real-valladolid…',
    },
  },
  {
    number: 24,
    name: 'Eric García',
    position: 'DF',
    role: 'Defender',
    nat: 'ESP',
    armband: null,
    bio: 'Eric García Martret is a Spanish defender for Barcelona and Spain. Primarily a centre-back, he is also capable of playing as a full-back or defensive midfielder — the most quietly useful man in the squad on a night when Flick needs a plan B.',
    image: asset('players/eric-garc-a.jpg'),
    attribution: {
      artist: 'Source: web search (Bing)',
      license: 'Internet (copyright unclear)',
      license_url: 'https://laligadelostalentos.com/eric-garcia-del-barca-en-la-mira-de-girona-y-real-sociedad/',
      file: 'https://laligadelostalentos.com/wp-content/uploads/2024/10/fc-barcelona-v-as-monaco-trofeu…',
    },
  },
  {
    number: 6,
    name: 'Gavi',
    position: 'MF',
    role: 'Midfielder',
    nat: 'ESP',
    armband: null,
    bio: 'Pablo Martín Páez Gavira, known as Gavi, is a Spanish central midfielder for Barcelona and Spain. He pressed his way into the XI at seventeen and has spent the seasons since fighting his way back from a cruciate injury to the player he was.',
    image: asset('players/gavi.jpg'),
    attribution: {
      artist: 'Source: web search (Bing)',
      license: 'Internet (copyright unclear)',
      license_url: 'https://www.fcbarcelona.com/en/football/first-team/news/3720546/gavi-i-will-always-give-everything-for-fc-barcelona',
      file: 'https://www.fcbarcelona.com/fcbarcelona/photo/2023/10/04/2292b9a8-f946-4da8-8307-a2c1fe983…',
    },
  },
  {
    number: 7,
    name: 'Fermín López',
    position: 'MF',
    role: 'Midfielder',
    nat: 'ESP',
    armband: null,
    bio: 'Fermín López Marín is a Spanish attacking midfielder and winger for Barcelona and Spain. He takes the number 7 off Ferran Torres this season and opened 2026-27 with three goals in the first two matchdays.',
    image: asset('players/ferm-n-l-pez.jpg'),
    attribution: {
      artist: 'Source: Bing',
      license: 'Internet (copyright unclear)',
      license_url: 'https://getfootballnewsspain.com/how-introducing-fermin-lopez-could-have-forced-barcelona-xavi-to-forfeit-copa-quarter-final/',
      file: 'https://getfootballnewsspain.com/wp-content/uploads/2024/01/fc-barcelona-v-deportivo-alave…',
    },
  },
  {
    number: 8,
    name: 'Pedri',
    position: 'MF',
    role: 'Midfielder',
    nat: 'ESP',
    armband: 'vice-captain',
    bio: 'Pedro González López, more commonly known as Pedri, is a Spanish midfielder for Barcelona and Spain, and now one of its vice-captains. Considered one of the best midfielders in the world, he is known for his ball control, dribbling, passing and playmaking — the metronome every Flick side is built around.',
    image: asset('players/pedri.jpg'),
    attribution: {
      artist: 'Source: Bing',
      license: 'Internet (copyright unclear)',
      license_url: 'https://www.fcbarcelona.com/en/football/first-team/news/4264690/200-fc-barcelona-appearances-for-pedri',
      file: 'https://www.fcbarcelona.com/fcbarcelona/photo/2025/05/15/39233a98-1c26-4bef-b553-c0d25c736…',
    },
  },
  {
    number: 16,
    name: 'Rodri',
    position: 'MF',
    role: 'Midfielder',
    nat: 'ESP',
    armband: null,
    bio: 'Rodrigo Hernández Cascante — Rodri — is a Spanish defensive midfielder for Barcelona and captain of Spain, signed from Manchester City in August 2026 for €60M. A Ballon d’Or winner and one of only eleven players to have won the World Cup, the Champions League and the Ballon d’Or, he is the marquee arrival of the rebuild.',
    image: asset('players/rodri.jpg'),
    attribution: {
      artist: 'Bryan Berlin',
      license: 'CC BY-SA 4.0',
      license_url: 'https://creativecommons.org/licenses/by-sa/4.0',
      file: 'File:Rodri Argentina v Spain 19 July 2026-187 (cropped).jpg',
    },
  },
  {
    number: 20,
    name: 'Dani Olmo',
    position: 'MF',
    role: 'Midfielder',
    nat: 'ESP',
    armband: null,
    bio: 'Daniel Olmo Carvajal is a Spanish attacking midfielder and left winger for Barcelona and Spain. A La Masia boy who left for Dinamo Zagreb at sixteen, he won five Croatian titles and two DFB-Pokals at Leipzig before coming home in 2024.',
    image: asset('players/dani-olmo.jpg'),
    attribution: {
      artist: 'Source: Bing',
      license: 'Internet (copyright unclear)',
      license_url: 'https://www.football-actu.fr/hansi-flick-gouverne-dani-olmo-de-leganes-barcelone.html',
      file: 'https://icdn.football-espana.net/wp-content/uploads/2025/02/Dani-Olmo-2.jpeg',
    },
  },
  {
    number: 21,
    name: 'Frenkie de Jong',
    position: 'MF',
    role: 'Midfielder',
    nat: 'NED',
    armband: 'vice-captain',
    bio: 'Frenkie de Jong is a Dutch midfielder for Barcelona and the Netherlands, and one of the club’s vice-captains. Seven seasons on from the €1-a-year Ajax move that made his name, he is the longest-serving outfielder in the dressing room.',
    image: asset('players/frenkie-de-jong.jpg'),
    attribution: {
      artist: 'Source: web search (Bing)',
      license: 'Internet (copyright unclear)',
      license_url: 'https://monesport.cat/es/fc-barcelona/la-jornada/frenkie-de-jong-gran-senalado-osasuna-364031/',
      file: 'https://monesport.cat/app/uploads/sites/12/2023/09/europapress_5443700_frenkie_jong_of_fc_…',
    },
  },
  {
    number: 22,
    name: 'Marc Bernal',
    position: 'MF',
    role: 'Midfielder',
    nat: 'ESP',
    armband: null,
    bio: 'Marc Bernal Casas is a Spanish defensive midfielder for Barcelona and Spain. A La Masia holding midfielder who lost a season to a cruciate injury weeks after breaking into the XI at seventeen, he is now the understudy learning the position from Rodri.',
    image: asset('players/marc-bernal.jpg'),
    attribution: {
      artist: 'Source: web search (Bing)',
      license: 'Internet (copyright unclear)',
      license_url: 'https://monesport.cat/barca/jugadors/marc-bernal-triomfador-atletic-copa-473884/',
      file: 'https://monesport.cat/app/uploads/sites/12/2026/03/europapress_7335693_marc_bernal_of_fc_b…',
    },
  },
  {
    number: 10,
    name: 'Lamine Yamal',
    position: 'FW',
    role: 'Forward',
    nat: 'ESP',
    armband: null,
    bio: 'Lamine Yamal Nasraoui Ebana is a Spanish right winger for Barcelona and Spain, widely regarded as one of the best players in the world. A La Masia graduate who joined the first team at fifteen, he won the Kopa Trophy in 2024 and 2025 and now wears the ten.',
    image: asset('players/lamine-yamal.jpg'),
    attribution: {
      artist: 'Source: Bing',
      license: 'Internet (copyright unclear)',
      license_url: 'https://www.sportingnews.com/es/futbol/news/record-goleador-mas-joven-clasico-barcelona-real-madrid-lamine-yamal/83f5212bf1eb0f66d52c5a51',
      file: 'https://library.sportingnews.com/styles/twitter_card_120x120/s3/2024-10/Lamine%20Yamal%20B…',
    },
  },
  {
    number: 11,
    name: 'Raphinha',
    position: 'FW',
    role: 'Forward',
    nat: 'BRA',
    armband: 'captain',
    bio: 'Raphael Dias Belloli, known mononymously as Raphinha, is a Brazilian winger and forward for Barcelona — which he now captains — and Brazil. With the nine vacant he has moved into the middle, and scored in each of the first three matchdays of 2026-27.',
    image: asset('players/raphinha.jpg'),
    attribution: {
      artist: 'Source: web search (Bing)',
      license: 'Internet (copyright unclear)',
      license_url: 'https://www.dazn.com/es-MX/news/f%C3%BAtbol/cuantos-goles-raphinha-champions-league-fc-barcelona/7fz0h3bnsjbi1joh11b95ku8d',
      file: 'https://images.daznservices.com/di/library/DAZN_News/b3/6/raphinha-fc-barcelona-champions-…',
    },
  },
  {
    number: 14,
    name: 'Karim Adeyemi',
    position: 'FW',
    role: 'Forward',
    nat: 'GER',
    armband: null,
    bio: 'Karim David Adeyemi is a German right winger and forward for Barcelona and Germany, signed from Borussia Dortmund in July 2026 for €22M. Straight-line pace to stretch the sides that sit deep against Barça — he scored on his league debut at Elche.',
    image: asset('players/karim-adeyemi.jpg'),
    attribution: {
      artist: 'Werner100359',
      license: 'CC BY-SA 4.0',
      license_url: 'https://creativecommons.org/licenses/by-sa/4.0',
      file: 'File:FC Salzburg gegen FC Bayern München (Championsleague Achtelfinale Hinspiel 16. Februar 2022) 63.jpg',
    },
  },
  {
    number: 17,
    name: 'Anthony Gordon',
    position: 'FW',
    role: 'Forward',
    nat: 'ENG',
    armband: null,
    bio: 'Anthony Michael Gordon is an English left winger for Barcelona and England, and at €70M the most expensive signing of the summer. An Everton academy product who won a League Cup at Newcastle, he takes the left flank vacated by Rashford and Ferran Torres.',
    image: asset('players/anthony-gordon.jpg'),
    attribution: {
      artist: 'YantsImages',
      license: 'CC BY-SA 4.0',
      license_url: 'https://creativecommons.org/licenses/by-sa/4.0',
      file: 'File:Team England England v Ghana at 2026 Fifa World Cup by YantsImages 03 (Anthony Gordon).jpg',
    },
  },
  {
    number: 19,
    name: 'Roony Bardghji',
    position: 'FW',
    role: 'Forward',
    nat: 'SWE',
    armband: null,
    bio: 'Roony Bardghji is a right winger for Barcelona. Born in Kuwait and raised in Sweden, whom he represents, he arrived from Copenhagen in 2025 as one of the most-tracked teenagers in Scandinavian football.',
    image: asset('players/roony-bardghji.jpg'),
    attribution: {
      artist: 'Source: web search (Bing)',
      license: 'Internet (copyright unclear)',
      license_url: 'https://sport.dk/fc-barcelona',
      file: 'https://r.testifier.nl/Acbs8526SDKI/resizing_type:fill/width:3840/height:2560/plain/https:…',
    },
  },
  {
    number: 27,
    name: 'Jesse Bisiwu',
    position: 'FW',
    role: 'Forward',
    nat: 'BEL',
    armband: null,
    bio: 'Jesse Eugen K. Bisiwu is a Belgian winger for Barcelona, signed from Club Brugge in July 2026 for €8.5M at eighteen. The squad’s youngest player, and the one bet in this window that is purely about 2030.',
    image: '',
    attribution: NO_PHOTO,
  },
];

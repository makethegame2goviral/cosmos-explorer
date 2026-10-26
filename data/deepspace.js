export const SUN = {
  id: "sun",
  name: "Sonne",
  type: "Stern (Gelber Zwerg)",
  color: 0xffc65c,
  source: "https://science.nasa.gov/sun/",
  stats: [
    { value: "1.392.700 km", label: "Durchmesser" },
    { value: "5.500 °C", label: "Oberfläche" },
    { value: "15,7 Mio. °C", label: "Kern" },
    { value: "99,86 %", label: "Masse des Systems" }
  ],
  description:
    "Die Sonne ist unser Zentralgestirn: ein riesiger Fusionsreaktor, der jede Sekunde Millionen Tonnen Wasserstoff in Helium umwandelt und dabei Licht und Wärme für das ganze Sonnensystem liefert.",
  facts: [
    "In der Sonne passen rund 1,3 Millionen Erden.",
    "Licht braucht 8 Minuten und 20 Sekunden von der Sonne zur Erde.",
    "Die Sonne ist bereits 4,6 Milliarden Jahre alt.",
    "Ihr Brennstoff reicht noch etwa 5 Milliarden Jahre."
  ]
};

export const DEEPSPACE = [
  {
    id: "milkyway",
    name: "Milchstraße",
    type: "Balken-Spiralgalaxie",
    color: 0x9fc4ff,
    viewDistance: 160,
    source: "https://science.nasa.gov/universe/galaxies/",
    stats: [
      { value: "100.000 Lichtjahre", label: "Durchmesser" },
      { value: "100–400 Mrd.", label: "Sterne" },
      { value: "230 Mio. Jahre", label: "Umlauf der Sonne" },
      { value: "Sagittarius A*", label: "Zentrales Schwarzes Loch" }
    ],
    description:
      "Die Milchstraße ist unsere Heimatgalaxie. Die Sonne mit all ihren Planeten liegt in einem der Spiralarme, etwa 26.000 Lichtjahre vom Zentrum entfernt. (Darstellung schematisch, nicht maßstabsgetreu.)",
    facts: [
      "Bei dunklem Himmel sieht man die Milchstraße als milchiges Band.",
      "Unsere Sonne benötigt rund 230 Millionen Jahre für einen Umlauf um das Galaktische Zentrum.",
      "Die Milchstraße wird sich vermutlich in einigen Milliarden Jahren mit der Andromeda-Galaxie vereinen.",
      "Alles, was man mit bloßem Auge sieht, gehört zur Milchstraße – bis auf wenige Ausnahmen."
    ]
  },
  {
    id: "andromeda",
    name: "Andromeda-Galaxie",
    type: "Spiralgalaxie (M31)",
    color: 0xffd9b0,
    viewDistance: 150,
    source: "https://science.nasa.gov/universe/galaxies/andromeda-galaxy/",
    stats: [
      { value: "220.000 Lichtjahre", label: "Durchmesser" },
      { value: "2,5 Mio. Lichtjahre", label: "Entfernung" },
      { value: "~1 Billion", label: "Sterne" },
      { value: "M31", label: "Katalogbezeichnung" }
    ],
    description:
      "Die Andromeda-Galaxie ist die nächste große Nachbargalaxie der Milchstraße und mit bloßem Auge sichtbar. Sie nähert sich uns und wird in etwa 4,5 Milliarden Jahren mit der Milchstraße verschmelzen.",
    facts: [
      "Andromeda ist die am weitesten entfernte Sache, die man mit bloßem Auge sehen kann.",
      "Sie bewegt sich mit rund 110 km/s auf die Milchstraße zu.",
      "In ihr Zentrum steckt ein Schwarzes Loch von etwa 100 Millionen Sonnenmassen.",
      "Aus großer Distanz sieht sie fast aus wie unsere eigene Galaxie."
    ]
  },
  {
    id: "blackhole",
    name: "Sagittarius A*",
    type: "Supermassereiches Schwarzes Loch",
    color: 0xffa040,
    viewDistance: 60,
    source: "https://science.nasa.gov/universe/black-holes/",
    stats: [
      { value: "4,3 Mio. Sonnenmassen", label: "Masse" },
      { value: "26.000 Lichtjahre", label: "Entfernung zur Erde" },
      { value: "Zentrum der Milchstraße", label: "Position" },
      { value: "2022", label: "Erstes Foto (Event Horizon Telescope)" }
    ],
    description:
      "Sagittarius A* ist das supermassereiche Schwarze Loch im Zentrum der Milchstraße. Nichts, was einmal hineinfällt, kann wieder entkommen – nicht einmal Licht. Die Galaxie wird übrigens vor allem durch ihre Gesamtmasse zusammengehalten, nicht allein durch das Schwarze Loch.",
    facts: [
      "Schwarze Löcher sind keine Löcher, sondern extrem verdichtete Materie.",
      "Der leuchtende Ring entsteht durch Gas, das sich mit riesiger Geschwindigkeit umkreist.",
      "2022 gelang das erste Foto von Sagittarius A*.",
      "Die Zeit läuft in der Nähe eines Schwarzen Lochs langsamer ab."
    ]
  },
  {
    id: "orion",
    name: "Orionnebel",
    type: "Sternentstehungsregion",
    color: 0xff6ec7,
    viewDistance: 60,
    source: "https://science.nasa.gov/solar-system/orion-nebula/",
    stats: [
      { value: "1.344 Lichtjahre", label: "Entfernung" },
      { value: "24 Lichtjahre", label: "Ausdehnung" },
      { value: "~700 Sterne", label: "Junge Sterne im Entstehen" },
      { value: "M42", label: "Katalogbezeichnung" }
    ],
    description:
      "Der Orionnebel ist eine gigantische Wolke aus Gas und Staub, in der gerade neue Sterne geboren werden. Er ist einer der am besten erforschten Himmelskörper überhaupt.",
    facts: [
      "Der Nebel ist mit bloßem Auge unter dem Gürtel des Orion sichtbar.",
      "In ihm entstehen gerade Tausende neue Sonnen.",
      "Die Farben zeigen Wasserstoff, Sauerstoff und Staub unterschiedlicher Temperatur.",
      "Er ist erst rund 2 Millionen Jahre alt – kosmisch gesehen ein Baby."
    ]
  },
  {
    id: "comet",
    name: "Halleyscher Komet",
    type: "Komet",
    color: 0xaef2ff,
    viewDistance: 14,
    source: "https://science.nasa.gov/solar-system/comets/1p-halley/",
    stats: [
      { value: "76 Jahre", label: "Umlaufzeit" },
      { value: "11 km", label: "Kern-Durchmesser" },
      { value: "2061", label: "Nächster Vorbeiflug" },
      { value: "1986", label: "Letzter Besuch (Giotto-Sonde)" }
    ],
    description:
      "Der Halleysche Komet ist der berühmteste Komet und kommt ungefähr alle 76 Jahre zurück. Seine zwei Schweife zeigen immer von der Sonne weg – angetrieben vom Sonnenwind.",
    facts: [
      "Er war schon im Jahr 240 v. Chr. aufgezeichnet worden.",
      "1986 flog die ESA-Sonde Giotto an ihm vorbei.",
      "Seine Schweife können Millionen Kilometer lang werden.",
      "Beim Vorbeiflug 1910 war er spektakulär hell."
    ]
  }
];

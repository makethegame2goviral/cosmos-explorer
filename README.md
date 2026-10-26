# 🌌 Cosmos Explorer 3D

Cosmos Explorer ist eine interaktive 3D-Weltraum-Website. Fliege frei durch ein animiertes Sonnensystem, entdecke Planeten, Galaxien und ein Schwarzes Loch – und teste dein Wissen im Weltraum-Quiz.

## Features

- Echtes 3D-Sonnensystem mit Three.js
- **Freie Kamera**: Ziehen zum Drehen, Scrollen zum Zoomen (bis weit hinaus), Rechtsklick-Ziehen zum Verschieben und **WASD/Pfeiltasten zum Fliegen** (Q/E für hoch/runter, Shift für Turbo)
- **Echte Planeten-Texturen** (Erde mit Kontinenten, Wolken und Mond; Jupiter mit Bändern; Saturn mit Ringen)
- Acht klickbare Planeten plus Sonne mit Detail-Panel
- **Deep-Space-Objekte**: Milchstraße und Andromeda-Galaxie als Spiralgalaxien, Sagittarius A* (Schwarzes Loch mit Akkretionsscheibe), Orionnebel und der Halleysche Komet mit Schweif – alle anklickbar mit Infos
- Monde um Erde, Mars, Jupiter und Saturn
- Voyager-1- und Voyager-2-Raumsonden mit sichtbaren Missionsrouten
- Asteroidengürtel mit 1.800 animierten Asteroiden
- Weltraum-Quiz mit 10 Fragen, Punkten und Abzeichen
- Helle, sichtbare Szene mit Glow-Effekten und 14.000 Sternen
- Responsives Interface für Desktop und Mobile

## Technologien

- HTML5
- CSS3
- JavaScript ES Modules
- Three.js (OrbitControls, Sprites, Points, InstancedMesh, Canvas-Texturen)

## Starten

```bash
npx serve .
```

Danach öffne die angezeigte Adresse im Browser. Die Website läuft auch direkt auf GitHub Pages (Settings → Pages → Visit site).

## Credits

- Planetentexturen: James Hastings-Trew (Planet Pixel Emporium) via [threex.planets](https://github.com/jeromeetienne/threex.planets) (MIT-Lizenz)
- Three.js wird über CDN (unpkg) geladen

## Roadmap

- [ ] Nutzerkonten und gespeicherte Highscores
- [ ] Exoplaneten-Modus
- [ ] Soundeffekte

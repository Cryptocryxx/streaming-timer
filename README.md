# Streaming Timer

Großer, gut sichtbarer Countdown, der remote gesteuert wird. Läuft komplett statisch über GitHub Pages.

- **Anzeige:** `https://cryptocryxx.github.io/streaming-timer/` (z. B. als OBS-Browserquelle, Klick = Vollbild)
- **Admin:** `https://cryptocryxx.github.io/streaming-timer/admin/` (Passwort in `config.js`, Standard `timer123`)

## Verhalten (alles im Admin einstellbar)
- Bei noch 10 Minuten: einmal orange blinken
- Bei noch 1 Minute: dauerhaft orange
- Ab 10 Sekunden: rot blinkend
- Farben, Titel, Ablauf-Text und alle Schwellen sind konfigurierbar

## Funktionsweise
Admin sendet den Zustand per HTTP an [ntfy.sh](https://ntfy.sh) (Topic aus `config.js`), die Anzeige abonniert das Topic per SSE.
Die Anzeige rechnet die Restzeit selbst aus (Endzeitpunkt), daher läuft sie flüssig und der Admin kann den Tab schließen.

## Einrichtung
1. Repo-Settings → Pages → Branch `main`, Ordner `/ (root)`.
2. In `config.js` Passwort und Topic ändern (Topic geheim halten – wer es kennt, kann den Timer steuern).

Hinweis: Das Passwort ist clientseitig und nur ein einfacher Schutz. Die Geräteuhren sollten korrekt gehen (Endzeitpunkt wird als absolute Zeit übertragen).

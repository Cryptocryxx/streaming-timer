// Zentrale Konfiguration
window.TIMER_CONFIG = {
  // Admin-Passwort (steht im Klartext im Quelltext -> nur ein einfacher Schutz, kein echtes Sicherheitsmerkmal)
  adminPassword: "timer123",

  // Kanal, über den Admin und Anzeige sich synchronisieren (ntfy.sh, kostenlos, ohne Account).
  // Wer diesen Namen kennt, kann den Timer steuern -> geheim halten bzw. ändern.
  topic: "streaming-timer-712a9be0cba7c52efeafbcca",
  server: "https://ntfy.sh"
};

# WLAN-Gluecksrad auf GitHub und Render hochladen

## 1. GitHub-Repository erstellen

1. Gehe auf https://github.com
2. Klicke oben rechts auf `+` und dann auf `New repository`.
3. Name zum Beispiel: `wlan-gluecksrad`
4. Waehle `Public` oder `Private`.
5. Klicke auf `Create repository`.

## 2. Projekt hochladen

Oeffne in Windows den Ordner:

```text
C:\Wlan_Gluecksrad
```

Lade alle Dateien und Ordner hoch:

```text
index.html
server.js
package.json
render.yaml
img
sounds
```

Wichtig: `server.js`, `package.json` und `render.yaml` muessen mit hochgeladen werden.

## 3. Render Web Service erstellen

1. Gehe auf https://render.com
2. Melde dich an.
3. Klicke auf `New` und dann auf `Web Service`.
4. Verbinde Render mit GitHub.
5. Waehle dein Repository `wlan-gluecksrad`.
6. Render sollte durch die `render.yaml` vieles automatisch erkennen.

Falls du es manuell eintragen musst:

```text
Runtime: Node
Build Command: npm install
Start Command: npm start
Plan: Free
Health Check Path: /health
```

7. Klicke auf `Create Web Service`.
8. Warte, bis Render fertig deployed hat.
9. Danach bekommst du eine Adresse wie:

```text
https://wlan-gluecksrad.onrender.com
```

## 4. Online spielen

1. Spieler 1 oeffnet die Render-Adresse.
2. Spieler 1 waehlt in den Einstellungen `Online mit Code`.
3. Spieler 1 klickt auf `Raum erstellen`.
4. Spieler 1 nennt Spieler 2 den Code.
5. Spieler 2 oeffnet dieselbe Render-Adresse.
6. Spieler 2 waehlt `Online mit Code`.
7. Spieler 2 gibt den Code ein.
8. Spieler 1 traegt die Spielernamen ein und startet das Spiel.
9. Spieler 2 klickt nach Eingabe des Codes auf `Beitreten`.

## Hinweise zum Free Plan

- Render Free kann nach Inaktivitaet einschlafen.
- Beim ersten Oeffnen kann das Spiel deshalb etwa eine Minute brauchen.
- Wenn der Server neu startet oder einschlaeft, gehen offene Spielraeume verloren.
- Fuer privates Spielen und Tests reicht das normalerweise aus.

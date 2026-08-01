# TV Alzey Laufteam – GitHub Pages

Diese Website ist vollständig statisch und für GitHub Pages vorbereitet.

## Erste Veröffentlichung

1. Bei GitHub ein neues Repository erstellen.
2. Den Inhalt dieser ZIP-Datei entpacken.
3. **Alle Dateien und Ordner aus dem entpackten Hauptordner** in das Repository hochladen.
4. Im Repository **Settings** öffnen.
5. Links **Pages** auswählen.
6. Unter **Build and deployment** die Option **Deploy from a branch** wählen.
7. Branch **main** und Ordner **/(root)** auswählen.
8. Speichern.
9. Nach einigen Minuten zeigt GitHub die veröffentlichte Adresse an.

## Spätere Änderungen hochladen

1. Im Repository **Add file** → **Upload files** wählen.
2. Die geänderten Dateien hochladen.
3. Bei vorhandenen Dateien das Überschreiben bestätigen.
4. Unten **Commit changes** anklicken.
5. GitHub Pages veröffentlicht die Änderung automatisch neu.

## Wettkampfkalender aktualisieren

Die Datei `laufveranstaltungen.json` ersetzen oder bearbeiten. Die Seite `veranstaltungen.html` lädt sie mit `fetch("laufveranstaltungen.json")`.

## Wichtig

- Keine Dateinamen ändern, ohne auch die Links anzupassen.
- Beim direkten lokalen Öffnen per Doppelklick kann der Browser das Laden der JSON-Datei blockieren. Auf GitHub Pages funktioniert es.


## Browser-Tab und App-Symbol
Die Favicon-Dateien und `site.webmanifest` liegen im Ordner `assets/logo/` und werden bereits auf allen Seiten eingebunden.


## Blog und Galerie

Die Unterseiten liegen in den Ordnern `blog/` und `galerie/`. Neue Berichte oder Galerien können dort als weitere HTML-Dateien ergänzt und anschließend auf `blog.html` beziehungsweise `galerie.html` verlinkt werden.

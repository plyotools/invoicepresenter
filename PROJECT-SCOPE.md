# Invoice Presenter - Komplett Prosjektbeskrivelse

## Oversikt
En React-applikasjon for å vise og behandle faktura-data fra Excel-filer. Appen lar brukere laste opp Excel-filer, vise data i en tabell, og markere rader som "Done" med en morsom bekreftelsesmelding.

## Teknisk Stack
- **Framework**: React 18+ med TypeScript
- **Build Tool**: Vite
- **UI Library**: Mantine v7
- **Excel Parsing**: XLSX library
- **Testing**: Playwright
- **Deployment**: GitHub Pages

## Funksjonalitet

### 1. Excel File Upload
- Støtter `.xlsx` og `.xls` filer
- Validerer at filen inneholder påkrevde kolonner:
  - Account Name
  - Issue Key
  - Issue summary
  - Work Description
  - Logged Hours
  - Work date
  - Full name
- Sorterer data alfabetisk etter Account Name
- Viser feilmeldinger hvis filen mangler kolonner eller er tom

### 2. Data Display (Table)
- Viser data i en responsiv tabell med:
  - Striped rows (alternerende bakgrunnsfarger)
  - Hover-effekt
  - Faste kolonnebredder (12.5% hver)
  - Border styling
- Issue Key er en klikkbar lenke til Atlassian Jira:
  - Format: `https://plyolabs.atlassian.net/browse/{issueKey}`
  - Åpnes i ny fane
- Work Description har en kopier-knapp:
  - Kopierer teksten til clipboard
  - Viser bekreftelse (grønn checkmark) i 2 sekunder
- Rader som er markert som "Done" får grønn bakgrunnsfarge (#e8f5e9)

### 3. Done Button Funksjonalitet
- Hver rad har en "Done" knapp i siste kolonne
- Når knappen klikkes:
  - Raden markeres som "Done" (grønn bakgrunn)
  - Knappen blir grønn (#51cf66) med hvit tekst
  - En tilfeldig norsk bekreftelsesmelding vises
- Når knappen klikkes igjen (unmark):
  - Raden unmarkeres
  - Knappen går tilbake til normal stil
  - Bekreftelsesmeldingen fjernes

### 4. Confirmation Message System
- Viser en grønn alert-boks når en rad markeres som "Done"
- Format:
  - Ikon: 💰
  - Tittel: "💰 Done!"
  - Melding: Tilfeldig valgt fra en liste på 200 norske meldinger
- Auto-hide: Meldingen forsvinner automatisk etter 5 sekunder
- Kan også lukkes manuelt med en X-knapp

### 5. Norske Bekreftelsesmeldinger
- 200 tilfeldige, morsomme norske meldinger
- Eksempler:
  - "Trykk "send" – la inntekten kjenne at du mener det. 👰"
  - "Hold prisen stram – marginen blir kåt av disiplin. 👰"
  - "Få fakturaen inn i systemet før du rekker å bli snill. 👰"
- Alle meldinger ender med 👰 emoji
- Meldinger er lagret i `src/doneMessages.ts` som en array
- Funksjon `getRandomDoneMessage()` returnerer en tilfeldig melding

## UI/UX Detaljer

### Layout
- Container: Mantine Container med size="xl"
- Padding: py="xl" (vertical padding)
- Stack layout med gap="lg" mellom elementer

### Styling
- Title: "💰 Invoice Presenter" (med moneybag emoji)
- File Input: Mantine FileInput med upload ikon
- Table: Mantine Table med:
  - Striped rows
  - Hover highlight
  - Table borders
  - Column borders
  - Fixed layout
  - Vertical spacing: "sm"
  - Horizontal spacing: "md"

### Done Button
- Normal state:
  - Transparent bakgrunn
  - Grå border (#ccc)
  - Mørk tekst (#333)
- Done state:
  - Grønn bakgrunn (#51cf66)
  - Hvit tekst
  - Ingen border
- Styling:
  - Padding: 4px 12px
  - Font size: 12px
  - Border radius: 4px
  - Cursor: pointer

### Confirmation Alert
- Bakgrunnsfarge: #d4edda (lys grønn)
- Border: 1px solid #c3e6cb
- Tekstfarge: #155724 (mørk grønn)
- Padding: 12px 16px
- Border radius: 4px
- Margin bottom: 16px

## Filstruktur

```
src/
  ├── App.tsx              # Hovedkomponent
  ├── main.tsx             # Entry point
  └── doneMessages.ts      # Array med 200 norske meldinger

test-done-message.spec.ts  # Playwright test
package.json               # Dependencies
vite.config.ts            # Vite config med base path
```

## Dependencies

### Production
- `react` & `react-dom`
- `@mantine/core` (v7)
- `@tabler/icons-react` (for ikoner)
- `xlsx` (for Excel parsing)

### Development
- `@playwright/test` (for testing)
- `typescript`
- `vite`

## GitHub Pages Deployment

### Konfigurasjon
- Base path: `/invoicepresenter/`
- Build output: `./dist`
- `.nojekyll` fil i dist for å deaktivere Jekyll processing

### GitHub Actions Workflow
- Trigger: Push til main branch
- Steps:
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies
  4. Build app (`npm run build`)
  5. Create `.nojekyll` fil
  6. Deploy til GitHub Pages

## Testing

### Playwright Test
- Test: `test-done-message.spec.ts`
- Sjekker:
  - At Done-knappen er synlig
  - At klikk på knappen viser bekreftelsesmelding
  - At meldingen forsvinner etter 5 sekunder

## Known Issues / Challenges

1. **React Rendering**: Appen rendres ikke alltid korrekt i nettleseren (mulig cache-issue eller import-problem)
2. **Button Detection**: Testen har problemer med å finne knapper (mulig Mantine Button vs HTML button issue)
3. **State Management**: React state updates kan være asynkrone og kreve ekstra ventetid i tester

## Neste Steg for Nytt Prosjekt

1. **Opprett nytt prosjekt**:
   ```bash
   npm create vite@latest invoice-presenter -- --template react-ts
   cd invoice-presenter
   npm install
   ```

2. **Installer dependencies**:
   ```bash
   npm install @mantine/core @mantine/hooks @tabler/icons-react xlsx
   npm install -D @playwright/test @types/node
   ```

3. **Kopier doneMessages.ts** fra dette prosjektet

4. **Implementer funksjonalitet i denne rekkefølgen**:
   - Først: Enkel Done-knapp og bekreftelsesmelding (uten Excel)
   - Deretter: Excel upload og tabell-visning
   - Til slutt: Integrer Done-funksjonalitet i tabellen

5. **Test hver del separat** før du går videre til neste

6. **Deploy til GitHub Pages** når alt fungerer lokalt

## Viktige Lærdommer

- Start minimalt: Implementer én funksjon om gangen
- Test tidlig: Verifiser at hver del fungerer før du legger til mer
- Bruk enkle HTML elementer først: Ikke Mantine Button hvis vanlig HTML button fungerer
- Sjekk konsollen: JavaScript-feil kan forhindre rendering
- Cache kan være et problem: Restart dev server og hard refresh nettleser


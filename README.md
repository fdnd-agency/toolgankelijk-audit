# Vervoerregio Amsterdam | Toolgankelijk | Audit backend-applicatie

Live link: [https://toolgankelijk-audit.onrender.com](https://toolgankelijk-audit.onrender.com)

## Inhoudsopgave

- [Beschrijving](#beschrijving)
- [Kenmerken](#kenmerken)
- [Installatie](#installatie)
- [Projectteam 2025](#projectteam-2025)
- [Bronnen](#bronnen)

## Beschrijving

Deze backend-applicatie ondersteunt de partners van **Vervoerregio Amsterdam** bij het waarborgen van de toegankelijkheid van hun websites volgens de WCAG-richtlijnen.

De auditservice biedt drie endpoints die samen het auditproces mogelijk maken:

- **Periodieke audit van alle partners:** Hiermee kunnen automatisch alle pagina's van alle partners gecontroleerd worden op toegankelijkheid. Dit wordt gebruikt voor periodieke controles, zodat partners inzicht houden in de status van hun websites.
- **Audit per partner:** Hiermee kan een gebruiker handmatig een audit starten voor alle pagina's van een specifieke partner.
- **Status-check van de applicatie:** Met dit endpoint kan gecontroleerd worden of deze backend-applicatie actief is.

## Kenmerken

Deze applicatie is gemaakt met Svelte en SvelteKit. De toegankelijkheidstests worden uitgevoerd door axe-core. Puppeteer wordt gebruikt om automatisch een browser te openen en webpagina’s te laden voor het uitvoeren van de audits. De gegevens van de audit testresultaten worden opgeslagen in Hygraph, met behulp van GraphQL. Zo blijft alle informatie over de toegankelijkheid van websites overzichtelijk en makkelijk op te vragen.

De volgende technieken en technologiën zijn gebruikt:

- Svelte
- SvelteKit
- Hygraph
- GraphQL
- Puppeteer
- axe-core

## Installatie

```
1. Clone de repository
2. Open de repo in een IDE
3. Installeer npm packages d.m.v. npm install
4. Maak een `.env` bestand aan in de root van het project en vul de benodigde variabelen in (zie `example.env` voor de juiste namen en structuur)
5. Run de localhost d.m.v. npm run dev
```

## Projectteam 2025

- [Bjarne](https://github.com/bzschool) – Backend developer

## Bronnen

[Puppeteer](https://pptr.dev/) <br>
[axe-core](https://github.com/dequelabs/axe-core) <br>
[Hygraph mutation](https://hygraph.com/docs/api-reference/content-api/mutations) <br>

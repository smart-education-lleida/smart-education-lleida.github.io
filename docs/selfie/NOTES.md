# SELFIE IA · notes del projecte

Eina: [`/selfie-ia-fecc.html`](../../selfie-ia-fecc.html), un sol fitxer HTML sense dependències.
Versió actual: **5.0** (14/11/2026) · SHA-256 `dcf36ff60829d26a720c04d85ed1d55bc9668ef36b546a97c3c08a608ec43f9b`

Aquest fitxer és la memòria del projecte: les converses es poden perdre, el repositori no.
Cada canvi important s'apunta aquí.

## Documents
- `SELFIE-IA-proposta-tecnica.pdf`: proposta tècnica v5.0, en la línia de l'informe tècnic del Generador IRIS. Sense referències al POC.
- `SELFIE-IA-presentacio-Grup-Experts.pdf`: presentació per al Grup d'Experts (11 diapositives, v5.0).
- `SELFIE-IA-guia-Com-fer-una-ronda.pdf`: guia per a equips directius (octubre 2026, encara vàlida).
- `proves/tests.js`: 34 comprovacions automàtiques amb Chrome sense interfície (`node tests.js ../../../selfie-ia-fecc.html captures/`).

## Decisions preses
- **Sense POC.** Els documents són autònoms; no es menciona el POC previ.
- **Escala 0–3**: A Inicial · B Bàsica · C Intermèdia · D Avançada (etapes del Departament).
- **Mediana baixa com a estadístic central.** Amb un nombre parell de dades es pren el valor central inferior (criteri conservador). Unitat: el docent. Etapa d'un docent = mediana baixa de les seves 20 respostes; valor d'un grup = mediana baixa dels docents. Es calcula sempre sobre tots els codis, mai sobre medianes de subgrups (les instantànies guarden codis, no resultats).
- **Empats** de mediana: per proporcions de la distribució (% en intermèdia o avançada, % en inicial), mai per la mitjana.
- **La mitjana es conserva** només a l'índex 0–100 i com a línia de punts opcional als radars.
- **Polarització**: ≥ 25% de docents en inicial i ≥ 25% en avançada alhora. Substitueix l'antiga «cohesió» (desviació estàndard). S'aplica a equip, dimensió i xarxa.
- **DAFO amb regles ordinals**: fortalesa = mediana ≥ Intermèdia; debilitat = mediana Inicial o dimensió polaritzada; situació 7 i 20 amb mediana ≤ Bàsica; situació 19 ≥ Intermèdia; diferència entre etapes educatives = etapa predominant diferent.
- **Pla de millora**: «assolit» si la mediana arriba a l'objectiu; «en progrés» si encara no, però els docents a l'objectiu o més pugen ≥ 5 punts.
- **Capçalera**: El meu SELFIE · Equip · Xarxa · Evolució. Evolució va al final, al costat dels idiomes, amb un fons diferent: les tres primeres són instantànies; Evolució en compara dues.
- **Declaració IRIS**: IRIS-5, Claude Fable 5.2, novembre 2026 (segell regenerat amb el Generador IRIS).

## Pendent del Grup d'Experts
- Nom («SELFIE» és marca de la Comissió Europea).
- Opció A de les situacions 13, 14, 16 i 18 (no-ús vs. manca de competència).
- Confirmar la mediana baixa i si es manté l'índex 0–100.
- Mida mínima de grup (5) i perfils individuals anònims.
- Llindars: polarització 25/25, «en progrés» 5 punts, regles de la DAFO (pilot amb 2–3 centres).
- Traduccions castellà i anglès; allotjament a fecc.cat.

## Historial
- 10–11/10/2026 · v4.2: prototip, evolució, xarxa, codi SF2, trilingüe, accessibilitat.
- 14/11/2026 · v5.0: mediana baixa, polarització, ordre de pestanyes, taules desplaçables al mòbil; proposta i presentació refetes.

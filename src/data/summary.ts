import { MODULES } from '@/data/modules';
import type { ModuleState } from '@/types';

const DECISION_FIELDS: { key: 'stay_pros' | 'stay_cons' | 'change_pros' | 'change_cons'; label: string }[] = [
  { key: 'stay_pros', label: 'Fördelar med att stanna' },
  { key: 'stay_cons', label: 'Nackdelar med att stanna' },
  { key: 'change_pros', label: 'Fördelar med förändring' },
  { key: 'change_cons', label: 'Utmaningar med förändring' },
];

const DEFAULT_LIFE_AREAS = [
  { key: 'relations', label: 'Relationer', rating: 5 },
  { key: 'health', label: 'Hälsa', rating: 5 },
  { key: 'economy', label: 'Ekonomi', rating: 5 },
  { key: 'routine', label: 'Vardagsstruktur', rating: 5 },
  { key: 'growth', label: 'Personlig utveckling', rating: 5 },
];

export function buildModuleSummary(
  moduleId: string,
  title: string,
  state: ModuleState
): string {
  const lines: string[] = [];
  lines.push(`# ${title}`);
  lines.push('');

  if (moduleId === 'life_areas') {
    const areas = state.lifeAreas ?? DEFAULT_LIFE_AREAS;
    lines.push('## Mitt nuläge');
    areas.forEach((a) => lines.push(`- ${a.label}: ${a.rating}/10`));
    const avg = Math.round((areas.reduce((s, a) => s + a.rating, 0) / areas.length) * 10) / 10;
    lines.push(`- Snitt: ${avg}/10`);
    if (state.lifeFocus) lines.push('', 'Fokusområde:', state.lifeFocus);
  }

  if (moduleId === 'self_talk') {
    lines.push('## Omformulera tanken');
    (state.reframes ?? []).forEach((r, i) => {
      lines.push(`### Rad ${i + 1}`);
      if (r.critic) lines.push(`Kritikern: ${r.critic}`);
      if (r.mentor) lines.push(`Mentorn: ${r.mentor}`);
      lines.push('');
    });
  }

  if (moduleId === 'expectations') {
    lines.push('## Förväntningsfiltret');
    const duty = (state.expectations ?? []).filter((i) => i.kind === 'duty' && i.text.trim());
    const will = (state.expectations ?? []).filter((i) => i.kind === 'will' && i.text.trim());
    lines.push('### Av plikt');
    duty.forEach((d) => lines.push(`- ${d.text}`));
    lines.push('', '### Av egen vilja');
    will.forEach((w) => lines.push(`- ${w.text}`));
    if (state.noTemplate) lines.push('', 'Mitt nej:', state.noTemplate);
  }

  if (moduleId === 'change_process') {
    lines.push('## Beslutsbalansen');
    if (state.decisionGoal) lines.push(`Förändring: ${state.decisionGoal}`, '');
    DECISION_FIELDS.forEach((f) => {
      const v = state.decision?.[f.key];
      if (v?.trim()) lines.push(`### ${f.label}`, v, '');
    });
  }

  if (moduleId === 'values_clarification') {
    lines.push('## Värderingskompassen');
    const ranked = state.valuesRanked ?? [];
    if (ranked.length > 0) {
      ranked.forEach((v, i) => lines.push(`${i + 1}. ${v}`));
    } else {
      lines.push('(Inga värderingar valda)');
    }
    if (state.valuesActions) lines.push('', 'Handling:', state.valuesActions);
  }

  if (moduleId === 'stress_recovery') {
    lines.push('## Energibalansen');
    const sources = state.energySources ?? [];
    const drains = state.energyDrains ?? [];
    lines.push('### Energikällor');
    if (sources.length > 0) sources.forEach((s) => lines.push(`- ${s}`));
    else lines.push('(Inga källor)');
    lines.push('', '### Energigissar');
    if (drains.length > 0) drains.forEach((d) => lines.push(`- ${d}`));
    else lines.push('(Inga gissar)');
    if (state.recoveryPlan) lines.push('', 'Återhämtningsplan:', state.recoveryPlan);
  }

  if (moduleId === 'relationship_boundaries') {
    lines.push('## Tydliga gränser');
    const entries = state.boundaryEntries ?? [];
    if (entries.length === 0) {
      lines.push('(Inga gränser beskrivna)');
    } else {
      entries.forEach((e, i) => {
        lines.push(`### Situation ${i + 1}`);
        if (e.situation) lines.push(`Situation: ${e.situation}`);
        if (e.boundary) lines.push(`Gräns: ${e.boundary}`);
        lines.push('');
      });
    }
  }

  if (moduleId === 'self_compassion') {
    lines.push('## Självmedkänsla');
    const entries = state.compassionEntries ?? [];
    if (entries.length === 0) {
      lines.push('(Inga övningar)');
    } else {
      entries.forEach((e, i) => {
        lines.push(`### Rad ${i + 1}`);
        if (e.struggle) lines.push(`Hård mot mig själv: ${e.struggle}`);
        if (e.kindResponse) lines.push(`Vänligt svar: ${e.kindResponse}`);
        lines.push('');
      });
    }
    if (state.compassionLetter) lines.push('Brev till mig själv:', state.compassionLetter);
  }

  return lines.join('\n');
}

export function buildFullSummary(states: Record<string, ModuleState>): string {
  return MODULES.map((m) => buildModuleSummary(m.id, m.title, states[m.id]))
    .join('\n\n---\n\n');
}

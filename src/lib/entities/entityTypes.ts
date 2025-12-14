export const ENTITY_KINDS = [
  "CHARACTER",
  "LOCATION",
  "NPC",
  "ITEM",
  "FACTION",
  "SCENE",
  "EVENT",
  "CONCEPT",
] as const;

export type EntityKind = typeof ENTITY_KINDS[number];

export interface Entity {
  kind: EntityKind;
  label: string;
  attributes?: Record<string, any>;
}

export interface Triple {
  subject: Entity;
  predicate: string;
  object: Entity;
}

export interface DocumentConnections {
  tags: string[];
  mentions: string[];
  links: string[];
  wikilinks: string[];
  entities: Entity[];
  triples: Triple[];
  backlinks: string[];
}

// Color mapping for entity kinds
export const ENTITY_COLORS: Record<EntityKind, string> = {
  CHARACTER: 'hsl(var(--entity-character, 262 83% 58%))', // Purple
  LOCATION: 'hsl(var(--entity-location, 217 91% 60%))',   // Blue
  NPC: 'hsl(var(--entity-npc, 38 92% 50%))',               // Orange
  ITEM: 'hsl(var(--entity-item, 160 84% 39%))',            // Green
  FACTION: 'hsl(var(--entity-faction, 0 84% 60%))',        // Red
  SCENE: 'hsl(var(--entity-scene, 330 81% 60%))',          // Pink
  EVENT: 'hsl(var(--entity-event, 174 84% 40%))',          // Teal
  CONCEPT: 'hsl(var(--entity-concept, 239 84% 67%))',      // Indigo
};

// Hex fallback colors for inline styles
export const ENTITY_HEX_COLORS: Record<EntityKind, string> = {
  CHARACTER: '#8b5cf6',
  LOCATION: '#3b82f6',
  NPC: '#f59e0b',
  ITEM: '#10b981',
  FACTION: '#ef4444',
  SCENE: '#ec4899',
  EVENT: '#14b8a6',
  CONCEPT: '#6366f1',
};

import { logger } from '../utils/logger.js';

export interface ForeignKeyRelation {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
}

export interface TableDependency {
  table: string;
  dependsOn: string[];      // tables this one references (FK parents)
  referencedBy: string[];   // tables that reference this one (FK children)
  views: string[];
  triggers: string[];
  storedProcedures: string[];
}

export interface MigrationBatch {
  batchNumber: number;
  tables: string[];
  reason: string;
}

export interface DependencyMapResult {
  mapId: string;
  mappedAt: string;
  tables: TableDependency[];
  migrationOrder: MigrationBatch[];
  circularReferences: Array<{ tables: string[]; description: string }>;
  orphanForeignKeys: Array<{ table: string; column: string; estimatedOrphans: number }>;
}

export class DependencyScanner {
  private adjacency = new Map<string, Set<string>>();
  private reverseAdjacency = new Map<string, Set<string>>();

  addForeignKey(relation: ForeignKeyRelation): void {
    const from = relation.fromTable;
    const to = relation.toTable;

    if (!this.adjacency.has(from)) this.adjacency.set(from, new Set());
    if (!this.reverseAdjacency.has(to)) this.reverseAdjacency.set(to, new Set());

    this.adjacency.get(from)!.add(to);
    this.reverseAdjacency.get(to)!.add(from);
  }

  computeMigrationOrder(allTables: string[]): MigrationBatch[] {
    const inDegree = new Map<string, number>();
    for (const t of allTables) inDegree.set(t, 0);

    for (const [from, parents] of this.adjacency.entries()) {
      for (const to of parents) {
        if (inDegree.has(from)) {
          inDegree.set(from, (inDegree.get(from) ?? 0) + 1);
        }
      }
    }

    const batches: MigrationBatch[] = [];
    const remaining = new Set(allTables);
    let batchNum = 1;

    while (remaining.size > 0) {
      const batch = [...remaining].filter(t => (inDegree.get(t) ?? 0) === 0);

      if (batch.length === 0) {
        // circular reference — force remaining into one batch
        batches.push({
          batchNumber: batchNum,
          tables: [...remaining],
          reason: 'Circular FK reference — manual review required',
        });
        break;
      }

      batches.push({
        batchNumber: batchNum++,
        tables: batch,
        reason: batch.every(t => !this.adjacency.get(t)?.size)
          ? 'No FK dependencies'
          : `Depends on batch ${batchNum - 2}`,
      });

      for (const t of batch) {
        remaining.delete(t);
        for (const child of this.reverseAdjacency.get(t) ?? []) {
          inDegree.set(child, (inDegree.get(child) ?? 1) - 1);
        }
      }
    }

    return batches;
  }

  detectCircularReferences(allTables: string[]): Array<{ tables: string[]; description: string }> {
    const cycles: Array<{ tables: string[]; description: string }> = [];
    const visited = new Set<string>();
    const stack = new Set<string>();

    const dfs = (node: string, path: string[]): void => {
      visited.add(node);
      stack.add(node);
      for (const neighbor of this.adjacency.get(node) ?? []) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, [...path, neighbor]);
        } else if (stack.has(neighbor)) {
          const cycleStart = path.indexOf(neighbor);
          const cycle = path.slice(cycleStart);
          cycles.push({
            tables: cycle,
            description: `Circular FK: ${cycle.join(' → ')} → ${neighbor}`,
          });
        }
      }
      stack.delete(node);
    };

    for (const t of allTables) {
      if (!visited.has(t)) dfs(t, [t]);
    }

    return cycles;
  }

  buildResult(
    allTables: string[],
    viewMap: Map<string, string[]>,
    triggerMap: Map<string, string[]>,
    spMap: Map<string, string[]>,
  ): DependencyMapResult {
    const tables: TableDependency[] = allTables.map(t => ({
      table: t,
      dependsOn: [...(this.adjacency.get(t) ?? [])],
      referencedBy: [...(this.reverseAdjacency.get(t) ?? [])],
      views: viewMap.get(t) ?? [],
      triggers: triggerMap.get(t) ?? [],
      storedProcedures: spMap.get(t) ?? [],
    }));

    const migrationOrder = this.computeMigrationOrder(allTables);
    const circularReferences = this.detectCircularReferences(allTables);

    logger.info(`Dependency scan: ${allTables.length} tables, ${migrationOrder.length} batches, ${circularReferences.length} cycles`);

    return {
      mapId: `depmap-${Date.now()}`,
      mappedAt: new Date().toISOString(),
      tables,
      migrationOrder,
      circularReferences,
      orphanForeignKeys: [],
    };
  }
}

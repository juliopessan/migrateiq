import { logger } from '../utils/logger.js';

export type PiiType =
  | 'CPF'
  | 'CNPJ'
  | 'EMAIL'
  | 'PHONE'
  | 'FULL_NAME'
  | 'DATE_OF_BIRTH'
  | 'CREDIT_CARD'
  | 'HEALTH_DATA'
  | 'ADDRESS';

export type LgpdCategory = 'Dados Pessoais' | 'Dados Pessoais Sensíveis' | 'Dados de Crianças';

export type MaskingOperation = 'mask' | 'tokenize' | 'pseudonymize' | 'encrypt' | 'drop';

export interface PiiColumn {
  table: string;
  column: string;
  piiType: PiiType;
  lgpdCategory: LgpdCategory;
  confidence: number;
  recommendedOperation: MaskingOperation;
  maskingPattern?: string;
}

export interface PiiScanResult {
  scanId: string;
  scannedAt: string;
  tablesWithPii: string[];
  piiColumns: PiiColumn[];
  sensitiveDataTables: string[];
  maskingRulesRequired: number;
}

const NAME_HINTS: Record<PiiType, string[]> = {
  CPF:          ['cpf', 'documento', 'doc_num', 'doc_cpf', 'nr_cpf'],
  CNPJ:         ['cnpj', 'empresa_doc', 'doc_cnpj', 'nr_cnpj'],
  EMAIL:        ['email', 'e_mail', 'correio', 'mail'],
  PHONE:        ['telefone', 'phone', 'fone', 'celular', 'tel', 'ddd'],
  FULL_NAME:    ['nome', 'name', 'full_name', 'razao_social', 'nome_completo', 'customer_name'],
  DATE_OF_BIRTH:['data_nasc', 'birth_date', 'dob', 'dt_nascimento', 'nascimento'],
  CREDIT_CARD:  ['cartao', 'card_num', 'cc_num', 'credit_card', 'card_number'],
  HEALTH_DATA:  ['diagnostico', 'diagnosis', 'cid', 'health', 'medical', 'prescricao'],
  ADDRESS:      ['endereco', 'address', 'logradouro', 'cep', 'zip', 'cidade', 'bairro'],
};

const REGEX_PATTERNS: Partial<Record<PiiType, RegExp>> = {
  CPF:         /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/,
  CNPJ:        /\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/,
  EMAIL:       /[^@\s]+@[^@\s]+\.[^@\s]+/,
  PHONE:       /(\+55)?\s?\(?\d{2}\)?\s?\d{4,5}-?\d{4}/,
  CREDIT_CARD: /\b(?:\d[ -]?){13,19}\b/,
};

const LGPD_CATEGORY: Record<PiiType, LgpdCategory> = {
  CPF:          'Dados Pessoais',
  CNPJ:         'Dados Pessoais',
  EMAIL:        'Dados Pessoais',
  PHONE:        'Dados Pessoais',
  FULL_NAME:    'Dados Pessoais',
  DATE_OF_BIRTH:'Dados Pessoais',
  ADDRESS:      'Dados Pessoais',
  CREDIT_CARD:  'Dados Pessoais',
  HEALTH_DATA:  'Dados Pessoais Sensíveis',
};

const DEFAULT_OPERATION: Record<PiiType, MaskingOperation> = {
  EMAIL:        'mask',
  CPF:          'tokenize',
  CNPJ:         'tokenize',
  FULL_NAME:    'pseudonymize',
  PHONE:        'mask',
  DATE_OF_BIRTH:'mask',
  ADDRESS:      'pseudonymize',
  CREDIT_CARD:  'tokenize',
  HEALTH_DATA:  'encrypt',
};

export class PiiDetector {
  detectByColumnName(tableName: string, columnName: string): PiiColumn | null {
    const lower = columnName.toLowerCase();
    for (const [piiType, hints] of Object.entries(NAME_HINTS) as [PiiType, string[]][]) {
      if (hints.some(h => lower.includes(h))) {
        return this.buildPiiColumn(tableName, columnName, piiType, 0.85);
      }
    }
    return null;
  }

  detectByPattern(tableName: string, columnName: string, sampleValues: string[]): PiiColumn | null {
    for (const [piiType, regex] of Object.entries(REGEX_PATTERNS) as [PiiType, RegExp][]) {
      const matchCount = sampleValues.filter(v => v && regex.test(v)).length;
      const confidence = matchCount / Math.max(sampleValues.length, 1);
      if (confidence >= 0.5) {
        return this.buildPiiColumn(tableName, columnName, piiType, confidence);
      }
    }
    return null;
  }

  private buildPiiColumn(table: string, column: string, piiType: PiiType, confidence: number): PiiColumn {
    return {
      table,
      column,
      piiType,
      lgpdCategory: LGPD_CATEGORY[piiType],
      confidence,
      recommendedOperation: DEFAULT_OPERATION[piiType],
      maskingPattern: piiType === 'EMAIL' ? '{first_char}***@{domain}' : undefined,
    };
  }

  scanTable(
    tableName: string,
    columns: Array<{ name: string; sampleValues?: string[] }>,
  ): PiiColumn[] {
    const results: PiiColumn[] = [];
    for (const col of columns) {
      const byName = this.detectByColumnName(tableName, col.name);
      if (byName) {
        results.push(byName);
        continue;
      }
      if (col.sampleValues && col.sampleValues.length > 0) {
        const byPattern = this.detectByPattern(tableName, col.name, col.sampleValues);
        if (byPattern) results.push(byPattern);
      }
    }
    return results;
  }

  buildScanResult(allPiiColumns: PiiColumn[]): PiiScanResult {
    const tablesWithPii = [...new Set(allPiiColumns.map(c => c.table))];
    const sensitiveDataTables = [...new Set(
      allPiiColumns
        .filter(c => c.lgpdCategory === 'Dados Pessoais Sensíveis')
        .map(c => c.table),
    )];

    logger.info(`PII scan complete: ${allPiiColumns.length} PII columns across ${tablesWithPii.length} tables`);

    return {
      scanId: `pii-${Date.now()}`,
      scannedAt: new Date().toISOString(),
      tablesWithPii,
      piiColumns: allPiiColumns,
      sensitiveDataTables,
      maskingRulesRequired: allPiiColumns.length,
    };
  }
}

export type Query = Record<string, any>;

export interface TemplateAnalysisRepository {
  list(query?: Query): Promise<any>;
}

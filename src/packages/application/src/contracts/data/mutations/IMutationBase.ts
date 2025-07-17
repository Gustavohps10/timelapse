export interface IMutationBase<T> {
  create(entity: T): Promise<T | null>
  update(id: string, entity: Partial<T>): Promise<T | null>
  delete(id: string): Promise<boolean>
}

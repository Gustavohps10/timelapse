export interface IMutationBase<T> {
  create(entity: T): Promise<T>
  update(id: string, entity: Partial<T>): Promise<T | null>
  delete(id: string): Promise<boolean>
}

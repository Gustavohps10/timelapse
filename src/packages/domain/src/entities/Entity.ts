export type EntityProps<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K]
}

export abstract class Entity {
  protected constructor() {}

  static hydrate<T extends Entity>(data: EntityProps<T>): T {
    const entity = Object.create(this.prototype) as T

    ;(Object.keys(data) as Array<keyof EntityProps<T>>).forEach((key) => {
      ;(entity as any)[key] = data[key]
    })

    return entity
  }
}

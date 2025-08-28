type EntityProps<T> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K]
}

export abstract class Entity {
  protected constructor() {}

  static hydrate<T extends Entity>(
    this: new (...args: any[]) => T,
    data: EntityProps<T>,
  ): T {
    const props: Partial<EntityProps<T>> = {}

    for (const key of Object.keys(data) as (keyof EntityProps<T>)[]) {
      props[key] = data[key]
    }

    return new this(...Object.values(props))
  }
}

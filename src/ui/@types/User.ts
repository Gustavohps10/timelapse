export class Member {
  #id: number
  #login: string
  #firstname: string
  #lastname: string
  #admin: boolean
  #created_on: string
  #last_login_on: string
  #api_key: string
  #custom_fields: { id: number; name: string; value: string }[]

  // Construtor
  constructor(
    id: number,
    login: string,
    firstname: string,
    lastname: string,
    admin: boolean,
    created_on: string,
    last_login_on: string,
    api_key: string,
    custom_fields: { id: number; name: string; value: string }[],
  ) {
    this.#id = id
    this.#login = login
    this.#firstname = firstname
    this.#lastname = lastname
    this.#admin = admin
    this.#created_on = created_on
    this.#last_login_on = last_login_on
    this.#api_key = api_key
    this.#custom_fields = custom_fields
  }

  // Getters e Setters
  get id(): number {
    return this.#id
  }

  set id(value: number) {
    this.#id = value
  }

  get login(): string {
    return this.#login
  }

  set login(value: string) {
    this.#login = value
  }

  get firstname(): string {
    return this.#firstname
  }

  set firstname(value: string) {
    this.#firstname = value
  }

  get lastname(): string {
    return this.#lastname
  }

  set lastname(value: string) {
    this.#lastname = value
  }

  get admin(): boolean {
    return this.#admin
  }

  set admin(value: boolean) {
    this.#admin = value
  }

  get created_on(): string {
    return this.#created_on
  }

  set created_on(value: string) {
    this.#created_on = value
  }

  get last_login_on(): string {
    return this.#last_login_on
  }

  set last_login_on(value: string) {
    this.#last_login_on = value
  }

  get api_key(): string {
    return this.#api_key
  }

  set api_key(value: string) {
    this.#api_key = value
  }

  get custom_fields(): { id: number; name: string; value: string }[] {
    return this.#custom_fields
  }

  set custom_fields(value: { id: number; name: string; value: string }[]) {
    this.#custom_fields = value
  }
}

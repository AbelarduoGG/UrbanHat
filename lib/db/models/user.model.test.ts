import { User } from "./user.model"

describe("User model", () => {
  it("aplica valores por defecto y normaliza email", () => {
    const user = new User({
      name: "Ana",
      email: "  ANA@MAIL.COM  ",
      password: "hashed-password",
    })

    const error = user.validateSync()

    expect(error).toBeUndefined()
    expect(user.role).toBe("buyer")
    expect(user.isActive).toBe(true)
    expect(user.email).toBe("ana@mail.com")
    expect(user.createdAt).toBeInstanceOf(Date)
  })

  it("falla cuando faltan campos requeridos", () => {
    const user = new User({
      email: "x@mail.com",
    })

    const error = user.validateSync()

    expect(error).toBeDefined()
    expect(error?.errors.name).toBeDefined()
    expect(error?.errors.password).toBeDefined()
  })

  it("falla con role fuera del enum", () => {
    const user = new User({
      name: "Carlos",
      email: "carlos@mail.com",
      password: "hashed-password",
      role: "admin",
    })

    const error = user.validateSync()

    expect(error).toBeDefined()
    expect(error?.errors.role).toBeDefined()
  })

  it("define índice único para email", () => {
    const indexes = User.schema.indexes()

    expect(indexes).toEqual(
      expect.arrayContaining([
        [
          { email: 1 },
          expect.objectContaining({ unique: true }),
        ],
      ])
    )
  })
})

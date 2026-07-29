/**
 * Retourne l'erreur levée par `fn`, pour pouvoir la comparer par identité.
 *
 * `expect(fn).toThrow(error)` ne compare que le message, ce qui rend deux erreurs distinctes
 * au libellé identique interchangeables. Plusieurs tests en dépendent — `Result.merge` doit
 * renvoyer la *première* défaillance d'une liste où les messages peuvent coïncider, et
 * `unwrap` doit relancer l'instance stockée, pas une copie.
 */
export function thrownBy(fn: () => unknown): unknown {
  try {
    fn()
  } catch (error) {
    return error
  }

  throw new Error('la fonction devait lever une erreur, elle est retournée normalement')
}

/** Map relative `.js` imports to sibling `.ts` sources for local Node + strip-types. */
export async function resolve(specifier, context, nextResolve) {
  if (specifier.endsWith('.js') && (specifier.startsWith('./') || specifier.startsWith('../'))) {
    const ts = `${specifier.slice(0, -3)}.ts`
    try {
      return await nextResolve(ts, context)
    } catch {
      // fall through
    }
  }
  return nextResolve(specifier, context)
}

import type { ProviderFactory, ProviderRegistry } from './types.js'

/** Build a registry that resolves provider factories by name. */
export function defineProviders(map: Record<string, ProviderFactory>): ProviderRegistry {
  return {
    resolve(name: string): ProviderFactory {
      const factory = map[name]
      if (!factory) throw new Error(`Unknown provider: ${name}`)
      return factory
    },
  }
}

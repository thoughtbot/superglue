import { createContext } from 'react'
import type { CreateAppArgs } from './types'

export const DeepkitContext = createContext<CreateAppArgs['deepkit']>(undefined)

import { createAction } from '@reduxjs/toolkit'
import { SAVE_RESPONSE, BEFORE_VISIT, UPDATE_FRAGMENTS } from '@thoughtbot/superglue'

export const saveResponse = createAction(SAVE_RESPONSE)
export const beforeVisit = createAction(BEFORE_VISIT)
export const updateFragments = createAction(UPDATE_FRAGMENTS)

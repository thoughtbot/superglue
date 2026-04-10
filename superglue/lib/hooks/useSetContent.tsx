import { useDispatch, useSelector } from 'react-redux'
import { Immer } from 'immer'
import { updateContent } from '../actions'
import { RootState, PageKey } from '../types'

const immer = new Immer()
immer.setAutoFreeze(false)

export function useSetContent() {
  const dispatch = useDispatch()
  const pages = useSelector((state: RootState) => state.pages)

  function setter<T = unknown>(
    pageKey: PageKey,
    updater: (draft: T) => void
  ): void {
    const currentData = pages[pageKey]?.data

    if (currentData === undefined) {
      throw new Error(`Page with key "${pageKey}" not found`)
    }

    const updatedData = immer.produce(currentData, updater)

    dispatch(
      updateContent({
        pageKey,
        data: updatedData,
      })
    )
  }

  return setter
}

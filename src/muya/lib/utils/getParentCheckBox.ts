import { CLASS_OR_ID } from '../config'

export const getParentCheckBox = (checkbox: HTMLElement): HTMLElement | null => {
  const parent = checkbox.parentElement!.parentElement!.parentElement!
  if (parent.id !== CLASS_OR_ID.AG_EDITOR_ID) {
    return parent.firstElementChild as HTMLElement | null
  } else {
    return null
  }
}

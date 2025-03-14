export const changeTheme = (): void => {
  if (
    window.matchMedia && 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) 
    document.documentElement.setAttribute("data-theme", "light");
  else
    document.documentElement.setAttribute("data-theme", "dark");
}

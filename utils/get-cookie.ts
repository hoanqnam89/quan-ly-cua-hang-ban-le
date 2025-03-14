export const getCookie = (key: string): string | undefined => {
  const results: RegExpMatchArray | null = 
    document.cookie.match("(^|;)\\s*" + key + "\\s*=\\s*([^;]+)");

  if ( !results )
    return undefined;

  return results.pop();
}

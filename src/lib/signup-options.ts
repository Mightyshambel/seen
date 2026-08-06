export const signupLanguages = [
  { value: "en", label: "English" },
  { value: "it", label: "Italiano" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
  { value: "pt", label: "Português" },
  { value: "ar", label: "العربية" },
  { value: "zh", label: "中文" },
  { value: "hi", label: "हिन्दी" },
  { value: "ja", label: "日本語" },
];

export const signupPronouns = [
  { value: "she-her", label: "she/her" },
  { value: "he-him", label: "he/him" },
  { value: "they-them", label: "they/them" },
  { value: "she-they", label: "she/they" },
  { value: "he-they", label: "he/they" },
  { value: "any", label: "any pronouns" },
  { value: "prefer-not", label: "Prefer not to say" },
];

export const signupLocations = [
  { value: "it", label: "Italy" },
  { value: "de", label: "Germany" },
  { value: "us", label: "United States" },
  { value: "nl", label: "Netherlands" },
  { value: "sa", label: "Saudi Arabia" },
  { value: "au", label: "Australia" },
  { value: "in", label: "India" },
  { value: "jp", label: "Japan" },
  { value: "br", label: "Brazil" },
  { value: "other", label: "Other" },
];

export function pronounLabel(value: string) {
  return signupPronouns.find((option) => option.value === value)?.label ?? value;
}

export function languageLabel(value: string) {
  return signupLanguages.find((option) => option.value === value)?.label ?? value;
}

export function locationLabel(value: string) {
  return signupLocations.find((option) => option.value === value)?.label ?? value;
}
